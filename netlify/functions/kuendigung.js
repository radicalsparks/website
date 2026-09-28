// Kündigungsbutton (§ 312k BGB): nimmt Kündigungen von /kuendigen entgegen.
//
// 1. Plant die Kündigung in Stripe ein, wenn STRIPE_SECRET_KEY gesetzt ist:
//    - im Probetraining: Mitgliedschaft endet mit Ablauf des Probetrainings, keine Zahlung
//    - in der Mindestlaufzeit: Mitgliedschaft endet zum Ende der Mindestlaufzeit
//    - alles andere (außerordentlich, nach der Mindestlaufzeit, unklare Zuordnung): manuell durchs Team
//    Alle Stripe-Aktionen sind umkehrbar (cancel_at bzw. cancel_at_period_end, keine sofortige Löschung).
// 2. Schickt sofort eine Eingangsbestätigung an die Kundin bzw. den Kunden und eine Info ans Team (Brevo).
//
// Umgebungsvariablen in Netlify:
//   BREVO_API_KEY        (vorhanden, wird auch von brevo.js genutzt)
//   STRIPE_SECRET_KEY    (Restricted Key: Customers lesen, Subscriptions schreiben) – optional
//   BREVO_SENDER_EMAIL   (in Brevo verifizierte Absenderadresse, Standard: hello@radical-sparks.com)
//   CANCEL_NOTIFY_EMAIL  (Team-Postfach, Standard: hallo@radicalsparks.de)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Vertrag im Formular -> Stripe-Produkt
const CONTRACTS = {
  '12m':   { label: 'Jahresmitgliedschaft', product: 'prod_VLHTt91NnyVYXD', minTerm: 12 },
  '3m':    { label: '3-Monatsmitgliedschaft', product: 'prod_VLHT311nc0ee8t', minTerm: 3 },
  'pt12m': { label: 'Jahresmitgliedschaft + Personal Training', product: 'prod_VLHTaW4C4JpCvu', minTerm: 12 },
  'pt3m':  { label: '3-Monatsmitgliedschaft + Personal Training', product: 'prod_VLHTOqYnMal1Dq', minTerm: 3 },
  'kurs':  { label: 'Online-Kurs Emotionstraining', product: null },
  'other': { label: 'Sonstiger Vertrag', product: null }
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body)
});

const esc = (v) => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const fmtDate = (ts) => new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric'
}).format(new Date(ts * 1000));

const fmtDateTime = (ts) => new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
}).format(new Date(ts * 1000)) + ' Uhr';

function addMonths(ts, months) {
  const d = new Date(ts * 1000);
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  if (d.getUTCDate() < day) d.setUTCDate(0); // z. B. 31.01. + 1 Monat -> 28./29.02.
  return Math.floor(d.getTime() / 1000);
}

async function stripeCall(key, method, path, params) {
  const opts = { method, headers: { Authorization: 'Bearer ' + key } };
  if (params) {
    opts.headers['content-type'] = 'application/x-www-form-urlencoded';
    opts.body = new URLSearchParams(params).toString();
  }
  const resp = await fetch('https://api.stripe.com/v1' + path, opts);
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error('Stripe ' + resp.status + ': ' + ((data.error && data.error.message) || 'unknown'));
  return data;
}

// Gibt { endTs, action, note } zurück. endTs = null heißt: Team prüft manuell.
async function processStripe(key, form, nowTs) {
  const contract = CONTRACTS[form.contract];
  if (!contract || !contract.product) return { endTs: null, action: 'none', note: 'Kein Mitgliedschafts-Abo, bitte manuell bearbeiten.' };

  const emails = Array.from(new Set([form.email, form.email.toLowerCase()]));
  let subs = [];
  for (const email of emails) {
    const customers = await stripeCall(key, 'GET', '/customers?limit=10&email=' + encodeURIComponent(email));
    for (const c of customers.data || []) {
      const list = await stripeCall(key, 'GET', '/subscriptions?status=all&limit=20&customer=' + c.id);
      subs = subs.concat((list.data || []).filter((s) =>
        ['trialing', 'active', 'past_due'].includes(s.status) &&
        s.items && s.items.data.some((it) => it.price && it.price.product === contract.product)
      ));
    }
  }
  subs = subs.filter((s, i) => subs.findIndex((x) => x.id === s.id) === i);

  if (subs.length === 0) return { endTs: null, action: 'none', note: 'Kein laufendes Abo zu dieser E-Mail und diesem Vertrag in Stripe gefunden.' };
  if (subs.length > 1) return { endTs: null, action: 'none', note: 'Mehrere passende Abos gefunden (' + subs.map((s) => s.id).join(', ') + '), bitte manuell bearbeiten.' };

  const sub = subs[0];
  if (sub.cancel_at) return { endTs: sub.cancel_at, action: 'already', note: 'Abo ' + sub.id + ' war bereits zum ' + fmtDate(sub.cancel_at) + ' gekündigt.' };
  if (form.type === 'ausserordentlich') return { endTs: null, action: 'none', note: 'Außerordentliche Kündigung für Abo ' + sub.id + ', bitte Grund prüfen und manuell bearbeiten.' };

  const requestedTs = form.timing === 'date' && form.date ? Math.floor(new Date(form.date + 'T00:00:00+01:00').getTime() / 1000) : 0;

  // Probetraining: endet mit Ablauf des Probetrainings, keine Zahlung
  if (sub.status === 'trialing' && sub.trial_end && (!requestedTs || requestedTs <= sub.trial_end)) {
    await stripeCall(key, 'POST', '/subscriptions/' + sub.id, { cancel_at_period_end: 'true' });
    return { endTs: sub.trial_end, action: 'trial', note: 'Abo ' + sub.id + ' endet mit dem Probetraining am ' + fmtDateTime(sub.trial_end) + ', keine Zahlung.' };
  }

  const months = parseInt((sub.metadata && sub.metadata.min_term_months) || '', 10) || contract.minTerm;
  if (!months) return { endTs: null, action: 'none', note: 'Abo ' + sub.id + ' hat keine hinterlegte Mindestlaufzeit, bitte manuell bearbeiten.' };

  const minEnd = addMonths(sub.trial_end || sub.start_date, months);
  if (nowTs >= minEnd) return { endTs: null, action: 'none', note: 'Abo ' + sub.id + ' ist nach der Mindestlaufzeit (Ende war ' + fmtDate(minEnd) + '). Bitte mit 1 Monat Frist manuell beenden und Vorauszahlungen anteilig erstatten.' };

  const endTs = Math.max(minEnd, requestedTs);
  await stripeCall(key, 'POST', '/subscriptions/' + sub.id, { cancel_at: String(endTs), proration_behavior: 'none' });
  return { endTs, action: 'min_term', note: 'Abo ' + sub.id + ' endet zum ' + fmtDate(endTs) + ' (Ende der Mindestlaufzeit ' + fmtDate(minEnd) + ').' };
}

async function sendMail(brevoKey, payload) {
  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    console.error('Brevo send failed', resp.status, await resp.text().catch(() => ''));
    return false;
  }
  return true;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  const BREVO_KEY = process.env.BREVO_API_KEY;
  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  const SENDER = process.env.BREVO_SENDER_EMAIL || 'hello@radical-sparks.com';
  const TEAM = process.env.CANCEL_NOTIFY_EMAIL || 'hallo@radicalsparks.de';
  if (!BREVO_KEY) return json(500, { error: 'Server misconfigured' });

  let form;
  try { form = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Invalid JSON' }); }

  if (form.website) return json(200, { ok: true }); // Honeypot: Bots bekommen ein stilles OK

  form.name = String(form.name || '').trim().slice(0, 120);
  form.email = String(form.email || '').trim().slice(0, 200);
  form.ref = String(form.ref || '').trim().slice(0, 120);
  form.reason = String(form.reason || '').trim().slice(0, 2000);
  if (!form.name || !EMAIL_RE.test(form.email)) return json(400, { error: 'Bitte Name und gültige E-Mail angeben.' });
  if (!CONTRACTS[form.contract]) return json(400, { error: 'Bitte einen Vertrag auswählen.' });
  if (!['ordentlich', 'ausserordentlich'].includes(form.type)) return json(400, { error: 'Bitte die Art der Kündigung wählen.' });
  if (form.type === 'ausserordentlich' && !form.reason) return json(400, { error: 'Bitte gib bei einer außerordentlichen Kündigung den Grund an.' });
  if (!['asap', 'date'].includes(form.timing)) return json(400, { error: 'Bitte den Zeitpunkt wählen.' });
  if (form.timing === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(form.date || ''))) return json(400, { error: 'Bitte ein gültiges Datum angeben.' });

  const nowTs = Math.floor(Date.now() / 1000);
  const receivedAt = fmtDateTime(nowTs);
  const contractLabel = CONTRACTS[form.contract].label;
  const typeLabel = form.type === 'ordentlich' ? 'Ordentliche Kündigung' : 'Außerordentliche Kündigung';
  const timingLabel = form.timing === 'asap'
    ? 'Zum nächstmöglichen Zeitpunkt'
    : 'Zum ' + form.date.split('-').reverse().join('.') + ' oder, falls vertraglich erst später möglich, zum nächstmöglichen Zeitpunkt';

  let result = { endTs: null, action: 'none', note: 'Kein Stripe-Schlüssel hinterlegt, bitte manuell in Stripe bearbeiten.' };
  if (STRIPE_KEY) {
    try { result = await processStripe(STRIPE_KEY, form, nowTs); }
    catch (err) { console.error(err); result = { endTs: null, action: 'error', note: 'Stripe-Fehler: ' + err.message + '. Bitte manuell bearbeiten.' }; }
  }
  const endText = result.endTs
    ? (result.action === 'trial'
        ? 'Deine Mitgliedschaft endet mit Ablauf deines Probetrainings am ' + fmtDateTime(result.endTs) + '. Es wird keine Zahlung fällig.'
        : 'Deine Mitgliedschaft endet zum ' + fmtDate(result.endTs) + '.')
    : 'Wir prüfen deine Kündigung und teilen dir den genauen Beendigungszeitpunkt innerhalb von 2 Werktagen per E-Mail mit.';

  const rows = [
    ['Eingang', receivedAt],
    ['Name', form.name],
    ['E-Mail', form.email],
    ['Vertrag', contractLabel],
    ['Vertragsnummer / Bestelldatum', form.ref || '–'],
    ['Art der Kündigung', typeLabel],
    ['Zeitpunkt', timingLabel]
  ];
  if (form.type === 'ausserordentlich') rows.push(['Grund', form.reason]);
  const table = '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">' +
    rows.map((r) => '<tr><td style="color:#555;vertical-align:top;">' + esc(r[0]) + '</td><td><strong>' + esc(r[1]) + '</strong></td></tr>').join('') +
    '</table>';

  const customerHtml =
    '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#16231d;">' +
    '<p>Hallo ' + esc(form.name) + ',</p>' +
    '<p>deine Kündigung ist am ' + esc(receivedAt) + ' bei uns eingegangen. Das ist deine Bestätigung.</p>' +
    table +
    '<p><strong>' + esc(endText) + '</strong></p>' +
    '<p>Wenn etwas nicht stimmt, antworte einfach auf diese E-Mail.</p>' +
    '<p>Alles Liebe<br>Alexandra &amp; Julia<br>Radical Sparks · AB-Education UG (haftungsbeschränkt)</p></div>';

  const teamHtml =
    '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">' +
    '<p><strong>Neue Kündigung über den Kündigungsbutton.</strong></p>' + table +
    '<p><strong>Stripe:</strong> ' + esc(result.note) + '</p>' +
    '<p><strong>Nächster Schritt:</strong> ' + (result.endTs ? 'Zugang im Mitgliederbereich zum Vertragsende entfernen.' : 'Manuell in Stripe bearbeiten und der Person das Vertragsende mitteilen.') + '</p></div>';

  const teamOk = await sendMail(BREVO_KEY, {
    sender: { email: SENDER, name: 'Radical Sparks Website' },
    to: [{ email: TEAM }],
    replyTo: { email: form.email, name: form.name },
    subject: 'Kündigung: ' + contractLabel + ' – ' + form.name,
    htmlContent: teamHtml
  });
  const customerOk = await sendMail(BREVO_KEY, {
    sender: { email: SENDER, name: 'Radical Sparks' },
    to: [{ email: form.email, name: form.name }],
    replyTo: { email: TEAM },
    subject: 'Bestätigung deiner Kündigung – Radical Sparks',
    htmlContent: customerHtml
  });

  if (!teamOk && !customerOk) return json(502, { error: 'Mail delivery failed' });

  return json(200, {
    ok: true,
    receivedAt,
    contract: contractLabel,
    type: typeLabel,
    timing: timingLabel,
    endText,
    emailSent: customerOk
  });
};

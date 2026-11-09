// Server-side proxy for Brevo calls so the API key never reaches the browser.
// Requires the BREVO_API_KEY environment variable to be set in Netlify
// (Site configuration -> Environment variables).

const ALLOWED_LIST_IDS = [9, 10, 11];
const ALLOWED_TEMPLATE_IDS = [16, 17, 18, 19, 20];
const ALLOWED_CONFIRM_URL_PREFIX = 'https://www.radical-sparks.com/';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Newsletter + Freebie "Nervensystem Reset" (Double-Opt-in)
// NEWSLETTER_LIST_ID: ID der Brevo-Liste "Newsletter" eintragen, sobald die Liste angelegt ist.
const NEWSLETTER_LIST_ID = 13; // "Radical Sparks – Newsletter"
const NL_DOI_TEMPLATE_ID = 39;      // "RS – Newsletter + Freebie: Anmeldung bestätigen (DOI)"
const NL_WELCOME_TEMPLATE_ID = 40;  // "RS – Newsletter + Freebie: Willkommen mit Nervensystem Reset"
const ALLOWED_HOST_RE = /^(www\.radical-sparks\.com|deploy-preview-\d+--radical-sparks\.netlify\.app)$/;
const crypto = require('crypto');

function nlToken(email, secret) {
  return crypto.createHmac('sha256', secret).update('nl:' + email.toLowerCase()).digest('hex').slice(0, 32);
}

async function brevoSend(key, email, templateId, params) {
  const payload = { to: [{ email: email }], templateId: templateId };
  if (params) payload.params = params;
  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    console.error('Brevo send failed', templateId, resp.status, errText);
  }
  return resp.ok;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const BREVO_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action, email, listId, templateId, params } = data;

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
  }

  try {
    if (action === 'addContact') {
      if (!ALLOWED_LIST_IDS.includes(listId)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid listId' }) };
      }
      const resp = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': BREVO_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ email: email, listIds: [listId], updateEnabled: true })
      });
      if (!resp.ok && resp.status !== 204) {
        return { statusCode: 502, body: JSON.stringify({ error: 'Brevo error' }) };
      }
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'sendEmail') {
      if (!ALLOWED_TEMPLATE_IDS.includes(templateId)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid templateId' }) };
      }
      const payload = { to: [{ email: email }], templateId: templateId };
      if (params && typeof params === 'object') {
        if (typeof params.confirmUrl === 'string') {
          if (!params.confirmUrl.startsWith(ALLOWED_CONFIRM_URL_PREFIX)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid confirmUrl' }) };
          }
        }
        payload.params = params;
      }
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': BREVO_KEY, 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        console.error('Brevo sendEmail failed', resp.status, errText);
        return { statusCode: 502, body: JSON.stringify({ error: 'Brevo error' }) };
      }
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'newsletterOptin') {
      if (!NEWSLETTER_LIST_ID) {
        return { statusCode: 503, body: JSON.stringify({ error: 'Newsletter list not configured' }) };
      }
      const host = String((event.headers && (event.headers['x-forwarded-host'] || event.headers.host)) || '').toLowerCase();
      const base = ALLOWED_HOST_RE.test(host) ? 'https://' + host : 'https://www.radical-sparks.com';
      const src = typeof data.source === 'string' ? data.source.replace(/[^a-z0-9-]/gi, '').slice(0, 20) : '';
      const confirmUrl = base + '/confirm.html?s=3&e=' + encodeURIComponent(Buffer.from(email).toString('base64'))
        + '&t=' + nlToken(email, BREVO_KEY) + (src ? '&src=' + src : '');
      const ok = await brevoSend(BREVO_KEY, email, NL_DOI_TEMPLATE_ID, { confirmUrl: confirmUrl });
      return ok ? { statusCode: 200, body: JSON.stringify({ ok: true }) }
                : { statusCode: 502, body: JSON.stringify({ error: 'Brevo error' }) };
    }

    if (action === 'newsletterConfirm') {
      if (!NEWSLETTER_LIST_ID) {
        return { statusCode: 503, body: JSON.stringify({ error: 'Newsletter list not configured' }) };
      }
      const t = typeof data.token === 'string' ? data.token : '';
      const expected = nlToken(email, BREVO_KEY);
      if (t.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(t), Buffer.from(expected))) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid token' }) };
      }
      const resp = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': BREVO_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ email: email, listIds: [NEWSLETTER_LIST_ID], updateEnabled: true })
      });
      if (!resp.ok && resp.status !== 204) {
        return { statusCode: 502, body: JSON.stringify({ error: 'Brevo error' }) };
      }
      await brevoSend(BREVO_KEY, email, NL_WELCOME_TEMPLATE_ID);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};

// Geplante Funktion: macht die Webinar-Zahlungslinks ab 07.10.2026, 00:00 Uhr (Berlin) ungültig.
// Zeitplan steht in netlify.toml (06.10. um 22:00 UTC = 07.10. um 00:00 Uhr MESZ).
// Benötigt STRIPE_SECRET_KEY mit der Berechtigung "Payment Links: schreiben".
// Läuft die Funktion vor Fristende (z. B. manuell ausgelöst), passiert nichts.

const OFFER_END = Date.parse('2026-10-06T22:00:00Z');

const WEBINAR_LINKS = [
  'plink_1UKbA4DGOeeGkFKug12sfRIJ', // 12 Monate, Einmalzahlung 270 €
  'plink_1UKbA5DGOeeGkFKu91Gyidfc', // 12 Monate, 12 x 22,50 €
  'plink_1UKbA6DGOeeGkFKuK0EeQjEB', // 12 Monate, 4 x 67,50 €
  'plink_1UKbA6DGOeeGkFKu8XDg7ERf', // 3 Monate, Einmalzahlung 119 €
  'plink_1UKbA7DGOeeGkFKuI3WhOevX'  // 3 Monate, 3 x 39,66 €
];

exports.handler = async () => {
  if (Date.now() < OFFER_END) {
    console.log('Webinar-Angebot läuft noch, keine Änderung.');
    return { statusCode: 200, body: 'not yet' };
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('STRIPE_SECRET_KEY fehlt, Links bitte manuell in Stripe deaktivieren.');
    return { statusCode: 500, body: 'missing key' };
  }
  const results = [];
  for (const id of WEBINAR_LINKS) {
    const resp = await fetch('https://api.stripe.com/v1/payment_links/' + id, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'content-type': 'application/x-www-form-urlencoded' },
      body: 'active=false'
    });
    results.push(id + ': ' + resp.status);
  }
  console.log('Webinar-Links deaktiviert:', results.join(', '));
  return { statusCode: 200, body: results.join('\n') };
};

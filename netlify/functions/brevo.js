// Server-side proxy for Brevo calls so the API key never reaches the browser.
// Requires the BREVO_API_KEY environment variable to be set in Netlify
// (Site configuration -> Environment variables).

const ALLOWED_LIST_IDS = [9, 10, 11];
const ALLOWED_TEMPLATE_IDS = [16, 17, 18, 19, 20];
const ALLOWED_CONFIRM_URL_PREFIX = 'https://www.radical-sparks.com/';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};

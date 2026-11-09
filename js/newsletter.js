// Newsletter + Freebie "Nervensystem Reset": Formulare mit class="rs-nl" (Double-Opt-in über /.netlify/functions/brevo)
(function () {
  var css = '' +
    '.rs-nl form{display:flex;flex-direction:column;gap:12px;max-width:520px}' +
    '.rs-nl .rs-nl-row{display:flex;gap:10px;flex-wrap:wrap}' +
    '.rs-nl input[type=email]{flex:1 1 200px;min-width:0;width:100%;padding:15px 18px;background:rgba(245,241,228,.08);border:1px solid rgba(245,241,228,.3);border-radius:6px;color:#f5f1e4;font-family:Poppins,sans-serif;font-size:16px;outline:none}' +
    '.rs-nl input[type=email]::placeholder{color:rgba(245,241,228,.55)}' +
    '.rs-nl input[type=email]:focus{border-color:#ffde59}' +
    '.rs-nl button{background:#ffde59;color:#16231d;border:0;border-radius:6px;padding:15px 26px;font-family:Poppins,sans-serif;font-size:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}' +
    '.rs-nl button:hover{background:#ff914d}.rs-nl button[disabled]{opacity:.6;cursor:wait}' +
    '.rs-nl label{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.55;color:rgba(245,241,228,.66);cursor:pointer}' +
    '.rs-nl label input{flex-shrink:0;width:17px;height:17px;margin-top:2px;accent-color:#ffde59}' +
    '.rs-nl label a{color:#ffde59}' +
    '.rs-nl .rs-nl-ok,.rs-nl .rs-nl-err{border-radius:6px;padding:16px 18px;max-width:520px;font-size:15px;line-height:1.55}' +
    '.rs-nl .rs-nl-ok{background:rgba(255,222,89,.12);border:1px solid rgba(255,222,89,.4);color:#f5f1e4}' +
    '.rs-nl .rs-nl-ok b{color:#ffde59;display:block;margin-bottom:4px}' +
    '.rs-nl .rs-nl-err{background:rgba(180,40,40,.18);color:#ffc4c4;margin-top:10px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  document.querySelectorAll('.rs-nl').forEach(function (box) {
    var form = box.querySelector('form');
    var ok = box.querySelector('.rs-nl-ok');
    var err = box.querySelector('.rs-nl-err');
    var btn = form.querySelector('button');
    var label = btn.textContent;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var email = form.querySelector('input[type=email]').value.trim();
      btn.disabled = true; btn.textContent = '…'; err.hidden = true;
      try {
        var r = await fetch('/.netlify/functions/brevo', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'newsletterOptin', email: email, source: box.getAttribute('data-source') || '' })
        });
        if (!r.ok) throw new Error(r.status);
        form.hidden = true; ok.hidden = false;
        if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'Freebie Nervensystem Reset' });
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { method: 'newsletter_freebie', source: box.getAttribute('data-source') || '' });
      } catch (x) {
        err.hidden = false; btn.disabled = false; btn.textContent = label;
      }
    });
  });
})();

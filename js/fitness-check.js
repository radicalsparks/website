// Fitness-Check: Quiz, Mail-Anmeldung (Double-Opt-in über /.netlify/functions/brevo) und Ergebnisanzeige
(function () {
  var D = window.RS_FC; if (!D) return;
  var $ = function (id) { return document.getElementById(id); };
  var views = ['fc-intro', 'fc-quiz', 'fc-mail', 'fc-sent', 'fc-result'];
  var answers = [], idx = 0, order = [], started = false;

  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }
  function show(id) {
    views.forEach(function (v) { $(v).hidden = v !== id; });
  }
  function scrollToApp() {
    var el = $('fc-app'); var y = el.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render() {
    var q = D.questions[idx];
    $('fc-count').textContent = 'Frage ' + (idx + 1) + ' von ' + D.questions.length;
    $('fc-bar').style.width = ((idx + 1) / D.questions.length * 100) + '%';
    $('fc-q').textContent = q.q;
    if (!order[idx]) order[idx] = shuffle(q.a);
    var box = $('fc-opts'); box.innerHTML = '';
    order[idx].forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'fc-opt' + (answers[idx] === opt[0] ? ' sel' : '');
      b.textContent = opt[1];
      b.addEventListener('click', function () { choose(opt[0], b); });
      box.appendChild(b);
    });
    $('fc-back').style.visibility = idx === 0 ? 'hidden' : 'visible';
  }
  function choose(stufe, btn) {
    answers[idx] = stufe;
    Array.prototype.forEach.call(document.querySelectorAll('.fc-opt'), function (x) { x.classList.remove('sel'); });
    btn.classList.add('sel');
    setTimeout(function () {
      if (idx < D.questions.length - 1) { idx++; render(); scrollToApp(); }
      else { show('fc-mail'); track('fitness_check_complete'); scrollToApp(); setTimeout(function () { $('fc-email').focus(); }, 400); }
    }, 220);
  }
  function start() {
    if (!started) { started = true; track('fitness_check_start'); }
    if ($('fc-result').hidden === false) { answers = []; order = []; }
    idx = 0; show('fc-quiz'); render();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-fc-start]'), function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); start(); scrollToApp(); });
  });
  $('fc-back').addEventListener('click', function () { if (idx > 0) { idx--; render(); } });

  $('fc-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!this.reportValidity()) return;
    var btn = $('fc-submit'), label = btn.textContent;
    btn.disabled = true; btn.textContent = '…'; $('fc-err').hidden = true;
    try {
      var r = await fetch('/.netlify/functions/brevo', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'checkOptin', email: $('fc-email').value.trim(), answers: answers.join(''), source: new URLSearchParams(location.search).get('src') || 'landingpage' })
      });
      if (!r.ok) throw new Error(r.status);
      show('fc-sent'); scrollToApp();
      if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'Fitness-Check' });
      track('generate_lead', { method: 'fitness_check' });
    } catch (x) {
      $('fc-err').hidden = false; btn.disabled = false; btn.textContent = label;
    }
  });

  // Ergebnis anzeigen (nach Bestätigung über confirm.html weitergeleitet: ?ergebnis=1..4&w=2.4)
  var p = new URLSearchParams(location.search), st = parseInt(p.get('ergebnis'), 10);
  if (st >= 1 && st <= 4) {
    var R = D.results[st], w = parseFloat(p.get('w'));
    var block = function (lab, txt, lead) { return txt ? '<h4>' + lab + '</h4><p>' + (lead ? '<i>' + esc(lead) + '</i> · ' : '') + esc(txt) + '</p>' : ''; };
    $('fc-result').innerHTML =
      '<span class="eyebrow">Dein Ergebnis</span><h2><em>' + esc(R.typ) + '</em></h2>' +
      '<p class="claim">' + esc(R.claim) + '</p><p>' + esc(R.intro) + '</p>' +
      block('Anzeichen', R.anzeichen) + block('Typisches Verhalten', R.verhalten) +
      '<div class="kennst"><h4 style="margin-top:0">Kennst du das?</h4><p style="margin:0">' + esc(R.kennst) + '</p></div>' +
      block(R.saetzeLabel, R.saetze, R.saetzeLead) + block('Was das nicht heißt', R.nicht) + block('Dein nächstes Level', R.level) +
      '<div class="fc-next"><h4 style="margin-top:0">Dein nächster Schritt</h4><p style="margin:0 0 20px">' + esc(R.schritt) + '</p>' +
      '<a class="btn btn-primary" href="emotions-gym.html">Kostenlosen Probemonat starten</a></div>' +
      (w >= 1 && w <= 4 ? '<p class="fc-wert">Dein Fitness-Wert: <b>' + String(w).replace('.', ',') + '</b> (auf einer Skala von 1 bis 4). Mach den Check in ein paar Wochen nochmal, dann siehst du, wie du dich entwickelst. Dein Ergebnis hast du auch per Mail bekommen.</p>' : '');
    show('fc-result');
    window.addEventListener('load', function () { setTimeout(scrollToApp, 300); });
  }
})();

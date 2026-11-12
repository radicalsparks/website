// Fitness-Check "Wie holst du dir deinen Spark zurück?"
// Quelle: Doc https://claude.ai/artifact/9eQFtfAV2gvUPrDYLdwDSw (Stand 12.11.2026)
// Jede Antwort hat eine Stufe 1 bis 4 (wird nicht angezeigt). Auswertung: Mehrheit, bei Gleichstand die niedrigere Stufe.
window.RS_FC = {
  questions: [
    { q: 'Wenn du an das Leben denkst, das du dir eigentlich wünschst: Was beschreibt das am besten?', a: [
      [1, 'Ich hab keine klare Vorstellung, nur ein Gefühl, dass da mehr sein müsste.'],
      [2, 'Ich weiß ziemlich genau, was ich mir wünsche, aber ich hab noch keinen konkreten Schritt dahin gemacht.'],
      [3, 'Ich hab schon Schritte unternommen, aber ich fall immer wieder ins Alte zurück.'],
      [4, 'Ich arbeite regelmäßig darauf hin und komme spürbar voran, auch wenn’s mich noch Kraft kostet.']] },
    { q: 'Wenn du an deine Partnerschaft denkst (oder an dein Verhältnis zur Liebe, falls du Single bist): Was trifft am ehesten zu?', a: [
      [1, 'Ich weiß eigentlich gar nicht genau, was ich mir hier wünsche, nur, dass etwas fehlt.'],
      [2, 'Ich weiß, was ich mir wünsche, aber ich trau mich nicht, danach zu handeln.'],
      [3, 'Ich hab schon angefangen, was zu verändern, aber sobald’s unbequem wird, fall ich zurück in alte Muster.'],
      [4, 'Ich arbeite kontinuierlich an mehr Nähe oder Verbindlichkeit, auch wenn’s mich noch Überwindung kostet.']] },
    { q: 'In deinen engsten Beziehungen (Familie, Kinder, Freundinnen): Was beschreibt dich am besten?', a: [
      [1, 'Ich kann kaum sagen, was mir hier eigentlich fehlt.'],
      [2, 'Ich merk genau, was ich mir wünsche, aber ich mach nichts, um es zu verändern.'],
      [3, 'Ich hab schon mal versucht, mehr Nähe zu suchen, aber ich zieh mich schnell wieder zurück.'],
      [4, 'Ich pflege bewusst tiefere Verbindungen, auch wenn’s Verletzlichkeit braucht.']] },
    { q: 'Wenn’s um Geld geht: Was trifft am ehesten zu?', a: [
      [1, 'Ich weiß nicht mal genau, was „finanzielle Freiheit“ für mich persönlich bedeuten würde.'],
      [2, 'Ich weiß genau, was ich verändern müsste, aber ich schieb’s vor mir her.'],
      [3, 'Ich hab schon Anläufe gemacht, aber nach ein paar Wochen fall ich zurück in alte Gewohnheiten.'],
      [4, 'Ich setz konsequent um, was ich mir vorgenommen habe, auch wenn’s noch Überwindung kostet.']] },
    { q: 'Bei deiner Arbeit oder deinem Beruf: Was beschreibt dich am besten?', a: [
      [1, 'Ich hab keine klare Vorstellung, was mich wirklich erfüllen würde.'],
      [2, 'Ich weiß, was ich verändern will, aber ich komme nicht in die Umsetzung.'],
      [3, 'Ich hab schon losgelegt, aber sobald’s schwierig wird, verliere ich den Antrieb.'],
      [4, 'Ich bleib dran an dem, was mir wichtig ist, auch an schwierigen Tagen.']] },
    { q: 'Wenn’s um Zeit für dich und deine Energie geht: Was trifft zu?', a: [
      [1, 'Ich weiß gar nicht mehr richtig, was mir guttun würde, wenn ich mal Zeit für mich hätte.'],
      [2, 'Ich weiß genau, was mir guttun würde, aber am Ende des Tages bleibt für mich nichts übrig.'],
      [3, 'Ich nehme mir immer wieder Zeit für mich, aber sobald es voll wird, fällt sie als Erstes weg.'],
      [4, 'Ich halte mir regelmäßig Zeit für mich frei, auch wenn alle anderen auch etwas von mir wollen.']] },
    { q: 'Wenn du an dein Verhältnis zu dir selbst denkst: Was beschreibt dich am ehesten?', a: [
      [1, 'Ich kenn mich selbst kaum gut genug, um zu wissen, was ich brauche.'],
      [2, 'Ich weiß, was mir guttun würde, mach’s aber nicht.'],
      [3, 'Ich übe mich immer wieder darin, falle aber schnell in alte Selbstkritik zurück.'],
      [4, 'Ich bin mir selbst regelmäßig ein guter Begleiter, auch wenn’s Übung braucht.']] },
    { q: 'Wenn du dir ein neues Ziel setzt, was passiert meistens?', a: [
      [1, 'Ich setz mir eigentlich selten wirklich konkrete Ziele, es bleibt meist vage.'],
      [2, 'Ich setz mir das Ziel, aber der erste Schritt bleibt aus.'],
      [3, 'Ich starte voller Motivation, aber nach ein paar Tagen oder Wochen ebbt’s ab.'],
      [4, 'Ich bleib dran, auch wenn die Anfangsmotivation nachlässt.']] },
    { q: 'Wenn ein Rückschlag kommt, was ist deine typische Reaktion?', a: [
      [1, 'Ich merk’s oft nicht mal richtig, weil ich noch gar nicht wirklich unterwegs war.'],
      [2, 'Ich denk drüber nach, was ich anders machen müsste, aber änder selten was.'],
      [3, 'Ich breche meistens ab und fang irgendwann wieder ganz von vorne an.'],
      [4, 'Ich akzeptiere es, nehme wahr, was es mit mir macht, und mach dann weiter, auch wenn’s unbequem ist.']] },
    { q: 'Welcher Satz kommt dir am häufigsten, wenn’s um Veränderung geht?', a: [
      [1, '„Ich weiß nicht mal, was ich eigentlich will.“'],
      [2, '„Ich weiß, was ich will, aber … (noch nicht bereit / keine Zeit / erst wenn …)“'],
      [3, '„Ich hab’s doch schon so oft versucht.“'],
      [4, '„Ich bleib dran, auch wenn’s schwerfällt.“']] }
  ],
  results: {
    1: {
      typ: 'Klarheit finden',
      claim: 'Dein Spark kommt zurück, wenn du spürst, was du wirklich willst.',
      intro: 'Du ahnst, dass in deinem Leben mehr möglich wäre. Aber es ist noch kein klares Bild, eher ein diffuses Gefühl, dass etwas fehlt. Dich festzulegen fühlt sich schwer an, vielleicht sogar riskant. Und im Alltag, zwischen allem, was erledigt werden muss, kommst du kaum dazu, mal hinzuspüren.',
      anzeichen: 'Du tust dich schwer, ein konkretes Ziel zu benennen · Du beneidest andere, die „einfach wissen, was sie wollen“ · Fragen nach deinen Wünschen fühlen sich unangenehm konkret an · Du wechselst innerlich oft zwischen verschiedenen Wünschen, ohne bei einem zu bleiben · Wenn dich jemand fragt „Was willst du eigentlich?“, kommt oft erstmal ein Schulterzucken · Du sagst schnell „Ist doch eigentlich alles ganz okay so“, auch wenn sich innerlich etwas anderes meldet.',
      verhalten: 'Du bleibst absichtlich vage, um dich nicht festlegen zu müssen · Du wartest auf den „richtigen Moment“, um dir klarzuwerden · Du lenkst dich eher ab, statt in Ruhe hinzuspüren, was du eigentlich willst.',
      kennst: 'Jemand fragt dich beim Abendessen: „Und, was würdest du dir denn wünschen, wenn du’s dir aussuchen könntest?“ Und du merkst, wie du innerlich kurz blockierst, bevor du irgendeine halbwegs plausible Antwort gibst, die sich nicht wirklich nach dir anfühlt.',
      saetzeLabel: 'Häufige Ängste und Glaubenssätze',
      saetzeLead: '„Ich weiß nicht, was ich wirklich will.“',
      saetze: '„Was, wenn ich mich festlege und es ist das Falsche?“ · „Andere wissen genau, was sie wollen, ich nicht.“ · „Wenn ich mir was wünsche und es nicht bekomme, ist das schlimmer, als nie was gewollt zu haben.“',
      nicht: 'Das bedeutet nicht, dass mit dir was nicht stimmt oder dass du „orientierungslos“ bist. Unklarheit ist oft selbst ein Schutzmechanismus: Ein Wunsch, den man nicht ausspricht, kann auch nicht enttäuscht werden.',
      level: 'Klarheit ist kein Zufall, den manche Menschen einfach haben und andere nicht. Sie ist eine Fähigkeit, die du trainieren kannst, genau wie jede andere. Sie entsteht nicht durchs Nachdenken, sondern durchs Fühlen. Genau das trainierst du am Anfang im Emotions-Gym: Du schaust dir verschiedene Lebensbereiche an, findest Menschen und Vorbilder, die dir zeigen, was für dich möglich wäre, und holst dir aktiv zurück, was du dir wirklich wünschst. Das ist der Moment, an dem dein Spark zurückkommt und alles andere leichter wird.',
      schritt: 'Im Emotions-Gym findest du heraus, was du wirklich willst, über das Fühlen statt übers Grübeln. Probier es einen Monat kostenlos aus und hol dir deinen Spark zurück.'
    },
    2: {
      typ: 'Den ersten Schritt gehen',
      claim: 'Dein Spark kommt zurück, wenn du dem Gefühl begegnest, das dich bisher zurückhält.',
      intro: 'Du weißt ziemlich genau, was du dir wünschst. Aber sobald’s konkret wird, hält dich etwas zurück, meistens ein Gefühl, das du noch nicht klar benennen kannst. Und weil immer etwas anderes wichtiger ist, rutscht dein Wunsch jeden Tag ein Stück weiter nach hinten.',
      anzeichen: 'Du hast eine klare Vorstellung, aber keinen einzigen Schritt in diese Richtung gemacht · Du findest immer neue gute Gründe, warum „jetzt nicht der richtige Moment ist“ · Du kennst den nächsten Schritt genau, aber er bleibt seit Wochen oder Monaten auf deiner To-do-Liste stehen · Andere fragen dich manchmal, warum du „es nicht einfach machst“, und du hast selbst keine gute Antwort darauf.',
      verhalten: 'Endloses Vorbereiten und Recherchieren statt Handeln · Aufschieben, bis „die Bedingungen stimmen“ · Endlose Gedankenschleifen, wiederkehrende Zweifel, hin- und hergerissen sein zwischen Ja und Nein · Du redest oft darüber, was du vorhast, aber der erste echte Schritt bleibt aus.',
      kennst: 'Der Entwurf ist fertig, die Nachricht ist geschrieben, das Ticket liegt schon im Warenkorb. Und dann findest du doch noch einen Grund, es heute nicht abzuschicken. „Morgen hab ich mehr Ruhe dafür.“',
      saetzeLabel: 'Häufige Ängste und Glaubenssätze',
      saetzeLead: '„Ich bin noch nicht bereit.“',
      saetze: '„Was, wenn ich’s versuche und scheitere? Was, wenn ich mich blamiere, verletzt werde oder es nachher schlimmer ist als vorher?“ · „Erst wenn XYZ, dann fang ich an.“ · „Ich brauche noch mehr Informationen, bevor ich loslegen kann.“',
      nicht: 'Wenn dein Kopf dir gerade tausend gute Gründe liefert, ist das meistens ein Zeichen, dass etwas in dir sich vor einem bestimmten Gefühl schützt. Es heißt nicht, dass du zu wenig Disziplin hast.',
      level: 'Dein Kopf liefert dir gerade tausend gute Gründe, warum jetzt nicht der richtige Moment ist. Dahinter steckt fast immer ein Gefühl, das du gerade lieber vermeidest, als es zu spüren. Und genau das ist die eine Fähigkeit, die den größten Unterschied macht: nicht mehr Motivation, nicht mehr Disziplin, sondern die Fähigkeit, diesem Gefühl bewusst zu begegnen, ohne von ihm überrollt zu werden. Sobald du das trainierst, verliert es seine Macht über dich. Und der Schritt, vor dem du gerade stehst, wird einfach nur noch ein Schritt: dein erster.',
      schritt: 'Im Emotions-Gym trainierst du, dem Gefühl zu begegnen, das dich bisher zurückhält, Schritt für Schritt und in deinem Tempo. Teste es einen Monat kostenlos und hol dir deinen Spark zurück.'
    },
    3: {
      typ: 'Dranbleiben trainieren',
      claim: 'Dein Spark kommt zurück, wenn du auch dann weitermachst, wenn’s unbequem wird.',
      intro: 'Du kommst ins Handeln, das ist schon viel mehr, als die meisten schaffen. Aber sobald’s unbequem wird, fällst du zurück ins Alte. Der Anfang ist bei dir nie das Problem. Das Dranbleiben schon, vor allem, wenn der Alltag wieder alles von dir will.',
      anzeichen: 'Du startest oft neu, bringst aber selten was zu Ende · Deine Motivation ist stark am Anfang, verpufft aber nach ein paar Tagen oder Wochen · Du hast schon mehrere Anläufe zu demselben Ziel genommen · Rückschläge fühlen sich oft wie ein Grund an, ganz aufzuhören, statt nur anzupassen.',
      verhalten: 'Neu anfangen statt fertig machen · Nach einem Rückschlag ganz aufhören statt anpassen · Zwischendurch alles wieder infrage stellen: „Ist das überhaupt das Richtige für mich?“',
      kennst: 'Die erste Woche läuft super, du bist stolz auf dich. Dann kommt ein stressiger Tag, du lässt einmal aus, und irgendwie ist danach der ganze Rhythmus weg, und du fängst gefühlt wieder bei null an.',
      saetzeLabel: 'Häufige Ängste und Glaubenssätze',
      saetzeLead: '„Ich schaff das eh nicht dauerhaft.“',
      saetze: '„Ich bin einfach nicht diszipliniert genug.“ · „Vielleicht ist das gar nicht das Richtige für mich.“ · „Ich hab’s doch schon so oft probiert, warum sollte es diesmal anders sein?“',
      nicht: 'Das heißt nicht, dass dir Durchhaltevermögen grundsätzlich fehlt. Du hast ja bewiesen, dass du anfangen kannst. Das eigentliche Muster liegt woanders: Es geht nicht um mehr Disziplin, sondern darum, wer du in dem Moment bist, wenn’s unbequem wird.',
      level: 'Wenn’s unbequem wird, ist das meistens nicht der Moment, wo dir Disziplin fehlt. Es ist der Moment, wo ein Gefühl auftaucht, dem du lieber ausweichst, als es zu spüren. Genau da entscheidet sich, wer du wirst: Jedes Mal, wenn du diesem Gefühl begegnest, statt abzubrechen, baust du dir eine neue Identität auf, die Version von dir, für die Dranbleiben irgendwann selbstverständlich wird. Genau das trainierst du im Emotions-Gym: den Gefühlen zu begegnen, die dich bisher rausgeworfen haben, damit sich Dranbleiben mit der Zeit nicht mehr wie Kampf anfühlt, sondern wie du selbst.',
      schritt: 'Dranbleiben ist Training. Im Emotions-Gym trainierst du regelmäßig mit uns und mit Menschen, die mittrainieren, genau dann, wenn du sonst aussteigen würdest. Der erste Monat ist kostenlos. Hol dir deinen Spark zurück.'
    },
    4: {
      typ: 'Leichtigkeit trainieren',
      claim: 'Dein Spark kommt zurück, wenn du die guten Gefühle genauso trainierst wie das Dranbleiben.',
      intro: 'Du handelst und bleibst dran, das ist schon außergewöhnlich viel. Der nächste Schritt für dich ist nicht mehr Handeln, sondern mehr Leichtigkeit dabei: dass es sich zunehmend nach dir selbst anfühlt statt nach Anstrengung. Und dass du nicht nur funktionierst, sondern wieder spürst, wofür du das alles machst.',
      anzeichen: 'Du setzt regelmäßig um, was du dir vornimmst · Es kostet dich aber noch spürbar Energie, dranzubleiben, du „kämpfst“ noch ein bisschen · Von außen wirkt dein Leben schon ziemlich stimmig, aber innerlich fühlt es sich oft anstrengender an, als es aussieht · Du gönnst dir Erfolge selten wirklich, bevor du schon zum nächsten Ziel weiterziehst.',
      verhalten: 'Konsequentes Handeln, aber mit Anstrengung statt Fluss · Freude über Fortschritt wird schnell wieder vom nächsten To-do abgelöst · Du funktionierst gut, aber merkst manchmal, wie erschöpft dich dein eigenes Vorankommen macht.',
      kennst: 'Du erreichst etwas, auf das du lange hingearbeitet hast, und statt es wirklich zu feiern, bist du gedanklich schon beim nächsten Ziel, bevor der Moment überhaupt richtig angekommen ist.',
      saetzeLabel: 'Häufige Glaubenssätze',
      saetzeLead: '„Ich bin schon die Person, die dranbleibt, aber es kostet mich noch Kraft.“',
      saetze: '„Mein Vorankommen erschöpft mich.“ · „Wenn ich mal aufhöre, mich anzustrengen, fall ich zurück.“',
      nicht: '',
      level: 'Du hast schon bewiesen, dass du schwierige Gefühle halten und trotzdem handeln kannst. Das ist die seltenere Fähigkeit. Jetzt geht’s darum, genau diese Kraft auch auf die guten Gefühle zu richten: Freude, Stolz, Erfüllung genauso bewusst zu trainieren, wie du bisher das Schwierige gehalten hast. Je mehr du das übst, desto mehr trägt dich dein Fortschritt von selbst, bis er sich nicht mehr wie Anstrengung anfühlt, sondern wie du.',
      schritt: 'Im Emotions-Gym trainierst du gezielt die guten Gefühle: Freude, Stolz, Nähe. Jeden Tag ein paar Minuten, damit dein Spark bleibt. Probier es einen Monat kostenlos aus.'
    }
  }
};
// Auswertung: answers = Array der Stufen (1 bis 4) in Fragen-Reihenfolge
window.RS_FC.evaluate = function (answers) {
  var c = [0, 0, 0, 0, 0], sum = 0;
  answers.forEach(function (s) { c[s]++; sum += s; });
  var best = 1;
  for (var s = 2; s <= 4; s++) if (c[s] > c[best]) best = s; // bei Gleichstand bleibt die niedrigere Stufe
  return { stufe: best, wert: Math.round(sum / answers.length * 10) / 10 };
};

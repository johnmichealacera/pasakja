/**
 * Pasakja passenger survey — creates a Google Form via Apps Script.
 *
 * HOW TO RUN (once):
 * 1. Open https://script.google.com/home
 * 2. New project → paste this entire file as Code.gs (replace default code).
 * 3. Save. Run `createPasakjaPassengerSurvey` (Run ▶). Authorize when prompted.
 * 4. View → Execution log (or Extensions → Apps Script execution log) for URLs,
 *    or check https://docs.google.com/forms → the new form appears in Drive.
 *
 * The script is idempotent in spirit: each run creates a NEW form. Delete
 * duplicates in Drive if you run it multiple times.
 *
 * Scale items use FormApp ScaleItem#setLabels(lower, upper) — not setLowLabel/setHighLabel.
 */

/** Statements about manual riding (no dedicated app) and demand for a digital system. */
function manualDemandStatements_() {
  return [
    'When I get rides only in manual ways (street hail, text, or social media — no dedicated ride app), it is often slow, unreliable, or inconvenient.\n' +
      'Kung magpa-ride lang ko nga manwal (kuyog sa dalan, text, o social media — walay dedicated nga ride app), kasagaran hinay, dili kasaligan, o dili praktikal.',
    'Without a digital ride system, fares and routes are unclear or hard to compare before I ride.\n' +
      'Kung walay digital nga sistema sa ride, dili klaro ang plite ug ruta o lisod ikompara sa wala pa koy sakay.',
    'Relying on manual ride booking makes it harder to verify drivers or share trip details for safety.\n' +
      'Ang manwal nga pag-book sa ride makasamok sa pag-verify sa drayber o pagpaambit sa detalye sa biyahe alang sa kaluwasan.',
    'My area needs a digital ride-booking system like Pasakja instead of depending only on manual methods.\n' +
      'Ang among dapit nanginahanglan og digital nga sistema sa pag-book og ride sama sa Pasakja imbes nga manwal nga paagi lang.',
    'Overall, the current situation — without a reliable digital ride system — is not good enough for passengers like me.\n' +
      'Kinatibuk-an, ang kahimtang karon nga walay kasaligan nga digital nga sistema sa ride dili igo alang sa mga pasahero sama nako.'
  ];
}

/** Statements about the Pasakja app experience (same order as before). */
function pasakjaExperienceStatements_() {
  return [
    'Booking a ride in Pasakja was quick and easy.\nSayon ug paspas ang pag-book og ride sa Pasakja.',
    'The app screens were easy to understand.\nSayon sabton ang mga screen sa app.',
    'Pickup and drop-off locations on the map felt accurate (GPS).\nTukma ang pickup ug drop-off nga lokasyon sa mapa (GPS).',
    'Trip details (fare estimate, distance, or time) were clear before I confirmed.\nKlaro ang detalye sa biyahe (tantiya sa bayad, gilay-on, o oras) sa wala pa nako kumpirmahon.',
    'Waiting for a driver to accept felt reasonable.\nReasonable ang pagpaabot nga modawat ang drayber.',
    'The ride experience matched what the app showed (driver, route, or status).\nAng kasinatian sa biyahe parehas sa gipakita sa app (drayber, ruta, o status).',
    'Live tracking / trip updates were helpful during the ride.\nTabang ang live tracking / update sa biyahe sa panahon sa biyahe.',
    'Notifications (requests, acceptance, arrival) were timely and useful.\nTukma ug kapuslanon ang mga notification (hangyo, pagdawat, pag-abot).',
    'I felt safe enough using Pasakja for transportation.\nLuwas gihapon ko sa paggamit sa Pasakja para sa transportasyon.',
    'Pasakja felt more convenient than non-app ways (street hail / text / social media).\nMas praktikal ang Pasakja kaysa sa paagi nga walay app (kuyog sa dalan / text / social media).',
    'I would use Pasakja again if it were available when I need a ride.\nGamiton nako pag-usab ang Pasakja kung anaa kini kung nanginahanglan ko og ride.',
    'Overall, I am satisfied with Pasakja as a digital ride-booking system.\nKinatibuk-an, kontento ko sa Pasakja isip digital nga sistema sa pag-book og ride.'
  ];
}

function createPasakjaPassengerSurvey() {
  var form = FormApp.create('Pasakja — Passenger survey (Chapter 5)');

  form.setDescription(
    'Research survey (~3 minutes). Rate how much you agree (1–5).\n\n' +
      'Survey para sa panukiduki (~3 minutos). Rate kung unsa ka mouyon (1–5).\n\n' +
      'SCALE / SUKDANAN\n' +
      '1 = Strongly disagree — Dili gyud ko mouyon\n' +
      '2 = Disagree — Dili ko mouyon\n' +
      '3 = Neutral — Neutral\n' +
      '4 = Agree — Mouyon ko\n' +
      '5 = Strongly agree — Gayud nga mouyon ko'
  );

  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(false);

  form
    .addMultipleChoiceItem()
    .setTitle('How old are you?\nPila na imong edad?')
    .setChoiceValues(['Under 18', '18–24', '25–34', '35–44', '45–54', '55 or older'])
    .setRequired(true);

  var scaleLow = '1 Strongly disagree — Dili gyud ko mouyon';
  var scaleHigh = '5 Strongly agree — Gayud nga mouyon ko';

  var manual = manualDemandStatements_();
  var pasakja = pasakjaExperienceStatements_();

  form
    .addSectionHeaderItem()
    .setTitle('Manual riding today / Ang manwal nga pag-book karon')
    .setHelpText(
      'Think about how people usually get rides WITHOUT a dedicated app (street hail, text, Facebook, etc.).\n' +
        'Hunahunaa kung unsa may kasagaran nga paagi nga walay dedicated nga app (kuyog sa dalan, text, Facebook, ug uban pa).'
    );

  for (var m = 0; m < manual.length; m++) {
    form
      .addScaleItem()
      .setTitle(manual[m])
      .setBounds(1, 5)
      .setLabels(scaleLow, scaleHigh)
      .setRequired(true);
  }

  form
    .addSectionHeaderItem()
    .setTitle('Pasakja app experience / Kasinatian sa Pasakja')
    .setHelpText('Rate your experience using the Pasakja app.\nI-rate ang imong kasinatian sa paggamit sa Pasakja.');

  for (var p = 0; p < pasakja.length; p++) {
    form
      .addScaleItem()
      .setTitle(pasakja[p])
      .setBounds(1, 5)
      .setLabels(scaleLow, scaleHigh)
      .setRequired(true);
  }

  Logger.log('EDIT (you): ' + form.getEditUrl());
  Logger.log('SHARE (respondents): ' + form.getPublishedUrl());
}

/**
 * Shorter form: age + subset of manual/demand + subset of Pasakja.
 */
function createPasakjaPassengerSurveyShort() {
  var form = FormApp.create('Pasakja — Passenger survey (short)');

  form.setDescription(
    'Short survey. Scale 1–5 — same legend as the full survey script.\n' +
      'Mubo nga survey. Sukdanan 1–5.'
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);

  form
    .addMultipleChoiceItem()
    .setTitle('How old are you?\nPila na imong edad?')
    .setChoiceValues(['Under 18', '18–24', '25–34', '35–44', '45–54', '55 or older'])
    .setRequired(true);

  var scaleLow = '1 Strongly disagree — Dili gyud ko mouyon';
  var scaleHigh = '5 Strongly agree — Gayud nga mouyon ko';

  var manual = manualDemandStatements_();
  var pasakja = pasakjaExperienceStatements_();
  var combined = manual.concat(pasakja);

  // Manual: pain, safety gap, “not good enough”. Pasakja: quick book, GPS, felt safe, use again, overall.
  // combined index = manual (0–4) + pasakja (5–16); 13=safe, 15=use again, 16=overall.
  var idx = [0, 2, 4, 5, 7, 13, 15, 16];

  for (var i = 0; i < idx.length; i++) {
    form
      .addScaleItem()
      .setTitle(combined[idx[i]])
      .setBounds(1, 5)
      .setLabels(scaleLow, scaleHigh)
      .setRequired(true);
  }

  Logger.log('EDIT: ' + form.getEditUrl());
  Logger.log('SHARE: ' + form.getPublishedUrl());
}

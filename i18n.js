/* LiverLogger — UI strings (EN/DE) and the bilingual research content shown
   on the Info tab. Kept as plain data, no DOM access, so it's easy to review
   or extend. */
(function (root) {
  "use strict";

  var STRINGS = {
    "nav.log": { en: "Log", de: "Erfassen" },
    "nav.stats": { en: "Stats", de: "Statistik" },
    "nav.info": { en: "Info", de: "Wissen" },
    "nav.settings": { en: "Settings", de: "Einstellungen" },

    "today.units": { en: "today", de: "heute" },

    "log.quickAdd": { en: "Quick add", de: "Schnell erfassen" },
    "log.custom": { en: "+ Custom amount", de: "+ Eigene Menge" },
    "log.today": { en: "Today's log", de: "Heutiges Protokoll" },
    "log.emptyToday": {
      en: "Nothing logged yet today.",
      de: "Heute noch nichts erfasst.",
    },

    "stats.freeStreak": { en: "Day free streak", de: "Freie Tage in Folge" },
    "stats.freeDays30": { en: "Free days / 30", de: "Freie Tage / 30" },
    "stats.weekTotal": { en: "This week", de: "Diese Woche" },
    "stats.last7": { en: "Last 7 days", de: "Letzte 7 Tage" },
    "stats.weeks": { en: "Weekly trend", de: "Wochentrend" },
    "stats.weeksNote": {
      en: "Dashed lines are reference points from published guidelines below — not targets.",
      de: "Gestrichelte Linien sind Referenzwerte aus den Leitlinien unten — keine Ziele.",
    },
    "stats.byType": { en: "By drink type", de: "Nach Getränkeart" },
    "stats.range7": { en: "7 days", de: "7 Tage" },
    "stats.range30": { en: "30 days", de: "30 Tage" },
    "stats.range90": { en: "90 days", de: "90 Tage" },
    "stats.calendar": { en: "Last 5 weeks", de: "Letzte 5 Wochen" },
    "stats.legendFree": { en: "free", de: "frei" },
    "stats.legendHigh": { en: "higher", de: "höher" },
    "stats.noData": {
      en: "Log a drink to see your charts fill in.",
      de: "Erfasse ein Getränk, damit die Diagramme Daten zeigen.",
    },

    "info.disclaimer": {
      en: "Personal tracking only — not medical advice. If you're concerned about your drinking, please talk to a doctor.",
      de: "Nur zur persönlichen Aufzeichnung — keine medizinische Beratung. Bei Sorgen zum eigenen Konsum sprich bitte mit einer Ärztin oder einem Arzt.",
    },

    "settings.language": { en: "Language", de: "Sprache" },
    "settings.unit": { en: "Reference unit", de: "Bezugseinheit" },
    "settings.unitUs": { en: "US (14g)", de: "USA (14g)" },
    "settings.unitUk": { en: "UK (8g)", de: "UK (8g)" },
    "settings.unitDe": { en: "Germany (11g)", de: "Deutschland (11g)" },
    "settings.unitNote": {
      en: "Changes how totals are shown as “standard drinks / units” across the app. Grams are always exact; this is just the display unit.",
      de: "Ändert, wie Summen als „Standardgetränke/Einheiten“ angezeigt werden. Gramm sind immer exakt — dies ist nur die Anzeigeeinheit.",
    },
    "settings.presets": { en: "Quick-add buttons", de: "Schnellwahl-Buttons" },
    "settings.addPreset": { en: "+ Add", de: "+ Hinzufügen" },
    "settings.data": { en: "Your data", de: "Deine Daten" },
    "settings.export": { en: "Export JSON", de: "JSON exportieren" },
    "settings.import": { en: "Import JSON", de: "JSON importieren" },
    "settings.clear": { en: "Delete all data", de: "Alle Daten löschen" },
    "settings.dataNote": {
      en: "Everything lives only in this phone's local storage — nothing is ever sent anywhere. Export regularly if you want a backup, since clearing Safari data would erase it.",
      de: "Alles bleibt nur im lokalen Speicher dieses Telefons — es wird nichts irgendwohin gesendet. Exportiere regelmäßig als Backup, da ein Löschen der Safari-Daten alles entfernen würde.",
    },
    "settings.about": { en: "About", de: "Über" },
    "settings.aboutText": {
      en: "LiverLogger is a private, offline drink tracker. No accounts, no ads, no analytics, no network requests after install.",
      de: "LiverLogger ist ein privater, offline Getränke-Tracker. Keine Konten, keine Werbung, keine Analyse, keine Netzwerkzugriffe nach der Installation.",
    },

    "modal.title": { en: "Add a drink", de: "Getränk hinzufügen" },
    "modal.type": { en: "Type", de: "Art" },
    "modal.volume": { en: "Volume (mL)", de: "Menge (mL)" },
    "modal.abv": { en: "ABV (%)", de: "Alkoholgehalt (%)" },
    "modal.savePreset": {
      en: "Save as a quick-add button",
      de: "Als Schnellwahl-Button speichern",
    },
    "modal.cancel": { en: "Cancel", de: "Abbrechen" },
    "modal.add": { en: "Add", de: "Hinzufügen" },
    "modal.save": { en: "Save button", de: "Button speichern" },

    "toast.undo": { en: "Undo", de: "Rückgängig" },

    "confirm.deletePreset": {
      en: "Remove this quick-add button?",
      de: "Diesen Schnellwahl-Button entfernen?",
    },
    "confirm.deleteEntry": {
      en: "Delete this entry?",
      de: "Diesen Eintrag löschen?",
    },
    "confirm.clear1": {
      en: "Delete ALL logged drinks? This cannot be undone.",
      de: "ALLE erfassten Getränke löschen? Das kann nicht rückgängig gemacht werden.",
    },
    "confirm.clear2": {
      en: "Really sure? Consider exporting a backup first.",
      de: "Wirklich sicher? Erwäge vorher ein Backup zu exportieren.",
    },

    "type.beer": { en: "Beer", de: "Bier" },
    "type.wine": { en: "Wine", de: "Wein" },
    "type.spirits": { en: "Spirits", de: "Spirituosen" },
    "type.cocktail": { en: "Cocktail", de: "Cocktail" },
    "type.other": { en: "Other", de: "Sonstiges" },
  };

  function t(key, lang) {
    var entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  }

  // ---- Info tab content: research summary, bilingual, with sources ----
  var INFO_SECTIONS = [
    {
      en: {
        title: "What counts as “one drink”?",
        body:
          "A “standard drink” is a fixed amount of pure alcohol, not a fixed glass size — a small strong pour can equal a large weak one. Grams of pure alcohol = volume (mL) × ABV% × 0.789 (ethanol's density). LiverLogger does this math for every entry automatically.\n\nReference sizes: US NIAAA defines one standard drink as 14g — about 355 mL beer at 5%, 148 mL wine at 12%, or 44 mL spirits at 40%. The UK “unit” is 8g. Germany's “Standardglas” is usually cited as 10–12g.",
        source: "NIAAA — Rethinking Drinking",
        url: "https://rethinkingdrinking.niaaa.nih.gov/how-much-too-much/whats-standard-drink",
      },
      de: {
        title: "Was zählt als „ein Getränk“?",
        body:
          "Ein „Standardgetränk“ ist eine feste Menge reinen Alkohols, keine feste Glasgröße — ein kleines starkes Getränk kann einem großen schwachen entsprechen. Gramm reiner Alkohol = Menge (mL) × Alkoholgehalt% × 0,789 (Dichte von Ethanol). LiverLogger berechnet das automatisch für jeden Eintrag.\n\nReferenzgrößen: Die US-Behörde NIAAA definiert ein Standardgetränk als 14g — etwa 355 mL Bier bei 5%, 148 mL Wein bei 12% oder 44 mL Spirituosen bei 40%. Die britische „Unit“ entspricht 8g. Das deutsche „Standardglas“ wird meist mit 10–12g angegeben.",
        source: "NIAAA — Rethinking Drinking",
        url: "https://rethinkingdrinking.niaaa.nih.gov/how-much-too-much/whats-standard-drink",
      },
    },
    {
      en: {
        title: "WHO: no level has been shown to be safe",
        body:
          "In January 2023 the World Health Organization stated that no level of alcohol consumption has been established as safe for health. Alcohol is classified by IARC as a Group 1 carcinogen — the same category as tobacco and asbestos — and is a cause of at least seven types of cancer, including breast and bowel cancer. The statement notes there's no evidence that light or moderate drinking's possible cardiovascular benefits outweigh its cancer risk.",
        source: "WHO/Europe, 4 Jan 2023",
        url: "https://www.who.int/europe/news/item/04-01-2023-no-level-of-alcohol-consumption-is-safe-for-our-health",
      },
      de: {
        title: "WHO: kein Konsumniveau gilt als sicher",
        body:
          "Im Januar 2023 erklärte die Weltgesundheitsorganisation, dass kein Alkoholkonsumniveau als gesundheitlich unbedenklich gilt. Die IARC stuft Alkohol als Karzinogen der Gruppe 1 ein — dieselbe Kategorie wie Tabak und Asbest — und es verursacht mindestens sieben Krebsarten, darunter Brust- und Darmkrebs. Es gebe keine Belege, dass mögliche kardiovaskuläre Vorteile von leichtem bis moderatem Konsum das Krebsrisiko aufwiegen.",
        source: "WHO/Europe, 4. Jan. 2023",
        url: "https://www.who.int/europe/news/item/04-01-2023-no-level-of-alcohol-consumption-is-safe-for-our-health",
      },
    },
    {
      en: {
        title: "US Surgeon General's cancer advisory (Jan 2025)",
        body:
          "In January 2025, US Surgeon General Dr. Vivek Murthy issued an advisory calling for updated warning labels covering at least seven alcohol-related cancers (breast, colorectal, esophageal, liver, mouth, throat, larynx), noting breast cancer risk rises even at about one drink per day. Alcohol is described as the third-leading preventable cause of cancer in the US, linked to roughly 20,000 cancer deaths a year. The advisory isn't legally binding; any label change would require Congress to act.",
        source: "US HHS / Surgeon General, Jan 2025",
        url: "https://www.npr.org/2025/01/03/nx-s1-5245794/alcohol-cancer-risk-surgeon-general",
      },
      de: {
        title: "Warnung des US Surgeon General zu Krebsrisiko (Jan. 2025)",
        body:
          "Im Januar 2025 forderte US Surgeon General Dr. Vivek Murthy aktualisierte Warnhinweise zu mindestens sieben alkoholbedingten Krebsarten (Brust, Darm, Speiseröhre, Leber, Mund, Rachen, Kehlkopf) — das Brustkrebsrisiko steige bereits ab etwa einem Getränk pro Tag. Alkohol gilt als drittführende vermeidbare Krebsursache in den USA mit rund 20.000 Krebstoden pro Jahr. Die Empfehlung ist nicht bindend; eine Änderung der Warnhinweise müsste der Kongress beschließen.",
        source: "US HHS / Surgeon General, Jan. 2025",
        url: "https://www.npr.org/2025/01/03/nx-s1-5245794/alcohol-cancer-risk-surgeon-general",
      },
    },
    {
      en: {
        title: "2025–2030 US Dietary Guidelines",
        body:
          "Published in January 2026, the new US Dietary Guidelines dropped the long-standing numeric limit (≤2 drinks/day for men, ≤1 for women) in favor of a vaguer “drink less for better health” framing, with no specific ceiling. The guidelines still call for complete avoidance during pregnancy, alcohol use disorder recovery, and when taking interacting medications. Medical groups such as AASLD (liver disease specialists) criticized the change for removing clear, evidence-based limits.",
        source: "DietaryGuidelines.gov; AASLD statement",
        url: "https://www.dietaryguidelines.gov/alcohol/info",
      },
      de: {
        title: "US-Ernährungsrichtlinien 2025–2030",
        body:
          "Die im Januar 2026 veröffentlichten neuen US-Ernährungsrichtlinien strichen die bisherige Zahlengrenze (≤2 Getränke/Tag für Männer, ≤1 für Frauen) zugunsten einer vageren Formulierung „weniger trinken für bessere Gesundheit“ ohne konkrete Obergrenze. Weiterhin wird völliger Verzicht bei Schwangerschaft, in der Genesung von einer Alkoholkonsumstörung und bei wechselwirkenden Medikamenten empfohlen. Fachgesellschaften wie die AASLD (Lebererkrankungen) kritisierten den Wegfall klarer, evidenzbasierter Grenzwerte.",
        source: "DietaryGuidelines.gov; AASLD-Stellungnahme",
        url: "https://www.dietaryguidelines.gov/alcohol/info",
      },
    },
    {
      en: {
        title: "UK: Chief Medical Officers' guideline",
        body:
          "The UK's low-risk drinking guideline is up to 14 units a week for both men and women (1 unit = 8g alcohol, so 14 units ≈ 112g), spread across three or more days with several drink-free days, and avoiding “bingeing.” The guidance is explicit that 14 units is a threshold of low risk, not a level of zero risk.",
        source: "UK CMOs / Drinkaware",
        url: "https://www.drinkaware.co.uk/facts/information-about-alcohol/alcohol-and-the-facts/low-risk-drinking-guidelines",
      },
      de: {
        title: "UK: Leitlinie der Chief Medical Officers",
        body:
          "Die britische Leitlinie für risikoarmen Konsum liegt bei bis zu 14 Units pro Woche für Männer und Frauen gleichermaßen (1 Unit = 8g Alkohol, also ≈14 Units ≈ 112g), verteilt auf mindestens drei Tage mit mehreren alkoholfreien Tagen und ohne „Rauschtrinken“. Die Leitlinie betont ausdrücklich, dass 14 Units ein Schwellenwert für geringes Risiko ist, nicht für null Risiko.",
        source: "UK CMOs / Drinkaware",
        url: "https://www.drinkaware.co.uk/facts/information-about-alcohol/alcohol-and-the-facts/low-risk-drinking-guidelines",
      },
    },
    {
      en: {
        title: "Germany: DHS and the “Standardglas”",
        body:
          "Germany's Deutsche Hauptstelle für Suchtfragen (DHS) traditionally cited a “Standardglas” of 10–12g alcohol, with older guidance around 12g/day for women and 24g on non-daily basis for men. As of 2023–2025 the DHS stopped publishing specific low-risk limit values, citing evidence that no consumption level is clearly risk-free; some current sources instead frame roughly under 27g/week as the outer bound for those who choose to drink at all.",
        source: "DHS; RKI Journal of Health Monitoring 3/2025",
        url: "https://www.dhs.de/service/aktuelles/meldung/neue-dhs-empfehlungen-zum-umgang-mit-alkohol/",
      },
      de: {
        title: "Deutschland: DHS und das „Standardglas“",
        body:
          "Die Deutsche Hauptstelle für Suchtfragen (DHS) nannte traditionell ein „Standardglas“ mit 10–12g Alkohol, mit älteren Richtwerten von etwa 12g/Tag für Frauen und 24g an nicht-täglichem Konsum für Männer. Seit 2023–2025 veröffentlicht die DHS keine konkreten Grenzwerte für risikoarmen Konsum mehr, da Belege zeigen, dass kein Konsumniveau klar risikofrei ist; manche aktuellen Quellen nennen stattdessen etwa unter 27g/Woche als obere Grenze für alle, die dennoch trinken möchten.",
        source: "DHS; RKI Journal of Health Monitoring 3/2025",
        url: "https://www.dhs.de/service/aktuelles/meldung/neue-dhs-empfehlungen-zum-umgang-mit-alkohol/",
      },
    },
  ];

  root.I18N = { STRINGS: STRINGS, t: t, INFO_SECTIONS: INFO_SECTIONS };
})(typeof window !== "undefined" ? window : this);

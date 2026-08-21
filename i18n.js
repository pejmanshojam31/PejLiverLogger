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

    "wtype.joint": { en: "Joint", de: "Joint" },
    "wtype.pipe": { en: "Pipe/Bowl", de: "Pfeife/Bong" },
    "wtype.vape": { en: "Vape", de: "Vape" },
    "wtype.edible": { en: "Edible", de: "Essbar" },
    "wtype.other": { en: "Other", de: "Sonstiges" },

    // ---- substance switcher (Log / Stats / Info all reuse this) ----
    "substance.alcohol": { en: "🍺 Alcohol", de: "🍺 Alkohol" },
    "substance.weed": { en: "🌿 Weed", de: "🌿 Cannabis" },

    "unit.liters": { en: "L pure alcohol", de: "L reiner Alkohol" },
    "unit.thcUnits": { en: "THC units (5mg)", de: "THC-Einheiten (5mg)" },

    // ---- weed log/modal ----
    "modal.titleWeed": { en: "Add a session", de: "Konsum hinzufügen" },
    "modal.method": { en: "Method", de: "Methode" },
    "modal.flowerGrams": { en: "Flower (g)", de: "Blüten (g)" },
    "modal.thcPercent": { en: "THC (%)", de: "THC (%)" },
    "modal.mgThc": { en: "THC (mg)", de: "THC (mg)" },
    "modal.enterMgDirect": {
      en: "Know the mg THC (vape/edible label)? Enter it directly instead:",
      de: "mg THC bekannt (Vape-/Edible-Etikett)? Direkt eingeben:",
    },

    // ---- monthly / yearly ----
    "stats.thisMonth": { en: "This month", de: "Diesen Monat" },
    "stats.thisYear": { en: "This year", de: "Dieses Jahr" },
    "stats.lastYear": { en: "Last year", de: "Letztes Jahr" },
    "stats.months": { en: "Last 12 months", de: "Letzte 12 Monate" },

    // ---- warnings ----
    "warn.overDaily": {
      en: "Over your daily guideline today",
      de: "Über deiner Tagesgrenze heute",
    },
    "warn.overWeekly": {
      en: "Over your weekly guideline this week",
      de: "Über deiner Wochengrenze diese Woche",
    },
    "warn.weedFrequent": {
      en: "Used on {n} of the last 7 days — LRCUG suggests avoiding near-daily use",
      de: "An {n} der letzten 7 Tage konsumiert — die LRCUG raten von (nahezu) täglichem Konsum ab",
    },

    "settings.warnThresholds": { en: "Warning thresholds", de: "Warnschwellen" },
    "settings.warnDailyG": { en: "Daily alcohol (g)", de: "Alkohol pro Tag (g)" },
    "settings.warnWeeklyG": { en: "Weekly alcohol (g)", de: "Alkohol pro Woche (g)" },
    "settings.warnWeedDays": {
      en: "Weed: flag if used on this many of the last 7 days",
      de: "Cannabis: warnen ab so vielen Tagen der letzten 7",
    },
    "settings.warnNote": {
      en: "Prefilled from published guidelines (UK CMO 112g/week ≈ 14 units; LRCUG's near-daily caution). Edit to whatever makes sense for you — these are just a starting point, not a medical recommendation.",
      de: "Voreingestellt nach veröffentlichten Leitlinien (UK CMO 112g/Woche ≈ 14 Units; LRCUG-Hinweis zu (nahezu) täglichem Konsum). Passe die Werte nach Bedarf an — das ist ein Ausgangspunkt, keine medizinische Empfehlung.",
    },

    // ---- profiles (local, offline — no accounts, no server) ----
    "profile.who": { en: "Who's tracking?", de: "Wer erfasst gerade?" },
    "profile.whoNote": {
      en: "Each profile keeps its own separate log on this device. Nothing leaves this phone, and nothing is a real “account” — just a name (and optional PIN) so more than one person can use this install.",
      de: "Jedes Profil führt sein eigenes, getrenntes Protokoll auf diesem Gerät. Nichts verlässt dieses Telefon, und es ist kein echtes „Konto“ — nur ein Name (und optional eine PIN), damit mehrere Personen diese Installation nutzen können.",
    },
    "profile.add": { en: "+ Add profile", de: "+ Profil hinzufügen" },
    "profile.name": { en: "Name", de: "Name" },
    "profile.pinOptional": { en: "PIN (optional, 4 digits)", de: "PIN (optional, 4 Ziffern)" },
    "profile.pinNote": {
      en: "This only keeps casual/curious hands out — it's stored on-device and isn't real security. Anyone with access to the phone's storage could bypass it.",
      de: "Das hält nur beiläufige/neugierige Blicke fern — sie wird lokal gespeichert und ist keine echte Sicherheit. Wer Zugriff auf den Gerätespeicher hat, könnte sie umgehen.",
    },
    "profile.create": { en: "Create profile", de: "Profil erstellen" },
    "profile.enter": { en: "Enter", de: "Los" },
    "profile.enterPin": { en: "Enter PIN", de: "PIN eingeben" },
    "profile.wrongPin": { en: "Wrong PIN", de: "Falsche PIN" },
    "profile.switch": { en: "Switch profile", de: "Profil wechseln" },
    "profile.rename": { en: "Rename", de: "Umbenennen" },
    "profile.delete": { en: "Delete profile", de: "Profil löschen" },
    "profile.deleteConfirm": {
      en: "Delete this profile and all of its logged data? This cannot be undone.",
      de: "Dieses Profil und alle erfassten Daten löschen? Das kann nicht rückgängig gemacht werden.",
    },
    "profile.needName": { en: "Please enter a name", de: "Bitte einen Namen eingeben" },
    "settings.profile": { en: "Profile", de: "Profil" },

    "info.disclaimerWeed": {
      en: "Personal tracking only — not medical or legal advice. Cannabis laws vary a lot by country and region; know what applies where you are.",
      de: "Nur zur persönlichen Aufzeichnung — keine medizinische oder rechtliche Beratung. Cannabisgesetze unterscheiden sich stark je nach Land und Region — informiere dich über die für dich geltenden Regeln.",
    },
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

  // ---- Info tab content for the Weed section, bilingual, with sources ----
  var INFO_SECTIONS_WEED = [
    {
      en: {
        title: "The “Standard THC Unit”",
        body:
          "Just like alcohol, cannabis potency varies wildly across joints, pipes, vapes, and edibles — so researchers use a fixed reference: one Standard THC Unit = 5mg of THC. The US NIH now requires this unit for THC reporting in the research it funds. LiverLogger converts every entry to mg THC and units automatically, the same way it converts drinks to grams.",
        source: "NIH-mandated THC unit; standard-unit research",
        url: "https://www.medrxiv.org/content/10.1101/2025.05.21.25328059.full.pdf",
      },
      de: {
        title: "Die „Standard-THC-Einheit“",
        body:
          "Genau wie bei Alkohol schwankt die Wirkstärke von Cannabis je nach Joint, Pfeife, Vape oder Edible stark — Forschende nutzen daher eine feste Referenz: eine Standard-THC-Einheit = 5mg THC. Die US-Gesundheitsbehörde NIH schreibt diese Einheit inzwischen für die Berichterstattung in von ihr finanzierter Forschung vor. LiverLogger rechnet jeden Eintrag automatisch in mg THC und Einheiten um — genau wie bei Getränken in Gramm.",
        source: "NIH-Standardeinheit; Forschung zu Standard-THC-Einheiten",
        url: "https://www.medrxiv.org/content/10.1101/2025.05.21.25328059.full.pdf",
      },
    },
    {
      en: {
        title: "Canada's Lower-Risk Cannabis Use Guidelines",
        body:
          "The LRCUG summarize the evidence on reducing cannabis-related health risks, in the same spirit as low-risk drinking guidelines. Core recommendations: delay starting for as long as possible (the brain keeps developing into the mid-20s), avoid using daily or near-daily, avoid deep inhalation and breath-holding, favour lower-THC products, and never combine with driving.",
        source: "CAMH / Canada's LRCUG",
        url: "https://www.camh.ca/-/media/files/lrcug_professional-pdf",
      },
      de: {
        title: "Kanadas Leitlinien für risikoärmeren Cannabiskonsum (LRCUG)",
        body:
          "Die LRCUG fassen die Evidenz zur Reduzierung cannabisbedingter Gesundheitsrisiken zusammen — im gleichen Geist wie Leitlinien für risikoarmen Alkoholkonsum. Kernempfehlungen: Konsumbeginn so lange wie möglich hinauszögern (das Gehirn entwickelt sich bis Mitte 20 weiter), nicht täglich oder nahezu täglich konsumieren, tiefes Inhalieren und Luftanhalten vermeiden, Produkte mit niedrigerem THC-Gehalt bevorzugen und nie in Kombination mit Autofahren.",
        source: "CAMH / Kanadas LRCUG",
        url: "https://www.camh.ca/-/media/files/lrcug_professional-pdf",
      },
    },
    {
      en: {
        title: "Germany: the Cannabisgesetz (since April 2024)",
        body:
          "Since 1 April 2024, adults 18+ in Germany may possess up to 25g of cannabis in public and up to 50g at home, and grow up to three plants. Since July 2024, non-profit “cannabis social clubs” of up to 500 members are permitted. Regular commercial retail sale is still not part of the model.",
        source: "Cannabisgesetz (CanG)",
        url: "https://en.wikipedia.org/wiki/Cannabis_Act_(Germany)",
      },
      de: {
        title: "Deutschland: das Cannabisgesetz (seit April 2024)",
        body:
          "Seit dem 1. April 2024 dürfen Erwachsene ab 18 Jahren in Deutschland bis zu 25g Cannabis öffentlich und bis zu 50g zu Hause besitzen sowie bis zu drei Pflanzen selbst anbauen. Seit Juli 2024 sind nicht-kommerzielle „Cannabis Social Clubs“ mit bis zu 500 Mitgliedern erlaubt. Ein regulärer Verkauf über Geschäfte ist weiterhin nicht vorgesehen.",
        source: "Cannabisgesetz (CanG)",
        url: "https://en.wikipedia.org/wiki/Cannabis_Act_(Germany)",
      },
    },
    {
      en: {
        title: "Health risks (2025 research)",
        body:
          "A 2025 systematic review estimated about 22% of people who use cannabis meet criteria for cannabis use disorder, rising to roughly 33% among those who use weekly or daily as young people. Use before about age 25, while the brain is still developing, carries greater risk to memory, attention, and learning. Daily use of high-potency products is linked to a greater likelihood of psychosis and schizophrenia; acutely, cannabis raises heart rate and blood pressure.",
        source: "CDC — Cannabis and Public Health",
        url: "https://www.cdc.gov/cannabis/health-effects/index.html",
      },
      de: {
        title: "Gesundheitliche Risiken (Forschungsstand 2025)",
        body:
          "Eine 2025 veröffentlichte systematische Übersichtsarbeit schätzt, dass etwa 22% der Cannabiskonsumierenden die Kriterien für eine Cannabiskonsumstörung erfüllen — bei wöchentlichem oder täglichem Konsum im Jugend-/jungen Erwachsenenalter steigt der Anteil auf rund 33%. Konsum vor etwa 25 Jahren, während sich das Gehirn noch entwickelt, ist mit höheren Risiken für Gedächtnis, Aufmerksamkeit und Lernen verbunden. Täglicher Konsum hochpotenter Produkte wird mit einem erhöhten Psychose- und Schizophrenierisiko in Verbindung gebracht; akut erhöht Cannabis Herzfrequenz und Blutdruck.",
        source: "CDC — Cannabis and Public Health",
        url: "https://www.cdc.gov/cannabis/health-effects/index.html",
      },
    },
    {
      en: {
        title: "Smoked ≠ absorbed",
        body:
          "When cannabis is smoked, only about 10–25% of its THC content actually reaches the bloodstream — the rest is lost to combustion and exhaled breath. So the mg THC logged here reflects what was consumed, not the effective dose absorbed. Edibles absorb more fully but act much more slowly, which is a common cause of accidental overdosing while waiting for effects to kick in.",
        source: "THC bioavailability reviews",
        url: "https://leafwell.com/blog/how-to-dose-marijuana-for-smoking",
      },
      de: {
        title: "Geraucht ≠ aufgenommen",
        body:
          "Beim Rauchen gelangen nur etwa 10–25% des enthaltenen THC tatsächlich in den Blutkreislauf — der Rest geht bei Verbrennung und Ausatmen verloren. Die hier erfassten mg-THC-Werte bilden also den konsumierten Wirkstoffgehalt ab, nicht die tatsächlich aufgenommene Dosis. Edibles werden vollständiger aufgenommen, wirken aber deutlich verzögert — ein häufiger Grund für unbeabsichtigt hohe Dosierung, während auf die Wirkung gewartet wird.",
        source: "Übersichten zur THC-Bioverfügbarkeit",
        url: "https://leafwell.com/blog/how-to-dose-marijuana-for-smoking",
      },
    },
  ];

  root.I18N = {
    STRINGS: STRINGS,
    t: t,
    INFO_SECTIONS: INFO_SECTIONS,
    INFO_SECTIONS_WEED: INFO_SECTIONS_WEED,
  };
})(typeof window !== "undefined" ? window : this);

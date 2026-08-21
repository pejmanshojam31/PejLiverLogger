/*
 * LiverLogger — pure calculation logic.
 * No DOM access in this file, so it can run both in the browser (loaded via
 * <script>, attaches to window.Logic) and in Node (module.exports) for unit
 * testing without needing a browser or canvas.
 *
 * v2: generalized the aggregation helpers to work on any numeric field via a
 * `key` argument, so the same date/week/month/year math serves both alcohol
 * entries (key: "grams") and weed entries (key: "mgThc") without duplicating
 * logic. The original grams-only function names are kept as thin wrappers so
 * existing call sites (and v1 tests) keep working unchanged.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Logic = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Density of pure ethanol in g/mL — used by NIAAA and most standard-drink
  // calculators to convert a beverage's volume + ABV into grams of pure alcohol.
  var ETHANOL_DENSITY = 0.789;

  // Reference units, each representing a different country's definition of
  // "one drink" in grams of pure alcohol.
  var UNIT_GRAMS = {
    us: 14, // NIAAA standard drink (0.6 fl oz pure alcohol)
    uk: 8, // UK Chief Medical Officers' "unit"
    de: 11, // German "Standardglas", commonly cited as 10-12g; 11g midpoint
    jp: 19.75, // Japan "go" — kept for completeness, not shown by default
  };

  // A "Standard THC Unit" = 5mg THC — proposed in the research literature and
  // now mandated by NIH for THC reporting in the studies it funds. Used the
  // same way UNIT_GRAMS.us is used for alcohol: a display convenience, not a
  // claim about what's "safe."
  var MG_THC_PER_UNIT = 5;

  // Weekly reference thresholds used only to give the user a sense of scale
  // on the charts — never presented as a "safe" amount. See info tab / README
  // for sourcing: WHO (2023) states no level of alcohol use is established as
  // safe. These are guideline lines, not targets.
  var WEEKLY_REFERENCES_G = {
    ukCmo14Units: 14 * UNIT_GRAMS.uk, // = 112g/week (UK CMO low-risk guideline)
    deConservative: 27, // g/week, upper end of the low-risk framing cited by
    // some 2024/2025 German sources (see README) for adults who choose to drink
    usOldModerateMen: 14 * UNIT_GRAMS.us, // = 196g/week (pre-2025 US guideline, 2/day)
    usOldModerateWomen: 7 * UNIT_GRAMS.us, // = 98g/week (pre-2025 US guideline, 1/day)
  };

  // Sensible starting points for the user-editable warning thresholds in
  // Settings — not medical advice, just a prefilled, well-sourced default.
  var DEFAULT_WARN_THRESHOLDS = {
    alcoholDailyG: 40, // roughly a "heavy single occasion" ballpark (~4 US standard drinks)
    alcoholWeeklyG: WEEKLY_REFERENCES_G.ukCmo14Units, // 112g, UK CMO guideline
    weedFrequentDays: 5, // flag if used on 5+ of the last 7 days (LRCUG: avoid near-daily use)
  };

  function round1(n) {
    return Math.round(n * 10) / 10;
  }
  function round3(n) {
    return Math.round(n * 1000) / 1000;
  }

  function gramsFromVolumeAbv(volumeMl, abvPercent) {
    var v = Number(volumeMl) || 0;
    var a = Number(abvPercent) || 0;
    return v * (a / 100) * ETHANOL_DENSITY;
  }

  // Grams of pure alcohol -> liters of pure alcohol (i.e. the volume the
  // ethanol itself would occupy, not the volume of the drink). Displayed as
  // the primary unit per user preference, with grams as the secondary/
  // scientific unit alongside it.
  function litersFromGrams(grams) {
    return grams / ETHANOL_DENSITY / 1000;
  }

  function unitsFromGrams(grams, unitKey) {
    var unit = UNIT_GRAMS[unitKey] || UNIT_GRAMS.us;
    return grams / unit;
  }

  // Weed: mg THC from a smoked amount (flower grams x THC%), or pass mgThc
  // directly for vapes/edibles where potency is already labeled in mg.
  function mgThcFromFlower(flowerGrams, thcPercent) {
    var g = Number(flowerGrams) || 0;
    var pct = Number(thcPercent) || 0;
    return g * (pct / 100) * 1000;
  }
  function thcUnitsFromMg(mgThc) {
    return mgThc / MG_THC_PER_UNIT;
  }

  // ---- date helpers (all operate on local calendar dates, "YYYY-MM-DD") ----

  function toDateKey(d) {
    var date = d instanceof Date ? d : new Date(d);
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  // ISO week key, e.g. "2026-W31" — Monday-start weeks, matching how most
  // European guidelines (UK/DE) frame "per week" thresholds.
  function isoWeekKey(d) {
    var date = d instanceof Date ? new Date(d.getTime()) : new Date(d);
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year, ISO-8601 rule.
    var dayNum = (date.getDay() + 6) % 7; // Mon=0..Sun=6
    date.setDate(date.getDate() - dayNum + 3);
    var firstThursday = new Date(date.getFullYear(), 0, 4);
    var diff = date - firstThursday;
    var week = 1 + Math.round(diff / (7 * 24 * 3600 * 1000));
    return date.getFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function monthKey(d) {
    var date = d instanceof Date ? d : new Date(d);
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
  }

  function yearKey(d) {
    var date = d instanceof Date ? d : new Date(d);
    return String(date.getFullYear());
  }

  function startOfWeek(d) {
    var date = d instanceof Date ? new Date(d.getTime()) : new Date(d);
    date.setHours(0, 0, 0, 0);
    var dayNum = (date.getDay() + 6) % 7; // Mon=0
    date.setDate(date.getDate() - dayNum);
    return date;
  }

  function startOfMonth(d) {
    var date = d instanceof Date ? new Date(d.getTime()) : new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  // ---- generic aggregation: works on any numeric entry field via `key` ----
  // entries: [{ id, ts (ISO string), type, ...substance-specific fields }]

  function totalAmount(entries, key) {
    return entries.reduce(function (sum, e) {
      return sum + (e[key] || 0);
    }, 0);
  }

  function groupByDayAmount(entries, key) {
    var map = {};
    entries.forEach(function (e) {
      var k = toDateKey(e.ts);
      map[k] = (map[k] || 0) + (e[key] || 0);
    });
    return map;
  }

  function groupByWeekAmount(entries, key) {
    var map = {};
    entries.forEach(function (e) {
      var k = isoWeekKey(e.ts);
      map[k] = (map[k] || 0) + (e[key] || 0);
    });
    return map;
  }

  function groupByMonthAmount(entries, key) {
    var map = {};
    entries.forEach(function (e) {
      var k = monthKey(e.ts);
      map[k] = (map[k] || 0) + (e[key] || 0);
    });
    return map;
  }

  function groupByYearAmount(entries, key) {
    var map = {};
    entries.forEach(function (e) {
      var k = yearKey(e.ts);
      map[k] = (map[k] || 0) + (e[key] || 0);
    });
    return map;
  }

  function groupByTypeAmount(entries, key) {
    var map = {};
    entries.forEach(function (e) {
      map[e.type] = (map[e.type] || 0) + (e[key] || 0);
    });
    return map;
  }

  // last N days (including today), returns array of { date, amount } oldest->newest
  function lastNDaysAmount(entries, n, key, today) {
    var byDay = groupByDayAmount(entries, key);
    var ref = today ? new Date(today) : new Date();
    ref.setHours(0, 0, 0, 0);
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(ref.getTime());
      d.setDate(d.getDate() - i);
      var k = toDateKey(d);
      out.push({ date: k, amount: round3(byDay[k] || 0) });
    }
    return out;
  }

  // last N iso weeks, oldest->newest, returns { weekKey, weekStart, amount }
  function lastNWeeksAmount(entries, n, key, today) {
    var byWeek = groupByWeekAmount(entries, key);
    var ref = today ? new Date(today) : new Date();
    var thisWeekStart = startOfWeek(ref);
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(thisWeekStart.getTime());
      d.setDate(d.getDate() - i * 7);
      var k = isoWeekKey(d);
      out.push({ weekKey: k, weekStart: toDateKey(d), amount: round3(byWeek[k] || 0) });
    }
    return out;
  }

  // last N calendar months, oldest->newest, returns { monthKey, amount }
  function lastNMonthsAmount(entries, n, key, today) {
    var byMonth = groupByMonthAmount(entries, key);
    var ref = today ? new Date(today) : new Date();
    var thisMonthStart = startOfMonth(ref);
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - i, 1);
      var k = monthKey(d);
      out.push({ monthKey: k, monthStart: toDateKey(d), amount: round3(byMonth[k] || 0) });
    }
    return out;
  }

  function yearTotalAmount(entries, key, year, today) {
    var y = year || yearKey(today || new Date());
    return round3(
      entries
        .filter(function (e) { return yearKey(e.ts) === y; })
        .reduce(function (sum, e) { return sum + (e[key] || 0); }, 0)
    );
  }

  function currentFreeStreakAmount(entries, key, today) {
    if (!entries.length) return 0;
    var byDay = groupByDayAmount(entries, key);
    var ref = today ? new Date(today) : new Date();
    ref.setHours(0, 0, 0, 0);
    var streak = 0;
    var d = new Date(ref.getTime());
    while (true) {
      var k = toDateKey(d);
      if ((byDay[k] || 0) > 0) break;
      streak++;
      d.setDate(d.getDate() - 1);
      if (streak > 3650) break; // safety valve
    }
    return streak;
  }

  function freeDaysCountAmount(entries, n, key, today) {
    if (!entries.length) return 0;
    var days = lastNDaysAmount(entries, n, key, today);
    return days.filter(function (d) { return d.amount === 0; }).length;
  }

  // Days with any use in the last N days — the mirror of freeDaysCount,
  // used for the weed frequency warning (LRCUG cares about frequency more
  // than single-session dose).
  function usedDaysCountAmount(entries, n, key, today) {
    if (!entries.length) return 0;
    var days = lastNDaysAmount(entries, n, key, today);
    return days.filter(function (d) { return d.amount > 0; }).length;
  }

  // ---- backward-compatible grams-only wrappers (alcohol) ----

  function totalGrams(entries) { return totalAmount(entries, "grams"); }
  function groupByDay(entries) { return groupByDayAmount(entries, "grams"); }
  function groupByWeek(entries) { return groupByWeekAmount(entries, "grams"); }
  function groupByType(entries) { return groupByTypeAmount(entries, "grams"); }
  function lastNDays(entries, n, today) {
    return lastNDaysAmount(entries, n, "grams", today).map(function (d) {
      return { date: d.date, grams: d.amount };
    });
  }
  function lastNWeeks(entries, n, today) {
    return lastNWeeksAmount(entries, n, "grams", today).map(function (w) {
      return { weekKey: w.weekKey, weekStart: w.weekStart, grams: w.amount };
    });
  }
  function currentFreeStreak(entries, today) { return currentFreeStreakAmount(entries, "grams", today); }
  function freeDaysCount(entries, n, today) { return freeDaysCountAmount(entries, n, "grams", today); }

  return {
    ETHANOL_DENSITY: ETHANOL_DENSITY,
    UNIT_GRAMS: UNIT_GRAMS,
    MG_THC_PER_UNIT: MG_THC_PER_UNIT,
    WEEKLY_REFERENCES_G: WEEKLY_REFERENCES_G,
    DEFAULT_WARN_THRESHOLDS: DEFAULT_WARN_THRESHOLDS,

    gramsFromVolumeAbv: gramsFromVolumeAbv,
    litersFromGrams: litersFromGrams,
    unitsFromGrams: unitsFromGrams,
    mgThcFromFlower: mgThcFromFlower,
    thcUnitsFromMg: thcUnitsFromMg,

    toDateKey: toDateKey,
    isoWeekKey: isoWeekKey,
    monthKey: monthKey,
    yearKey: yearKey,
    startOfWeek: startOfWeek,
    startOfMonth: startOfMonth,

    // generic (key-based) — used for weed (key: "mgThc") and alcohol (key: "grams")
    totalAmount: totalAmount,
    groupByDayAmount: groupByDayAmount,
    groupByWeekAmount: groupByWeekAmount,
    groupByMonthAmount: groupByMonthAmount,
    groupByYearAmount: groupByYearAmount,
    groupByTypeAmount: groupByTypeAmount,
    lastNDaysAmount: lastNDaysAmount,
    lastNWeeksAmount: lastNWeeksAmount,
    lastNMonthsAmount: lastNMonthsAmount,
    yearTotalAmount: yearTotalAmount,
    currentFreeStreakAmount: currentFreeStreakAmount,
    freeDaysCountAmount: freeDaysCountAmount,
    usedDaysCountAmount: usedDaysCountAmount,

    // grams-only wrappers (v1 compatibility)
    totalGrams: totalGrams,
    groupByDay: groupByDay,
    groupByWeek: groupByWeek,
    groupByType: groupByType,
    lastNDays: lastNDays,
    lastNWeeks: lastNWeeks,
    currentFreeStreak: currentFreeStreak,
    freeDaysCount: freeDaysCount,

    round1: round1,
    round3: round3,
  };
});

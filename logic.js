/*
 * LiverLogger — pure calculation logic.
 * No DOM access in this file, so it can run both in the browser (loaded via
 * <script>, attaches to window.Logic) and in Node (module.exports) for unit
 * testing without needing a browser or canvas.
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

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function gramsFromVolumeAbv(volumeMl, abvPercent) {
    var v = Number(volumeMl) || 0;
    var a = Number(abvPercent) || 0;
    return v * (a / 100) * ETHANOL_DENSITY;
  }

  function unitsFromGrams(grams, unitKey) {
    var unit = UNIT_GRAMS[unitKey] || UNIT_GRAMS.us;
    return grams / unit;
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

  function startOfWeek(d) {
    var date = d instanceof Date ? new Date(d.getTime()) : new Date(d);
    date.setHours(0, 0, 0, 0);
    var dayNum = (date.getDay() + 6) % 7; // Mon=0
    date.setDate(date.getDate() - dayNum);
    return date;
  }

  // ---- aggregation ----

  // entries: [{ id, ts (ISO string), type, volumeMl, abv, grams }]

  function totalGrams(entries) {
    return entries.reduce(function (sum, e) {
      return sum + e.grams;
    }, 0);
  }

  function groupByDay(entries) {
    var map = {};
    entries.forEach(function (e) {
      var key = toDateKey(e.ts);
      map[key] = (map[key] || 0) + e.grams;
    });
    return map;
  }

  function groupByWeek(entries) {
    var map = {};
    entries.forEach(function (e) {
      var key = isoWeekKey(e.ts);
      map[key] = (map[key] || 0) + e.grams;
    });
    return map;
  }

  function groupByType(entries) {
    var map = {};
    entries.forEach(function (e) {
      map[e.type] = (map[e.type] || 0) + e.grams;
    });
    return map;
  }

  // last N days (including today), returns array of { date, grams } oldest->newest
  function lastNDays(entries, n, today) {
    var byDay = groupByDay(entries);
    var ref = today ? new Date(today) : new Date();
    ref.setHours(0, 0, 0, 0);
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(ref.getTime());
      d.setDate(d.getDate() - i);
      var key = toDateKey(d);
      out.push({ date: key, grams: round1(byDay[key] || 0) });
    }
    return out;
  }

  // last N iso weeks, oldest->newest, returns { weekKey, weekStart, grams }
  function lastNWeeks(entries, n, today) {
    var byWeek = groupByWeek(entries);
    var ref = today ? new Date(today) : new Date();
    var thisWeekStart = startOfWeek(ref);
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(thisWeekStart.getTime());
      d.setDate(d.getDate() - i * 7);
      var key = isoWeekKey(d);
      out.push({
        weekKey: key,
        weekStart: toDateKey(d),
        grams: round1(byWeek[key] || 0),
      });
    }
    return out;
  }

  // Current alcohol-free streak, counting back from today (or yesterday if
  // today already has an entry and you want "prior streak" — kept simple:
  // counts consecutive 0-gram days ending today).
  function currentFreeStreak(entries, today) {
    // No history yet — nothing to report a streak against (avoids a brand
    // new install claiming a multi-year streak just because it has no data).
    if (!entries.length) return 0;
    var byDay = groupByDay(entries);
    var ref = today ? new Date(today) : new Date();
    ref.setHours(0, 0, 0, 0);
    var streak = 0;
    var d = new Date(ref.getTime());
    while (true) {
      var key = toDateKey(d);
      if ((byDay[key] || 0) > 0) break;
      streak++;
      d.setDate(d.getDate() - 1);
      if (streak > 3650) break; // safety valve
    }
    return streak;
  }

  // Free days in the last N days (for the calendar heatmap / weekly summary)
  function freeDaysCount(entries, n, today) {
    if (!entries.length) return 0;
    var days = lastNDays(entries, n, today);
    return days.filter(function (d) {
      return d.grams === 0;
    }).length;
  }

  return {
    ETHANOL_DENSITY: ETHANOL_DENSITY,
    UNIT_GRAMS: UNIT_GRAMS,
    WEEKLY_REFERENCES_G: WEEKLY_REFERENCES_G,
    gramsFromVolumeAbv: gramsFromVolumeAbv,
    unitsFromGrams: unitsFromGrams,
    toDateKey: toDateKey,
    isoWeekKey: isoWeekKey,
    startOfWeek: startOfWeek,
    totalGrams: totalGrams,
    groupByDay: groupByDay,
    groupByWeek: groupByWeek,
    groupByType: groupByType,
    lastNDays: lastNDays,
    lastNWeeks: lastNWeeks,
    currentFreeStreak: currentFreeStreak,
    freeDaysCount: freeDaysCount,
    round1: round1,
  };
});

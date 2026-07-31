const assert = require("assert");
const L = require("./logic.js");

let pass = 0;
function check(label, actual, expected, eps) {
  eps = eps === undefined ? 0.01 : eps;
  const ok =
    typeof expected === "number"
      ? Math.abs(actual - expected) <= eps
      : JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    console.error("FAIL:", label, "got", actual, "expected", expected);
    process.exitCode = 1;
  } else {
    pass++;
  }
}

// --- grams from volume/ABV, cross-checked against NIAAA reference drinks ---
// 12 fl oz (≈355 mL) beer at 5% ABV ≈ 14g (one US standard drink)
check(
  "355ml beer @5% ≈ 14g (NIAAA reference)",
  L.gramsFromVolumeAbv(355, 5),
  14,
  0.6
);
// 5 fl oz (≈148 mL) wine at 12% ABV ≈ 14g
check(
  "148ml wine @12% ≈ 14g (NIAAA reference)",
  L.gramsFromVolumeAbv(148, 12),
  14,
  0.6
);
// 1.5 fl oz (≈44 mL) spirits at 40% ABV ≈ 14g
check(
  "44ml spirits @40% ≈ 14g (NIAAA reference)",
  L.gramsFromVolumeAbv(44, 40),
  14,
  0.6
);

// User's own preset examples
check("500ml beer @5%", L.gramsFromVolumeAbv(500, 5), 500 * 0.05 * 0.789);
check("330ml beer @5%", L.gramsFromVolumeAbv(330, 5), 330 * 0.05 * 0.789);
check("100ml wine @12%", L.gramsFromVolumeAbv(100, 12), 100 * 0.12 * 0.789);

// --- unit conversions ---
check("112g -> 14 UK units", L.unitsFromGrams(112, "uk"), 14);
check("14g -> 1 US standard drink", L.unitsFromGrams(14, "us"), 1);

// --- date helpers ---
check("toDateKey", L.toDateKey(new Date(2026, 6, 31)), "2026-07-31");
// Jan 1 2026 is a Thursday -> ISO week 1 of 2026
check("isoWeekKey Jan 1 2026", L.isoWeekKey(new Date(2026, 0, 1)), "2026-W01");

// --- aggregation ---
const entries = [
  { id: 1, ts: "2026-07-28T19:00:00", type: "beer", grams: 20 },
  { id: 2, ts: "2026-07-28T21:00:00", type: "wine", grams: 10 },
  { id: 3, ts: "2026-07-30T18:00:00", type: "beer", grams: 15 },
];
check("totalGrams", L.totalGrams(entries), 45);
check("groupByType", L.groupByType(entries), { beer: 35, wine: 10 });
check("groupByDay 2026-07-28", L.groupByDay(entries)["2026-07-28"], 30);

const days = L.lastNDays(entries, 5, new Date(2026, 6, 31));
check("lastNDays length", days.length, 5);
check("lastNDays 07-28 total", days.find((d) => d.date === "2026-07-28").grams, 30);
check("lastNDays 07-29 is free", days.find((d) => d.date === "2026-07-29").grams, 0);

check(
  "currentFreeStreak (07-29,07-31 free, 07-30 not) from 07-31",
  L.currentFreeStreak(entries, new Date(2026, 6, 31)),
  1 // today (07-31) is free, but 07-30 had a drink, so streak = 1
);
check(
  "freeDaysCount over last 5 days",
  L.freeDaysCount(entries, 5, new Date(2026, 6, 31)),
  3 // 07-27, 07-29, 07-31 are free out of the 5-day window
);

const weeks = L.lastNWeeks(entries, 3, new Date(2026, 6, 31));
check("lastNWeeks length", weeks.length, 3);

// --- fresh-install guard: no entries should never claim a huge streak ---
check("currentFreeStreak with zero entries", L.currentFreeStreak([], new Date(2026, 6, 31)), 0);
check("freeDaysCount with zero entries", L.freeDaysCount([], 30, new Date(2026, 6, 31)), 0);

console.log(pass + " checks passed" + (process.exitCode ? ", SOME FAILED" : ""));

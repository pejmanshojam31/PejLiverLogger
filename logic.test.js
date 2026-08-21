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

// =================== v2: liters, weed, month/year ===================

// --- liters of pure alcohol (primary unit) vs grams (secondary) ---
// 14g (one US standard drink) of pure ethanol at 0.789 g/mL ≈ 0.01775 L
check("litersFromGrams(14)", L.litersFromGrams(14), 0.01775, 0.0002);
// ABV is already a volume percent, so liters of pure alcohol should equal
// (volumeMl * abv/100) / 1000 regardless of the grams/density round trip.
check(
  "litersFromGrams round-trips with gramsFromVolumeAbv",
  L.litersFromGrams(L.gramsFromVolumeAbv(500, 5)),
  (500 * 0.05) / 1000,
  0.0002
);

// --- weed: mg THC + standard THC units (5mg/unit, NIH-mandated reporting unit) ---
// a 0.5g joint at 20% THC -> 100mg THC -> 20 standard THC units
check("mgThcFromFlower(0.5g, 20%)", L.mgThcFromFlower(0.5, 20), 100);
check("thcUnitsFromMg(100)", L.thcUnitsFromMg(100), 20);
check("thcUnitsFromMg(5) = 1 unit", L.thcUnitsFromMg(5), 1);

// --- generic key-based aggregation reused for weed entries (key: "mgThc") ---
const weedEntries = [
  { id: 1, ts: "2026-07-28T19:00:00", type: "joint", mgThc: 100 },
  { id: 2, ts: "2026-07-29T19:00:00", type: "vape", mgThc: 20 },
  { id: 3, ts: "2026-07-30T19:00:00", type: "joint", mgThc: 100 },
  { id: 4, ts: "2026-07-31T19:00:00", type: "joint", mgThc: 100 },
];
check("totalAmount weed mgThc", L.totalAmount(weedEntries, "mgThc"), 320);
check(
  "usedDaysCountAmount weed, last 5 days incl. 07-27 free",
  L.usedDaysCountAmount(weedEntries, 5, "mgThc", new Date(2026, 6, 31)),
  4 // 07-28..07-31 all have entries, 07-27 doesn't
);
check(
  "freeDaysCountAmount weed, last 5 days",
  L.freeDaysCountAmount(weedEntries, 5, "mgThc", new Date(2026, 6, 31)),
  1
);

// --- month/year grouping (alcohol entries, key: "grams") ---
const spanEntries = [
  { id: 1, ts: "2026-06-15T19:00:00", type: "beer", grams: 10 },
  { id: 2, ts: "2026-07-05T19:00:00", type: "beer", grams: 20 },
  { id: 3, ts: "2026-07-20T19:00:00", type: "wine", grams: 5 },
  { id: 4, ts: "2025-07-10T19:00:00", type: "beer", grams: 50 }, // last year, same month
];
check("monthKey", L.monthKey(new Date(2026, 6, 15)), "2026-07");
check("yearKey", L.yearKey(new Date(2026, 6, 15)), "2026");
check("groupByMonthAmount 2026-07", L.groupByMonthAmount(spanEntries, "grams")["2026-07"], 25);
check("groupByMonthAmount 2026-06", L.groupByMonthAmount(spanEntries, "grams")["2026-06"], 10);

const months = L.lastNMonthsAmount(spanEntries, 3, "grams", new Date(2026, 6, 31)); // May, Jun, Jul 2026
check("lastNMonthsAmount length", months.length, 3);
check("lastNMonthsAmount July total", months.find((m) => m.monthKey === "2026-07").amount, 25);
check("lastNMonthsAmount May is empty", months.find((m) => m.monthKey === "2026-05").amount, 0);

check("yearTotalAmount 2026", L.yearTotalAmount(spanEntries, "grams", "2026"), 35);
check("yearTotalAmount 2025", L.yearTotalAmount(spanEntries, "grams", "2025"), 50);

// grams-only wrappers still behave identically to before this refactor
check("totalGrams wrapper unchanged", L.totalGrams(entries), 45);
check("lastNDays wrapper still returns .grams field", L.lastNDays(entries, 1, new Date(2026, 6, 31))[0].grams, 0);

console.log(pass + " checks passed" + (process.exitCode ? ", SOME FAILED" : ""));

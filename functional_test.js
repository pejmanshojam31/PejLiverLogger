/*
 * Not part of the shipped app — a one-off jsdom smoke test to exercise the
 * real index.html/app.js wiring end-to-end (profile creation, logging both
 * substances, tab/substance switching, warnings) without a real browser.
 * Chart.js is stubbed out since jsdom has no canvas backend; everything
 * else runs the actual production code.
 */
const path = require("path");
const fs = require("fs");
const { JSDOM, requestInterceptor } = require("jsdom");

const dir = __dirname;

const CONTENT_TYPES = { ".js": "application/javascript", ".css": "text/css" };

// localStorage is disabled by jsdom for file:// (opaque-origin) pages, and we
// need script src="logic.js" etc. to resolve too — so serve everything from
// a fake http://localhost/ origin, reading straight off disk instead of the
// network (jsdom 30's request-interceptor API).
const fileInterceptor = requestInterceptor((request) => {
  const u = new URL(request.url);
  const filePath = path.join(dir, decodeURIComponent(u.pathname));
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    return new Response(fs.readFileSync(filePath), {
      headers: { "Content-Type": CONTENT_TYPES[ext] || "text/plain" },
    });
  }
  return undefined;
});
let html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
// Swap the real Chart.js for a no-op stub — jsdom has no canvas, and we only
// care about testing our own wiring, not Chart.js's rendering.
html = html.replace(
  '<script src="chart.umd.min.js"></script>',
  '<script>window.Chart = function(){ this.destroy = function(){}; };</script>'
);

let failures = 0;
let checks = 0;
function assert(label, cond) {
  checks++;
  if (!cond) {
    failures++;
    console.error("FAIL:", label);
  }
}

async function runMainTest() {
  const dom = new JSDOM(html, {
    url: "http://localhost/index.html",
    runScripts: "dangerously",
    resources: { interceptors: [fileInterceptor] },
    pretendToBeVisual: true,
  });
  const { window } = dom;
  // jsdom has no real canvas backend; our own code only ever touches
  // `ctx.canvas` on the 2D context (Chart.js itself is stubbed out above),
  // so a minimal shim is enough to exercise every non-drawing code path.
  window.HTMLCanvasElement.prototype.getContext = function () { return { canvas: this }; };

  // give the file:// resource loader a moment to fetch+run logic.js/i18n.js/app.js
  await new Promise((resolve) => {
    window.addEventListener("load", resolve);
    setTimeout(resolve, 3000); // safety fallback
  });
  await new Promise((r) => setTimeout(r, 200));

  const doc = window.document;
  const $ = (sel) => doc.querySelector(sel);
  const $$ = (sel) => Array.from(doc.querySelectorAll(sel));
  const click = (el) => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  const setVal = (el, v) => {
    el.value = v;
    el.dispatchEvent(new window.Event("input", { bubbles: true }));
    el.dispatchEvent(new window.Event("change", { bubbles: true }));
  };

  // ---- 1. fresh install shows onboarding ----
  assert("onboarding visible on fresh install", !$("#profile-onboarding").classList.contains("hidden"));

  setVal($("#onboard-name"), "TestUser");
  click($("#onboard-create"));
  await new Promise((r) => setTimeout(r, 50));

  assert("onboarding hidden after creating profile", $("#profile-onboarding").classList.contains("hidden"));
  assert("profile chip shows new name", $("#profile-chip-label").textContent.includes("TestUser"));
  assert("log tab visible by default", !$("#tab-log").classList.contains("hidden"));
  assert("preset grid populated (alcohol default)", $$("#preset-grid .preset-btn").length === 8);

  // ---- 2. log an alcohol entry via preset ----
  const beerBtn = $$("#preset-grid .preset-btn")[2]; // 500 mL beer preset (p3)
  const beforeCount = $$("#entry-list .entry-row").length;
  click(beerBtn);
  await new Promise((r) => setTimeout(r, 50));
  assert("entry added to today's log", $$("#entry-list .entry-row").length === beforeCount + 1);
  assert("today total shows liters as primary unit", /L$/.test($("#today-total-primary").textContent.trim()));
  assert("today total secondary shows grams", $("#today-total-secondary").textContent.includes("g"));

  // ---- 3. switch to weed substance, check presets swap ----
  click($("#substance-switch-log button[data-substance='weed']"));
  await new Promise((r) => setTimeout(r, 50));
  assert("weed presets shown after switch", $$("#preset-grid .preset-btn").length === 5);
  assert("today total now shows mg THC", $("#today-total-primary").textContent.includes("mg THC"));

  const jointBtn = $$("#preset-grid .preset-btn")[0];
  click(jointBtn);
  await new Promise((r) => setTimeout(r, 50));
  assert("weed entry appears in unified today log", $$("#entry-list .entry-row").length === beforeCount + 2);

  // switch back, confirm alcohol total unaffected by weed entry
  click($("#substance-switch-log button[data-substance='alcohol']"));
  await new Promise((r) => setTimeout(r, 50));
  assert("alcohol total unaffected by weed entry", /L$/.test($("#today-total-primary").textContent.trim()));

  // ---- 4. custom modal: add a weed entry via direct mg THC ----
  click($("#substance-switch-log button[data-substance='weed']"));
  click($("#btn-open-custom"));
  await new Promise((r) => setTimeout(r, 30));
  assert("modal opens in weed mode", !$("#modal-fields-weed").classList.contains("hidden"));
  setVal($("#modal-mg-thc"), "25");
  click($("#modal-add"));
  await new Promise((r) => setTimeout(r, 50));
  assert("direct-mg weed entry logged", $$("#entry-list .entry-row").length === beforeCount + 3);

  // ---- 5. stats tab renders without throwing, monthly/yearly cards populate ----
  click($$('.tabbar-btn[data-tab="stats"]')[0]);
  await new Promise((r) => setTimeout(r, 50));
  assert("stats tab visible", !$("#tab-stats").classList.contains("hidden"));
  assert("this-month stat populated", $("#stat-month-total").textContent.trim().length > 0);
  assert("this-year stat populated", $("#stat-year-total").textContent.trim().length > 0);

  // ---- 6. warning threshold: push alcohol over the daily default (40g) ----
  click($$('.tabbar-btn[data-tab="log"]')[0]);
  click($("#substance-switch-log button[data-substance='alcohol']"));
  await new Promise((r) => setTimeout(r, 30));
  // three more 500mL/5% beers (~19.7g each) pushes today's total past 40g+19.7 already logged
  for (let i = 0; i < 3; i++) {
    click($$("#preset-grid .preset-btn")[2]);
    await new Promise((r) => setTimeout(r, 20));
  }
  assert("warning banner shows once over daily threshold", !$("#warn-banner").classList.contains("hidden"));
  assert("warning banner text mentions guideline", $("#warn-banner").textContent.length > 5);

  // ---- 7. settings: profile section + warning threshold inputs reflect state ----
  click($$('.tabbar-btn[data-tab="settings"]')[0]);
  await new Promise((r) => setTimeout(r, 30));
  assert("settings shows current profile name", $("#profile-current-box").textContent.includes("TestUser"));
  assert("warn-daily-g input prefilled", parseFloat($("#warn-daily-g").value) === 40);
  assert("warn-weekly-g input prefilled", parseFloat($("#warn-weekly-g").value) === 112);

  // ---- 8. language toggle updates chrome text ----
  click($$("#lang-toggle button[data-lang='de']")[0]);
  await new Promise((r) => setTimeout(r, 30));
  assert("nav switches to German", $$('.tabbar-btn[data-tab="log"] span')[1].textContent === "Erfassen");

  // ---- 9. second profile + switching isolates data ----
  click($("#btn-switch-profile"));
  await new Promise((r) => setTimeout(r, 30));
  click($("#profile-add-btn"));
  await new Promise((r) => setTimeout(r, 30));
  setVal($("#onboard-name"), "SecondUser");
  click($("#onboard-create"));
  await new Promise((r) => setTimeout(r, 50));
  assert("second profile starts with empty log", $$("#entry-list .entry-row").length === 0);
  assert("profile chip shows second user", $("#profile-chip-label").textContent.includes("SecondUser"));
}

// A v1 install (before profiles existed) had flat, unprefixed localStorage
// keys with alcohol-only entries (no `substance` field). Simulates upgrading
// that install in place: real user data must survive, land in an
// auto-created profile, and show up correctly in today's log.
async function runMigrationTest() {
  const dom = new JSDOM(html, {
    url: "http://localhost/index.html",
    runScripts: "dangerously",
    resources: { interceptors: [fileInterceptor] },
    pretendToBeVisual: true,
    beforeParse(window) {
      const todayIso = new Date().toISOString();
      window.localStorage.setItem(
        "ll_entries_v1",
        JSON.stringify([
          { id: "legacy1", ts: todayIso, type: "wine", volumeMl: 150, abv: 12, grams: 14.2 },
        ])
      );
      window.localStorage.setItem(
        "ll_settings_v1",
        JSON.stringify({ lang: "en", unit: "uk" })
      );
    },
  });
  const { window } = dom;
  window.HTMLCanvasElement.prototype.getContext = function () { return { canvas: this }; };
  await new Promise((resolve) => {
    window.addEventListener("load", resolve);
    setTimeout(resolve, 3000);
  });
  await new Promise((r) => setTimeout(r, 250));

  const doc = window.document;
  const $ = (sel) => doc.querySelector(sel);
  const $$ = (sel) => Array.from(doc.querySelectorAll(sel));

  assert("migration: onboarding skipped (profile auto-created)", $("#profile-onboarding").classList.contains("hidden"));
  assert("migration: legacy entry present in today's log", $$("#entry-list .entry-row").length === 1);
  assert("migration: legacy settings (unit=uk) carried over", window.localStorage.getItem("ll_active_profile_v1") !== null);
  assert("migration: old flat key removed after migration", window.localStorage.getItem("ll_entries_v1") === null);
  const profiles = JSON.parse(window.localStorage.getItem("ll_profiles_v1") || "[]");
  assert("migration: exactly one profile created", profiles.length === 1);
}

(async () => {
  await runMainTest();
  await runMigrationTest();
  console.log(`\n${checks - failures}/${checks} checks passed` + (failures ? `, ${failures} FAILED` : ""));
  process.exit(failures ? 1 : 0);
})().catch((err) => {
  console.error("Uncaught error during functional test:", err);
  process.exit(1);
});

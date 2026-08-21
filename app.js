/* LiverLogger — app.js (v2)
   Local multi-profile storage, alcohol + weed tracking, liters-primary
   display, monthly/yearly stats, configurable warning thresholds.
   Everything is local: localStorage only, no network calls. */
(function () {
  "use strict";

  // ---------------------------------------------------------------- keys

  var GLOBAL_KEY_PROFILES = "ll_profiles_v1";
  var GLOBAL_KEY_ACTIVE = "ll_active_profile_v1";
  var LEGACY_KEY_ENTRIES = "ll_entries_v1";
  var LEGACY_KEY_PRESETS = "ll_presets_v1";
  var LEGACY_KEY_SETTINGS = "ll_settings_v1";

  function pk(base, pid) { return base + "__" + pid; }

  var TYPE_EMOJI = {
    beer: "🍺", wine: "🍷", spirits: "🥃", cocktail: "🍸", other: "🍹",
    joint: "🚬", pipe: "🪈", vape: "💨", edible: "🍪",
  };
  var TYPE_COLOR = {
    beer: "#d99a3d", wine: "#8f2d3a", spirits: "#6b4a2f", cocktail: "#2f8f83", other: "#7a7a85",
    joint: "#5a9e4a", pipe: "#3f7a52", vape: "#59b0a8", edible: "#c98a3e",
  };

  var DEFAULT_PRESETS = [
    { id: "p1", substance: "alcohol", type: "beer", volumeMl: 330, abv: 5 },
    { id: "p2", substance: "alcohol", type: "beer", volumeMl: 400, abv: 5 },
    { id: "p3", substance: "alcohol", type: "beer", volumeMl: 500, abv: 5 },
    { id: "p4", substance: "alcohol", type: "wine", volumeMl: 100, abv: 12 },
    { id: "p5", substance: "alcohol", type: "wine", volumeMl: 150, abv: 12 },
    { id: "p6", substance: "alcohol", type: "spirits", volumeMl: 20, abv: 40 },
    { id: "p7", substance: "alcohol", type: "spirits", volumeMl: 40, abv: 40 },
    { id: "p8", substance: "alcohol", type: "cocktail", volumeMl: 250, abv: 12 },
    { id: "w1", substance: "weed", type: "joint", flowerGrams: 0.5, thcPercent: 20 },
    { id: "w2", substance: "weed", type: "joint", flowerGrams: 0.3, thcPercent: 20 },
    { id: "w3", substance: "weed", type: "pipe", flowerGrams: 0.15, thcPercent: 20 },
    { id: "w4", substance: "weed", type: "vape", mgThc: 10 },
    { id: "w5", substance: "weed", type: "edible", mgThc: 10 },
  ];

  var DEFAULT_SETTINGS = { lang: "en", unit: "us" };

  // ---------------------------------------------------------------- storage

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("LiverLogger: failed to read", key, e);
      return fallback;
    }
  }
  function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function getProfiles() { return loadJSON(GLOBAL_KEY_PROFILES, []); }
  function saveProfiles(list) { saveJSON(GLOBAL_KEY_PROFILES, list); }
  function getActiveProfileId() { return localStorage.getItem(GLOBAL_KEY_ACTIVE) || ""; }
  function setActiveProfileId(id) { localStorage.setItem(GLOBAL_KEY_ACTIVE, id); }

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36);
  }

  // Migrate a v1 (single-profile, no-namespace) install into profile "pid".
  function migrateLegacyInto(pid) {
    var legacyEntries = loadJSON(LEGACY_KEY_ENTRIES, null);
    var legacyPresets = loadJSON(LEGACY_KEY_PRESETS, null);
    var legacySettings = loadJSON(LEGACY_KEY_SETTINGS, null);
    if (legacyEntries) saveJSON(pk(LEGACY_KEY_ENTRIES, pid), legacyEntries.map(function (e) {
      // v1 entries had no `substance` field — they were all alcohol.
      return Object.assign({ substance: "alcohol" }, e);
    }));
    if (legacyPresets) saveJSON(pk(LEGACY_KEY_PRESETS, pid), legacyPresets.map(function (p) {
      return Object.assign({ substance: "alcohol" }, p);
    }));
    if (legacySettings) saveJSON(pk(LEGACY_KEY_SETTINGS, pid), legacySettings);
    localStorage.removeItem(LEGACY_KEY_ENTRIES);
    localStorage.removeItem(LEGACY_KEY_PRESETS);
    localStorage.removeItem(LEGACY_KEY_SETTINGS);
    return !!(legacyEntries || legacyPresets || legacySettings);
  }

  // ------------------------------------------------------------- app state

  var activeProfileId = null;
  var state = {
    entries: [],
    presets: [],
    settings: Object.assign({}, DEFAULT_SETTINGS),
    warn: Object.assign({}, Logic.DEFAULT_WARN_THRESHOLDS),
    substance: "alcohol",
    lastAddedId: null,
    charts: {},
  };

  function loadProfileData(pid) {
    state.entries = loadJSON(pk(LEGACY_KEY_ENTRIES, pid), []);
    state.presets = loadJSON(pk(LEGACY_KEY_PRESETS, pid), null) || DEFAULT_PRESETS.slice();
    state.settings = Object.assign({}, DEFAULT_SETTINGS, loadJSON(pk(LEGACY_KEY_SETTINGS, pid), {}));
    state.warn = Object.assign({}, Logic.DEFAULT_WARN_THRESHOLDS, loadJSON(pk("ll_warn_v1", pid), {}));
    persistPresets();
    persistSettings();
    persistWarn();
  }
  function persistEntries() { saveJSON(pk(LEGACY_KEY_ENTRIES, activeProfileId), state.entries); }
  function persistPresets() { saveJSON(pk(LEGACY_KEY_PRESETS, activeProfileId), state.presets); }
  function persistSettings() { saveJSON(pk(LEGACY_KEY_SETTINGS, activeProfileId), state.settings); }
  function persistWarn() { saveJSON(pk("ll_warn_v1", activeProfileId), state.warn); }

  // ------------------------------------------------------------------ i18n

  function lang() { return state.settings.lang; }

  function applyI18n() {
    document.getElementById("html-root").setAttribute("lang", lang());
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = window.I18N.t(el.getAttribute("data-i18n"), lang());
    });
    document.querySelectorAll("#lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang());
    });
    document.querySelectorAll("#unit-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-unit") === state.settings.unit);
    });
  }
  function typeLabel(type) { return window.I18N.t("type." + type, lang()) !== "type." + type
    ? window.I18N.t("type." + type, lang()) : window.I18N.t("wtype." + type, lang()); }

  // -------------------------------------------------------------- utilities

  function isAlcohol() { return state.substance === "alcohol"; }
  function amountKey() { return isAlcohol() ? "grams" : "mgThc"; }
  function substanceEntries() {
    return state.entries.filter(function (e) { return e.substance === state.substance; });
  }
  function unitAbbrev() {
    return { us: lang() === "de" ? "US-Std." : "US std.", uk: "UK", de: "DE" }[state.settings.unit];
  }
  function fmtTime(iso) {
    var d = new Date(iso);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function todayEntries() {
    var key = Logic.toDateKey(new Date());
    return state.entries.filter(function (e) { return Logic.toDateKey(e.ts) === key; });
  }

  // primary/secondary formatting per the "liters primary, grams secondary" ask
  function fmtAlcoholPrimary(grams) { return Logic.litersFromGrams(grams).toFixed(3) + " L"; }
  function fmtAlcoholSecondary(grams) {
    var g = Logic.round1(grams);
    var u = Math.round(Logic.unitsFromGrams(grams, state.settings.unit) * 10) / 10;
    return g + " g · ≈" + u + " " + unitAbbrev();
  }
  function fmtWeedPrimary(mgThc) { return Logic.round1(mgThc) + " mg THC"; }
  function fmtWeedSecondary(mgThc) {
    var u = Math.round(Logic.thcUnitsFromMg(mgThc) * 10) / 10;
    return u + " × 5mg " + (lang() === "de" ? "Einheiten" : "units");
  }
  function fmtPrimary(amount) { return isAlcohol() ? fmtAlcoholPrimary(amount) : fmtWeedPrimary(amount); }
  function fmtSecondary(amount) { return isAlcohol() ? fmtAlcoholSecondary(amount) : fmtWeedSecondary(amount); }

  function entryAmount(e) { return e.substance === "alcohol" ? e.grams : e.mgThc; }
  function entryPrimary(e) { return e.substance === "alcohol" ? fmtAlcoholPrimary(e.grams) : fmtWeedPrimary(e.mgThc); }

  // ---------------------------------------------------------------- toast

  var toastTimer = null;
  function showToast(text, undoFn) {
    var el = document.getElementById("toast");
    document.getElementById("toast-text").textContent = text;
    var undoBtn = document.getElementById("toast-undo");
    undoBtn.style.display = undoFn ? "" : "none";
    undoBtn.onclick = function () { if (undoFn) undoFn(); hideToast(); };
    el.classList.remove("hidden");
    requestAnimationFrame(function () { el.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
  }
  function hideToast() {
    var el = document.getElementById("toast");
    el.classList.remove("show");
    setTimeout(function () { el.classList.add("hidden"); }, 200);
  }

  // ------------------------------------------------------------ entry logic

  function addAlcoholEntry(type, volumeMl, abv) {
    var grams = Logic.round1(Logic.gramsFromVolumeAbv(volumeMl, abv));
    var entry = { id: uid("e"), ts: new Date().toISOString(), substance: "alcohol", type: type, volumeMl: volumeMl, abv: abv, grams: grams };
    commitEntry(entry, TYPE_EMOJI[type] + " " + volumeMl + " mL (" + fmtAlcoholPrimary(grams) + ")");
  }
  function addWeedEntry(type, flowerGrams, thcPercent, mgThcDirect) {
    var mgThc = mgThcDirect > 0 ? mgThcDirect : Logic.mgThcFromFlower(flowerGrams, thcPercent);
    mgThc = Logic.round1(mgThc);
    var entry = { id: uid("e"), ts: new Date().toISOString(), substance: "weed", type: type, flowerGrams: flowerGrams || null, thcPercent: thcPercent || null, mgThc: mgThc };
    commitEntry(entry, TYPE_EMOJI[type] + " " + fmtWeedPrimary(mgThc));
  }
  function commitEntry(entry, label) {
    state.entries.push(entry);
    persistEntries();
    state.lastAddedId = entry.id;
    renderAll();
    showToast((lang() === "de" ? "Hinzugefügt: " : "Added: ") + label, function () { removeEntry(entry.id, true); });
  }
  function removeEntry(id, silent) {
    state.entries = state.entries.filter(function (e) { return e.id !== id; });
    persistEntries();
    renderAll();
    if (!silent) showToast(lang() === "de" ? "Eintrag gelöscht" : "Entry deleted", null);
  }

  // ------------------------------------------------------------- rendering

  function renderTopbarDate() {
    var d = new Date();
    var opts = { weekday: "short", month: "short", day: "numeric" };
    document.getElementById("topbar-date").textContent = d.toLocaleDateString(lang() === "de" ? "de-DE" : "en-US", opts);
  }

  function renderProfileChip() {
    var profiles = getProfiles();
    var me = profiles.find(function (p) { return p.id === activeProfileId; });
    document.getElementById("profile-chip-label").textContent = "👤 " + (me ? me.name : "—");
  }

  function syncSubstanceSwitches() {
    document.querySelectorAll(".substance-switch button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-substance") === state.substance);
    });
  }

  function renderPresetGrid() {
    var grid = document.getElementById("preset-grid");
    grid.innerHTML = "";
    state.presets.filter(function (p) { return p.substance === state.substance; }).forEach(function (p) {
      var btn = document.createElement("button");
      btn.className = "preset-btn";
      if (p.substance === "alcohol") {
        var grams = Logic.round1(Logic.gramsFromVolumeAbv(p.volumeMl, p.abv));
        btn.innerHTML =
          '<span class="preset-emoji">' + TYPE_EMOJI[p.type] + '</span>' +
          '<span class="preset-vol">' + p.volumeMl + ' mL</span>' +
          '<span class="preset-type">' + typeLabel(p.type) + '</span>' +
          '<span class="preset-grams">' + grams + ' g</span>';
        btn.addEventListener("click", function () { addAlcoholEntry(p.type, p.volumeMl, p.abv); });
      } else {
        var mg = Logic.round1(p.mgThc > 0 ? p.mgThc : Logic.mgThcFromFlower(p.flowerGrams, p.thcPercent));
        var sub = p.flowerGrams ? (p.flowerGrams + "g · " + p.thcPercent + "%") : (mg + "mg");
        btn.innerHTML =
          '<span class="preset-emoji">' + TYPE_EMOJI[p.type] + '</span>' +
          '<span class="preset-vol">' + typeLabel(p.type) + '</span>' +
          '<span class="preset-type">' + sub + '</span>' +
          '<span class="preset-grams">' + mg + ' mg</span>';
        btn.addEventListener("click", function () { addWeedEntry(p.type, p.flowerGrams, p.thcPercent, p.mgThc); });
      }
      grid.appendChild(btn);
    });
  }

  function renderTodayCard() {
    var subEntries = todayEntries().filter(function (e) { return e.substance === state.substance; });
    var total = Logic.round1(Logic.totalAmount(subEntries, amountKey()));
    document.getElementById("today-total-primary").textContent = fmtPrimary(total);
    document.getElementById("today-total-secondary").textContent = fmtSecondary(total) + " · " + window.I18N.t("today.units", lang());
    var streak = Logic.currentFreeStreakAmount(substanceEntries(), amountKey());
    var streakEl = document.getElementById("today-streak");
    streakEl.textContent = total === 0 && streak > 0 ? "🔥 " + streak + (lang() === "de" ? " freie Tage" : " free days") : "";
  }

  function renderWarnBanner() {
    var el = document.getElementById("warn-banner");
    var text = "";
    if (isAlcohol()) {
      var alcEntries = substanceEntries();
      var todayTotal = Logic.totalAmount(todayEntries().filter(function (e) { return e.substance === "alcohol"; }), "grams");
      var weekTotal = Logic.lastNWeeksAmount(alcEntries, 1, "grams")[0].amount;
      if (todayTotal > state.warn.alcoholDailyG) {
        text = "⚠️ " + window.I18N.t("warn.overDaily", lang()) + ": " + Logic.round1(todayTotal) + "g (> " + state.warn.alcoholDailyG + "g)";
      } else if (weekTotal > state.warn.alcoholWeeklyG) {
        text = "⚠️ " + window.I18N.t("warn.overWeekly", lang()) + ": " + Logic.round1(weekTotal) + "g (> " + state.warn.alcoholWeeklyG + "g)";
      }
    } else {
      var usedDays = Logic.usedDaysCountAmount(substanceEntries(), 7, "mgThc");
      if (usedDays >= state.warn.weedFrequentDays) {
        text = "⚠️ " + window.I18N.t("warn.weedFrequent", lang()).replace("{n}", usedDays);
      }
    }
    el.textContent = text;
    el.classList.toggle("hidden", !text);
  }

  function renderEntryList() {
    var list = document.getElementById("entry-list");
    var todays = todayEntries().slice().sort(function (a, b) { return b.ts.localeCompare(a.ts); });
    list.innerHTML = "";
    document.getElementById("today-count").textContent = todays.length ? String(todays.length) : "";
    document.getElementById("today-empty-hint").style.display = todays.length ? "none" : "";
    todays.forEach(function (e) {
      var li = document.createElement("li");
      li.className = "entry-row";
      var desc = e.substance === "alcohol" ? (e.volumeMl + " mL · " + typeLabel(e.type)) : (typeLabel(e.type) + (e.flowerGrams ? " · " + e.flowerGrams + "g" : ""));
      li.innerHTML =
        '<span class="entry-time">' + fmtTime(e.ts) + '</span>' +
        '<span class="entry-emoji">' + (TYPE_EMOJI[e.type] || "🍹") + '</span>' +
        '<span class="entry-desc">' + desc + '</span>' +
        '<span class="entry-grams">' + entryPrimary(e) + '</span>' +
        '<button class="entry-delete" aria-label="delete">&times;</button>';
      li.querySelector(".entry-delete").addEventListener("click", function () {
        if (confirm(window.I18N.t("confirm.deleteEntry", lang()))) removeEntry(e.id);
      });
      list.appendChild(li);
    });
  }

  function renderStatCards() {
    var entries = substanceEntries();
    var key = amountKey();
    document.getElementById("stat-free-streak").textContent = Logic.currentFreeStreakAmount(entries, key);
    document.getElementById("stat-free-30").textContent = Logic.freeDaysCountAmount(entries, 30, key) + " / 30";
    var weekTotal = Logic.lastNWeeksAmount(entries, 1, key)[0].amount;
    document.getElementById("stat-week-total").textContent = fmtPrimary(weekTotal);
    var monthTotal = Logic.lastNMonthsAmount(entries, 1, key)[0].amount;
    document.getElementById("stat-month-total").textContent = fmtPrimary(monthTotal);
    var now = new Date();
    document.getElementById("stat-year-total").textContent = fmtPrimary(Logic.yearTotalAmount(entries, key, Logic.yearKey(now)));
    document.getElementById("stat-lastyear-total").textContent = fmtPrimary(Logic.yearTotalAmount(entries, key, String(now.getFullYear() - 1)));
  }

  function destroyChart(k) { if (state.charts[k]) { state.charts[k].destroy(); state.charts[k] = null; } }

  function baseChartOptions(showLegend) {
    return {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#9a99a5" }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { beginAtZero: true, ticks: { color: "#9a99a5" }, grid: { color: "rgba(255,255,255,0.06)" } },
      },
      plugins: { legend: { display: showLegend, labels: { color: "#cfcfd6", boxWidth: 12 } } },
    };
  }

  function renderChart7Day() {
    var entries = substanceEntries();
    var days = Logic.lastNDaysAmount(entries, 7, amountKey());
    var labels = days.map(function (d) {
      return new Date(d.date + "T00:00:00").toLocaleDateString(lang() === "de" ? "de-DE" : "en-US", { weekday: "short" });
    });
    var values = isAlcohol() ? days.map(function (d) { return Logic.litersFromGrams(d.amount); }) : days.map(function (d) { return d.amount; });
    destroyChart("day7");
    state.charts.day7 = new Chart(document.getElementById("chart-7day").getContext("2d"), {
      type: "bar",
      data: { labels: labels, datasets: [{ label: isAlcohol() ? "L" : "mg", data: values, backgroundColor: "#c98a3e", borderRadius: 6, maxBarThickness: 34 }] },
      options: baseChartOptions(false),
    });
  }

  function renderChartWeeks() {
    var entries = substanceEntries();
    var weeks = Logic.lastNWeeksAmount(entries, 10, amountKey());
    var labels = weeks.map(function (w) { return w.weekStart.slice(5); });
    destroyChart("weeks");
    var datasets;
    if (isAlcohol()) {
      var refUk = Logic.litersFromGrams(Logic.WEEKLY_REFERENCES_G.ukCmo14Units);
      var refDe = Logic.litersFromGrams(Logic.WEEKLY_REFERENCES_G.deConservative);
      datasets = [
        { type: "bar", label: "L / " + (lang() === "de" ? "Woche" : "week"), data: weeks.map(function (w) { return Logic.litersFromGrams(w.amount); }), backgroundColor: "#8a6bd1", borderRadius: 6, maxBarThickness: 28 },
        { type: "line", label: "UK 14 units", data: weeks.map(function () { return refUk; }), borderColor: "#c65b5b", borderDash: [6, 4], pointRadius: 0, borderWidth: 1.5 },
        { type: "line", label: "DE ~27g", data: weeks.map(function () { return refDe; }), borderColor: "#3d9f7d", borderDash: [2, 3], pointRadius: 0, borderWidth: 1.5 },
      ];
    } else {
      datasets = [{ type: "bar", label: "mg THC / " + (lang() === "de" ? "Woche" : "week"), data: weeks.map(function (w) { return w.amount; }), backgroundColor: "#5a9e4a", borderRadius: 6, maxBarThickness: 28 }];
    }
    state.charts.weeks = new Chart(document.getElementById("chart-weeks").getContext("2d"), {
      type: "bar", data: { labels: labels, datasets: datasets }, options: baseChartOptions(true),
    });
  }

  function renderChartMonths() {
    var entries = substanceEntries();
    var months = Logic.lastNMonthsAmount(entries, 12, amountKey());
    var labels = months.map(function (m) { return m.monthKey.slice(5); });
    var values = isAlcohol() ? months.map(function (m) { return Logic.litersFromGrams(m.amount); }) : months.map(function (m) { return m.amount; });
    destroyChart("months");
    state.charts.months = new Chart(document.getElementById("chart-months").getContext("2d"), {
      type: "bar",
      data: { labels: labels, datasets: [{ label: isAlcohol() ? "L" : "mg", data: values, backgroundColor: "#4a90c9", borderRadius: 6, maxBarThickness: 22 }] },
      options: baseChartOptions(false),
    });
  }

  function renderChartDonut() {
    var range = parseInt(document.getElementById("donut-range").value, 10) || 30;
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - range);
    var filtered = substanceEntries().filter(function (e) { return new Date(e.ts) >= cutoff; });
    var byType = Logic.groupByTypeAmount(filtered, amountKey());
    var types = Object.keys(byType);
    destroyChart("donut");
    var ctx = document.getElementById("chart-donut").getContext("2d");
    var existingEmpty = ctx.canvas.parentElement.querySelector(".chart-empty");
    if (existingEmpty) existingEmpty.remove();
    if (!types.length) {
      var p = document.createElement("p");
      p.className = "chart-empty muted";
      p.textContent = window.I18N.t("stats.noData", lang());
      ctx.canvas.parentElement.appendChild(p);
      return;
    }
    state.charts.donut = new Chart(ctx, {
      type: "doughnut",
      data: { labels: types.map(typeLabel), datasets: [{ data: types.map(function (t) { return Logic.round1(byType[t]); }), backgroundColor: types.map(function (t) { return TYPE_COLOR[t] || "#999"; }), borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 12, color: "#cfcfd6" } } } },
    });
  }

  function renderHeatmap() {
    var entries = substanceEntries();
    var days = Logic.lastNDaysAmount(entries, 35, amountKey());
    var nonZero = days.map(function (d) { return d.amount; }).filter(function (g) { return g > 0; }).sort(function (a, b) { return a - b; });
    function level(g) {
      if (g === 0 || !nonZero.length) return 0;
      var t1 = nonZero[Math.floor(nonZero.length * 0.33)] || nonZero[0];
      var t2 = nonZero[Math.floor(nonZero.length * 0.66)] || nonZero[nonZero.length - 1];
      if (g <= t1) return 1;
      if (g <= t2) return 2;
      return 3;
    }
    var el = document.getElementById("heatmap");
    el.innerHTML = "";
    var first = new Date(days[0].date + "T00:00:00");
    var lead = (first.getDay() + 6) % 7;
    for (var i = 0; i < lead; i++) {
      var pad = document.createElement("div");
      pad.className = "heat-cell heat-empty";
      el.appendChild(pad);
    }
    days.forEach(function (d) {
      var cell = document.createElement("div");
      cell.className = "heat-cell level-" + level(d.amount);
      cell.title = d.date + " — " + fmtPrimary(d.amount);
      el.appendChild(cell);
    });
  }

  function renderCharts() {
    renderChart7Day();
    renderChartWeeks();
    renderChartMonths();
    renderChartDonut();
    renderHeatmap();
  }

  function renderInfo() {
    var sections = isAlcohol() ? window.I18N.INFO_SECTIONS : window.I18N.INFO_SECTIONS_WEED;
    document.getElementById("info-disclaimer").textContent = window.I18N.t(isAlcohol() ? "info.disclaimer" : "info.disclaimerWeed", lang());
    var el = document.getElementById("info-content");
    el.innerHTML = "";
    sections.forEach(function (sec) {
      var c = sec[lang()];
      var card = document.createElement("div");
      card.className = "info-card";
      var bodyHtml = c.body.split("\n\n").map(function (p) { return "<p>" + escapeHtml(p) + "</p>"; }).join("");
      card.innerHTML = "<h3>" + escapeHtml(c.title) + "</h3>" + bodyHtml +
        '<a class="info-source" href="' + encodeURI(c.url) + '" target="_blank" rel="noopener">' + escapeHtml(c.source) + " ↗</a>";
      el.appendChild(card);
    });
  }
  function escapeHtml(s) { var div = document.createElement("div"); div.textContent = s; return div.innerHTML; }

  function renderPresetManageList() {
    var list = document.getElementById("preset-manage-list");
    list.innerHTML = "";
    state.presets.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "preset-manage-row";
      var desc = p.substance === "alcohol" ? (p.volumeMl + " mL @ " + p.abv + "%") : (p.flowerGrams ? p.flowerGrams + "g @ " + p.thcPercent + "%" : p.mgThc + "mg");
      li.innerHTML = '<span>' + TYPE_EMOJI[p.type] + " " + desc + '</span><button class="link-btn danger">✕</button>';
      li.querySelector("button").addEventListener("click", function () {
        if (confirm(window.I18N.t("confirm.deletePreset", lang()))) {
          state.presets = state.presets.filter(function (x) { return x.id !== p.id; });
          persistPresets();
          renderPresetGrid();
          renderPresetManageList();
        }
      });
      list.appendChild(li);
    });
  }

  function renderProfileSettingsBox() {
    var profiles = getProfiles();
    var me = profiles.find(function (p) { return p.id === activeProfileId; });
    var box = document.getElementById("profile-current-box");
    box.innerHTML = "";
    if (!me) return;
    var nameEl = document.createElement("div");
    nameEl.className = "profile-name-line";
    nameEl.textContent = "👤 " + me.name + (me.pin ? " 🔒" : "");
    var btnRow = document.createElement("div");
    btnRow.className = "btn-row";
    var renameBtn = document.createElement("button");
    renameBtn.className = "btn-secondary";
    renameBtn.textContent = window.I18N.t("profile.rename", lang());
    renameBtn.addEventListener("click", function () {
      var newName = prompt(window.I18N.t("profile.name", lang()), me.name);
      if (newName && newName.trim()) {
        me.name = newName.trim();
        saveProfiles(profiles);
        renderProfileSettingsBox();
        renderProfileChip();
      }
    });
    var deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-danger";
    deleteBtn.textContent = window.I18N.t("profile.delete", lang());
    deleteBtn.addEventListener("click", function () {
      if (!confirm(window.I18N.t("profile.deleteConfirm", lang()))) return;
      deleteProfile(me.id);
    });
    btnRow.appendChild(renameBtn);
    btnRow.appendChild(deleteBtn);
    box.appendChild(nameEl);
    box.appendChild(btnRow);
  }

  function renderWarnInputs() {
    document.getElementById("warn-daily-g").value = state.warn.alcoholDailyG;
    document.getElementById("warn-weekly-g").value = state.warn.alcoholWeeklyG;
    document.getElementById("warn-weed-days").value = state.warn.weedFrequentDays;
  }

  function renderAll() {
    renderTopbarDate();
    renderProfileChip();
    syncSubstanceSwitches();
    renderPresetGrid();
    renderTodayCard();
    renderWarnBanner();
    renderEntryList();
    renderStatCards();
    renderInfo();
    renderPresetManageList();
    renderProfileSettingsBox();
    renderWarnInputs();
    // Charts last, and isolated: a Chart.js/canvas hiccup should never be
    // able to take the rest of the page's rendering down with it.
    try { renderCharts(); } catch (err) { console.warn("LiverLogger: chart render failed", err); }
  }

  // ------------------------------------------------------------- tab nav

  function switchTab(tab) {
    ["log", "stats", "info", "settings"].forEach(function (t) {
      document.getElementById("tab-" + t).classList.toggle("hidden", t !== tab);
    });
    document.querySelectorAll(".tabbar-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    if (tab === "stats") { try { renderCharts(); } catch (err) { console.warn("LiverLogger: chart render failed", err); } }
  }
  document.querySelectorAll(".tabbar-btn").forEach(function (b) {
    b.addEventListener("click", function () { switchTab(b.getAttribute("data-tab")); });
  });

  function setSubstance(sub) {
    state.substance = sub;
    syncSubstanceSwitches();
    renderPresetGrid();
    renderTodayCard();
    renderWarnBanner();
    renderStatCards();
    renderInfo();
    try { renderCharts(); } catch (err) { console.warn("LiverLogger: chart render failed", err); }
  }
  document.querySelectorAll(".substance-switch button").forEach(function (b) {
    b.addEventListener("click", function () { setSubstance(b.getAttribute("data-substance")); });
  });

  // ------------------------------------------------------------- modal

  var modalMode = "log";

  function openModal(mode) {
    modalMode = mode || "log";
    document.getElementById("custom-modal").classList.remove("hidden");
    document.getElementById("modal-heading").textContent = window.I18N.t(isAlcohol() ? "modal.title" : "modal.titleWeed", lang());
    document.getElementById("modal-type-alcohol").classList.toggle("hidden", !isAlcohol());
    document.getElementById("modal-type-weed").classList.toggle("hidden", isAlcohol());
    document.getElementById("modal-fields-alcohol").classList.toggle("hidden", !isAlcohol());
    document.getElementById("modal-fields-weed").classList.toggle("hidden", isAlcohol());
    document.getElementById("modal-volume").value = "";
    document.getElementById("modal-abv").value = "";
    document.getElementById("modal-flower-grams").value = "";
    document.getElementById("modal-thc-percent").value = "";
    document.getElementById("modal-mg-thc").value = "";
    document.getElementById("modal-save-preset").checked = modalMode === "presetOnly";
    document.getElementById("modal-save-preset").parentElement.style.display = modalMode === "presetOnly" ? "none" : "";
    document.getElementById("modal-add").textContent = window.I18N.t(modalMode === "presetOnly" ? "modal.save" : "modal.add", lang());
    setModalType(isAlcohol() ? "beer" : "joint");
    updatePreview();
  }
  function closeModal() { document.getElementById("custom-modal").classList.add("hidden"); }
  var modalType = "beer";
  function setModalType(t) {
    modalType = t;
    var group = isAlcohol() ? "#modal-type-alcohol button" : "#modal-type-weed button";
    document.querySelectorAll(group).forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-type") === t); });
  }
  function updatePreview() {
    var text;
    if (isAlcohol()) {
      var v = parseFloat(document.getElementById("modal-volume").value) || 0;
      var a = parseFloat(document.getElementById("modal-abv").value) || 0;
      var g = Logic.round1(Logic.gramsFromVolumeAbv(v, a));
      text = v + " mL @ " + a + "% ≈ " + fmtAlcoholPrimary(g) + " (" + g + " g)";
    } else {
      var fg = parseFloat(document.getElementById("modal-flower-grams").value) || 0;
      var pct = parseFloat(document.getElementById("modal-thc-percent").value) || 0;
      var mgDirect = parseFloat(document.getElementById("modal-mg-thc").value) || 0;
      var mg = Logic.round1(mgDirect > 0 ? mgDirect : Logic.mgThcFromFlower(fg, pct));
      text = fmtWeedPrimary(mg) + " (" + fmtWeedSecondary(mg) + ")";
    }
    document.getElementById("modal-preview").textContent = text;
  }

  document.getElementById("btn-open-custom").addEventListener("click", function () { openModal("log"); });
  document.getElementById("btn-add-preset").addEventListener("click", function () { openModal("presetOnly"); });
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("custom-modal").addEventListener("click", function (e) { if (e.target.id === "custom-modal") closeModal(); });
  document.querySelectorAll("#modal-type-alcohol button, #modal-type-weed button").forEach(function (b) {
    b.addEventListener("click", function () { setModalType(b.getAttribute("data-type")); });
  });
  document.querySelectorAll(".chip[data-abv]").forEach(function (chip) {
    chip.addEventListener("click", function () { document.getElementById("modal-abv").value = chip.getAttribute("data-abv"); updatePreview(); });
  });
  document.querySelectorAll(".chip[data-thc]").forEach(function (chip) {
    chip.addEventListener("click", function () { document.getElementById("modal-thc-percent").value = chip.getAttribute("data-thc"); updatePreview(); });
  });
  ["modal-volume", "modal-abv", "modal-flower-grams", "modal-thc-percent", "modal-mg-thc"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", updatePreview);
  });

  document.getElementById("modal-add").addEventListener("click", function () {
    var saveAsPreset = document.getElementById("modal-save-preset").checked;
    if (isAlcohol()) {
      var v = parseFloat(document.getElementById("modal-volume").value);
      var a = parseFloat(document.getElementById("modal-abv").value);
      if (!v || v <= 0 || isNaN(a) || a < 0) {
        showToast(lang() === "de" ? "Bitte Menge und Alkoholgehalt angeben" : "Please enter volume and ABV", null);
        return;
      }
      if (saveAsPreset) { state.presets.push({ id: uid("p"), substance: "alcohol", type: modalType, volumeMl: v, abv: a }); persistPresets(); renderPresetGrid(); renderPresetManageList(); }
      if (modalMode === "log") addAlcoholEntry(modalType, v, a);
      else showToast(lang() === "de" ? "Button gespeichert" : "Button saved", null);
    } else {
      var fg = parseFloat(document.getElementById("modal-flower-grams").value) || 0;
      var pct = parseFloat(document.getElementById("modal-thc-percent").value) || 0;
      var mgDirect = parseFloat(document.getElementById("modal-mg-thc").value) || 0;
      if (fg <= 0 && mgDirect <= 0) {
        showToast(lang() === "de" ? "Bitte Menge angeben" : "Please enter an amount", null);
        return;
      }
      if (saveAsPreset) { state.presets.push({ id: uid("p"), substance: "weed", type: modalType, flowerGrams: mgDirect > 0 ? null : fg, thcPercent: mgDirect > 0 ? null : pct, mgThc: mgDirect > 0 ? mgDirect : null }); persistPresets(); renderPresetGrid(); renderPresetManageList(); }
      if (modalMode === "log") addWeedEntry(modalType, fg, pct, mgDirect);
      else showToast(lang() === "de" ? "Button gespeichert" : "Button saved", null);
    }
    closeModal();
  });

  // ------------------------------------------------------------- settings

  document.querySelectorAll("#lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { state.settings.lang = b.getAttribute("data-lang"); persistSettings(); applyI18n(); renderAll(); });
  });
  document.querySelectorAll("#unit-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { state.settings.unit = b.getAttribute("data-unit"); persistSettings(); applyI18n(); renderAll(); });
  });
  document.getElementById("donut-range").addEventListener("change", renderChartDonut);

  ["warn-daily-g", "warn-weekly-g", "warn-weed-days"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function () {
      state.warn.alcoholDailyG = parseFloat(document.getElementById("warn-daily-g").value) || Logic.DEFAULT_WARN_THRESHOLDS.alcoholDailyG;
      state.warn.alcoholWeeklyG = parseFloat(document.getElementById("warn-weekly-g").value) || Logic.DEFAULT_WARN_THRESHOLDS.alcoholWeeklyG;
      state.warn.weedFrequentDays = parseInt(document.getElementById("warn-weed-days").value, 10) || Logic.DEFAULT_WARN_THRESHOLDS.weedFrequentDays;
      persistWarn();
      renderWarnBanner();
    });
  });

  document.getElementById("btn-export").addEventListener("click", function () {
    var payload = { exportedAt: new Date().toISOString(), profile: activeProfileId, entries: state.entries, presets: state.presets, settings: state.settings, warn: state.warn };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "liverlogger-backup-" + Logic.toDateKey(new Date()) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });
  document.getElementById("btn-import").addEventListener("click", function () { document.getElementById("import-file").click(); });
  document.getElementById("import-file").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (Array.isArray(data.entries)) state.entries = state.entries.concat(data.entries);
        if (Array.isArray(data.presets)) state.presets = data.presets;
        persistEntries(); persistPresets(); renderAll();
        showToast(lang() === "de" ? "Import erfolgreich" : "Import successful", null);
      } catch (err) { showToast(lang() === "de" ? "Ungültige Datei" : "Invalid file", null); }
    };
    reader.readAsText(file);
    e.target.value = "";
  });
  document.getElementById("btn-clear").addEventListener("click", function () {
    if (!confirm(window.I18N.t("confirm.clear1", lang()))) return;
    if (!confirm(window.I18N.t("confirm.clear2", lang()))) return;
    state.entries = []; persistEntries(); renderAll();
  });

  // ------------------------------------------------------------- profiles

  function createProfile(name, pin) {
    var profiles = getProfiles();
    var p = { id: uid("prof"), name: name, pin: pin || "", createdAt: new Date().toISOString() };
    profiles.push(p);
    saveProfiles(profiles);
    return p;
  }
  function deleteProfile(pid) {
    var profiles = getProfiles().filter(function (p) { return p.id !== pid; });
    saveProfiles(profiles);
    localStorage.removeItem(pk(LEGACY_KEY_ENTRIES, pid));
    localStorage.removeItem(pk(LEGACY_KEY_PRESETS, pid));
    localStorage.removeItem(pk(LEGACY_KEY_SETTINGS, pid));
    localStorage.removeItem(pk("ll_warn_v1", pid));
    if (profiles.length) {
      activateProfile(profiles[0].id);
    } else {
      localStorage.removeItem(GLOBAL_KEY_ACTIVE);
      location.reload();
    }
  }
  function activateProfile(pid) {
    activeProfileId = pid;
    setActiveProfileId(pid);
    loadProfileData(pid);
    document.getElementById("profile-switch-sheet").classList.add("hidden");
    document.getElementById("profile-pin-prompt").classList.add("hidden");
    document.getElementById("profile-onboarding").classList.add("hidden");
    applyI18n();
    renderAll();
  }

  function renderProfileList() {
    var list = document.getElementById("profile-list");
    list.innerHTML = "";
    getProfiles().forEach(function (p) {
      var li = document.createElement("li");
      li.className = "profile-list-row";
      li.textContent = "👤 " + p.name + (p.pin ? " 🔒" : "") + (p.id === activeProfileId ? " ✓" : "");
      li.addEventListener("click", function () {
        if (p.pin) { promptForPin(p); } else { activateProfile(p.id); }
      });
      list.appendChild(li);
    });
  }

  var pinTargetProfile = null;
  function promptForPin(profile) {
    pinTargetProfile = profile;
    document.getElementById("pin-prompt-input").value = "";
    document.getElementById("pin-prompt-error").classList.add("hidden");
    document.getElementById("profile-switch-sheet").classList.add("hidden");
    document.getElementById("profile-pin-prompt").classList.remove("hidden");
  }
  document.getElementById("pin-prompt-enter").addEventListener("click", function () {
    var val = document.getElementById("pin-prompt-input").value;
    if (pinTargetProfile && val === pinTargetProfile.pin) {
      activateProfile(pinTargetProfile.id);
    } else {
      document.getElementById("pin-prompt-error").classList.remove("hidden");
    }
  });
  document.getElementById("pin-prompt-cancel").addEventListener("click", function () {
    document.getElementById("profile-pin-prompt").classList.add("hidden");
    document.getElementById("profile-switch-sheet").classList.remove("hidden");
  });

  document.getElementById("profile-chip").addEventListener("click", openSwitchSheet);
  document.getElementById("btn-switch-profile").addEventListener("click", openSwitchSheet);
  function openSwitchSheet() { renderProfileList(); document.getElementById("profile-switch-sheet").classList.remove("hidden"); }
  document.getElementById("profile-switch-cancel").addEventListener("click", function () {
    document.getElementById("profile-switch-sheet").classList.add("hidden");
  });
  document.getElementById("profile-add-btn").addEventListener("click", function () {
    document.getElementById("profile-switch-sheet").classList.add("hidden");
    document.getElementById("onboard-name").value = "";
    document.getElementById("onboard-pin").value = "";
    document.getElementById("profile-onboarding").classList.remove("hidden");
  });
  document.getElementById("onboard-create").addEventListener("click", function () {
    var name = document.getElementById("onboard-name").value.trim();
    var pin = document.getElementById("onboard-pin").value.trim();
    if (!name) { showToast(window.I18N.t("profile.needName", lang()), null); return; }
    var p = createProfile(name, pin);
    activateProfile(p.id);
  });

  // ------------------------------------------------------------------ boot

  document.getElementById("version-line").textContent = "LiverLogger v2.0 · offline-first";

  (function boot() {
    var profiles = getProfiles();
    if (!profiles.length) {
      // First-ever load: migrate a v1 (pre-profile) install if present, else
      // show the "who's tracking" onboarding screen.
      var tempId = uid("prof");
      var migrated = migrateLegacyInto(tempId);
      if (migrated) {
        var p = createProfile("You", "");
        // move the data we just migrated under tempId to the real profile id
        ["ll_entries_v1", "ll_presets_v1", "ll_settings_v1", "ll_warn_v1"].forEach(function (base) {
          var val = localStorage.getItem(pk(base, tempId));
          if (val !== null) { localStorage.setItem(pk(base, p.id), val); localStorage.removeItem(pk(base, tempId)); }
        });
        activateProfile(p.id);
        return;
      }
      document.getElementById("profile-onboarding").classList.remove("hidden");
      applyI18n();
      return;
    }
    var activeId = getActiveProfileId();
    var active = profiles.find(function (p) { return p.id === activeId; }) || profiles[0];
    if (active.pin) {
      applyI18n();
      promptForPin(active);
      document.getElementById("profile-switch-sheet").classList.add("hidden");
    } else {
      activateProfile(active.id);
    }
  })();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function (err) {
        console.warn("Service worker registration failed:", err);
      });
    });
  }
})();

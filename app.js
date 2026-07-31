/* LiverLogger — app.js
   Wires up storage, presets, quick-add logging, charts, and settings.
   Everything is local: localStorage only, no network calls. */
(function () {
  "use strict";

  var KEY_ENTRIES = "ll_entries_v1";
  var KEY_PRESETS = "ll_presets_v1";
  var KEY_SETTINGS = "ll_settings_v1";

  var TYPE_EMOJI = {
    beer: "🍺",
    wine: "🍷",
    spirits: "🥃",
    cocktail: "🍸",
    other: "🍹",
  };
  var TYPE_COLOR = {
    beer: "#d99a3d",
    wine: "#8f2d3a",
    spirits: "#6b4a2f",
    cocktail: "#2f8f83",
    other: "#7a7a85",
  };

  var DEFAULT_PRESETS = [
    { id: "p1", type: "beer", volumeMl: 330, abv: 5, en: "Beer 330 mL", de: "Bier 330 mL" },
    { id: "p2", type: "beer", volumeMl: 400, abv: 5, en: "Beer 400 mL", de: "Bier 400 mL" },
    { id: "p3", type: "beer", volumeMl: 500, abv: 5, en: "Beer 500 mL", de: "Bier 500 mL" },
    { id: "p4", type: "wine", volumeMl: 100, abv: 12, en: "Wine 100 mL", de: "Wein 100 mL" },
    { id: "p5", type: "wine", volumeMl: 150, abv: 12, en: "Wine 150 mL", de: "Wein 150 mL" },
    { id: "p6", type: "spirits", volumeMl: 20, abv: 40, en: "Shot 20 mL", de: "Schnaps 20 mL" },
    { id: "p7", type: "spirits", volumeMl: 40, abv: 40, en: "Shot 40 mL", de: "Schnaps 40 mL" },
    { id: "p8", type: "cocktail", volumeMl: 250, abv: 12, en: "Cocktail 250 mL", de: "Cocktail 250 mL" },
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
  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  var state = {
    entries: loadJSON(KEY_ENTRIES, []),
    presets: loadJSON(KEY_PRESETS, null) || DEFAULT_PRESETS.slice(),
    settings: Object.assign({}, DEFAULT_SETTINGS, loadJSON(KEY_SETTINGS, {})),
    lastAddedId: null,
    charts: {},
  };
  if (!loadJSON(KEY_PRESETS, null)) saveJSON(KEY_PRESETS, state.presets);
  if (!loadJSON(KEY_SETTINGS, null)) saveJSON(KEY_SETTINGS, state.settings);

  function persistEntries() { saveJSON(KEY_ENTRIES, state.entries); }
  function persistPresets() { saveJSON(KEY_PRESETS, state.presets); }
  function persistSettings() { saveJSON(KEY_SETTINGS, state.settings); }

  // ------------------------------------------------------------------ i18n

  function lang() { return state.settings.lang; }

  function applyI18n() {
    document.getElementById("html-root").setAttribute("lang", lang());
    var nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach(function (el) {
      el.textContent = window.I18N.t(el.getAttribute("data-i18n"), lang());
    });
    document.querySelectorAll("#lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang());
    });
    document.querySelectorAll("#unit-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-unit") === state.settings.unit);
    });
  }

  function typeLabel(type) {
    return window.I18N.t("type." + type, lang());
  }

  // -------------------------------------------------------------- utilities

  function fmtGrams(g) {
    return Logic.round1(g) + " g";
  }
  function fmtUnits(g) {
    var n = Logic.unitsFromGrams(g, state.settings.unit);
    return (Math.round(n * 10) / 10) + " " + unitAbbrev();
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
  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36);
  }

  // ---------------------------------------------------------------- toast

  var toastTimer = null;
  function showToast(text, undoFn) {
    var el = document.getElementById("toast");
    document.getElementById("toast-text").textContent = text;
    var undoBtn = document.getElementById("toast-undo");
    undoBtn.style.display = undoFn ? "" : "none";
    undoBtn.onclick = function () {
      if (undoFn) undoFn();
      hideToast();
    };
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

  function addEntry(type, volumeMl, abv) {
    var grams = Logic.gramsFromVolumeAbv(volumeMl, abv);
    var entry = {
      id: uid("e"),
      ts: new Date().toISOString(),
      type: type,
      volumeMl: volumeMl,
      abv: abv,
      grams: Logic.round1(grams),
    };
    state.entries.push(entry);
    persistEntries();
    state.lastAddedId = entry.id;
    renderAll();
    var label = TYPE_EMOJI[type] + " " + volumeMl + " mL (" + fmtGrams(entry.grams) + ")";
    showToast(
      (lang() === "de" ? "Hinzugefügt: " : "Added: ") + label,
      function () { removeEntry(entry.id, true); }
    );
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
    document.getElementById("topbar-date").textContent =
      d.toLocaleDateString(lang() === "de" ? "de-DE" : "en-US", opts);
  }

  function renderPresetGrid() {
    var grid = document.getElementById("preset-grid");
    grid.innerHTML = "";
    state.presets.forEach(function (p) {
      var grams = Logic.round1(Logic.gramsFromVolumeAbv(p.volumeMl, p.abv));
      var btn = document.createElement("button");
      btn.className = "preset-btn";
      btn.innerHTML =
        '<span class="preset-emoji">' + (TYPE_EMOJI[p.type] || "🍹") + '</span>' +
        '<span class="preset-vol">' + p.volumeMl + ' mL</span>' +
        '<span class="preset-type">' + typeLabel(p.type) + '</span>' +
        '<span class="preset-grams">' + grams + ' g</span>';
      btn.addEventListener("click", function () { addEntry(p.type, p.volumeMl, p.abv); });
      grid.appendChild(btn);
    });
  }

  function renderTodayCard() {
    var todays = todayEntries();
    var total = Logic.round1(Logic.totalGrams(todays));
    document.getElementById("today-total-grams").textContent = total + " g";
    document.getElementById("today-total-units").textContent =
      "≈ " + fmtUnits(total) + " · " + window.I18N.t("today.units", lang());
    var streak = Logic.currentFreeStreak(state.entries);
    var streakEl = document.getElementById("today-streak");
    if (total === 0 && streak > 0) {
      streakEl.textContent = "🔥 " + streak + (lang() === "de" ? " freie Tage" : " free days");
    } else {
      streakEl.textContent = "";
    }
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
      li.innerHTML =
        '<span class="entry-time">' + fmtTime(e.ts) + '</span>' +
        '<span class="entry-emoji">' + (TYPE_EMOJI[e.type] || "🍹") + '</span>' +
        '<span class="entry-desc">' + e.volumeMl + ' mL &middot; ' + typeLabel(e.type) + '</span>' +
        '<span class="entry-grams">' + fmtGrams(e.grams) + '</span>' +
        '<button class="entry-delete" aria-label="delete">&times;</button>';
      li.querySelector(".entry-delete").addEventListener("click", function () {
        if (confirm(window.I18N.t("confirm.deleteEntry", lang()))) removeEntry(e.id);
      });
      list.appendChild(li);
    });
  }

  function renderStatCards() {
    document.getElementById("stat-free-streak").textContent = Logic.currentFreeStreak(state.entries);
    document.getElementById("stat-free-30").textContent = Logic.freeDaysCount(state.entries, 30) + " / 30";
    var weeks = Logic.lastNWeeks(state.entries, 1);
    var weekTotal = weeks[0] ? weeks[0].grams : 0;
    document.getElementById("stat-week-total").textContent = fmtGrams(weekTotal);
  }

  function destroyChart(key) {
    if (state.charts[key]) { state.charts[key].destroy(); state.charts[key] = null; }
  }

  function renderChart7Day() {
    var days = Logic.lastNDays(state.entries, 7);
    var labels = days.map(function (d) {
      var dt = new Date(d.date + "T00:00:00");
      return dt.toLocaleDateString(lang() === "de" ? "de-DE" : "en-US", { weekday: "short" });
    });
    destroyChart("day7");
    var ctx = document.getElementById("chart-7day").getContext("2d");
    state.charts.day7 = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "g",
          data: days.map(function (d) { return d.grams; }),
          backgroundColor: "#c98a3e",
          borderRadius: 6,
          maxBarThickness: 34,
        }],
      },
      options: baseChartOptions(false),
    });
  }

  function renderChartWeeks() {
    var weeks = Logic.lastNWeeks(state.entries, 10);
    var labels = weeks.map(function (w) { return w.weekStart.slice(5); });
    var refUk = Logic.WEEKLY_REFERENCES_G.ukCmo14Units;
    var refDe = Logic.WEEKLY_REFERENCES_G.deConservative;
    destroyChart("weeks");
    var ctx = document.getElementById("chart-weeks").getContext("2d");
    state.charts.weeks = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            type: "bar",
            label: lang() === "de" ? "g / Woche" : "g / week",
            data: weeks.map(function (w) { return w.grams; }),
            backgroundColor: "#8a6bd1",
            borderRadius: 6,
            maxBarThickness: 28,
          },
          {
            type: "line",
            label: "UK 14 units (112g)",
            data: weeks.map(function () { return refUk; }),
            borderColor: "#c65b5b",
            borderDash: [6, 4],
            pointRadius: 0,
            borderWidth: 1.5,
          },
          {
            type: "line",
            label: "DE ~27g",
            data: weeks.map(function () { return refDe; }),
            borderColor: "#3d9f7d",
            borderDash: [2, 3],
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: baseChartOptions(true),
    });
  }

  function renderChartDonut() {
    var range = parseInt(document.getElementById("donut-range").value, 10) || 30;
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    var filtered = state.entries.filter(function (e) { return new Date(e.ts) >= cutoff; });
    var byType = Logic.groupByType(filtered);
    var types = Object.keys(byType);
    destroyChart("donut");
    var ctx = document.getElementById("chart-donut").getContext("2d");
    if (!types.length) {
      state.charts.donut = null;
      ctx.canvas.parentElement.querySelector(".chart-empty")?.remove();
      var p = document.createElement("p");
      p.className = "chart-empty muted";
      p.textContent = window.I18N.t("stats.noData", lang());
      ctx.canvas.parentElement.appendChild(p);
      return;
    }
    ctx.canvas.parentElement.querySelector(".chart-empty")?.remove();
    state.charts.donut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: types.map(typeLabel),
        datasets: [{
          data: types.map(function (t) { return Logic.round1(byType[t]); }),
          backgroundColor: types.map(function (t) { return TYPE_COLOR[t] || "#999"; }),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, color: "#cfcfd6" } } },
      },
    });
  }

  function baseChartOptions(showLegend) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#9a99a5" }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { beginAtZero: true, ticks: { color: "#9a99a5" }, grid: { color: "rgba(255,255,255,0.06)" } },
      },
      plugins: { legend: { display: showLegend, labels: { color: "#cfcfd6", boxWidth: 12 } } },
    };
  }

  function renderHeatmap() {
    var days = Logic.lastNDays(state.entries, 35);
    var nonZero = days.map(function (d) { return d.grams; }).filter(function (g) { return g > 0; }).sort(function (a, b) { return a - b; });
    function level(g) {
      if (g === 0 || !nonZero.length) return 0;
      var idx1 = Math.floor(nonZero.length * 0.33);
      var idx2 = Math.floor(nonZero.length * 0.66);
      var t1 = nonZero[idx1] || nonZero[0];
      var t2 = nonZero[idx2] || nonZero[nonZero.length - 1];
      if (g <= t1) return 1;
      if (g <= t2) return 2;
      return 3;
    }
    var el = document.getElementById("heatmap");
    el.innerHTML = "";
    // pad to start on Monday
    var first = new Date(days[0].date + "T00:00:00");
    var lead = (first.getDay() + 6) % 7;
    for (var i = 0; i < lead; i++) {
      var pad = document.createElement("div");
      pad.className = "heat-cell heat-empty";
      el.appendChild(pad);
    }
    days.forEach(function (d) {
      var cell = document.createElement("div");
      cell.className = "heat-cell level-" + level(d.grams);
      cell.title = d.date + " — " + d.grams + " g";
      el.appendChild(cell);
    });
  }

  function renderCharts() {
    renderChart7Day();
    renderChartWeeks();
    renderChartDonut();
    renderHeatmap();
  }

  function renderInfo() {
    var el = document.getElementById("info-content");
    el.innerHTML = "";
    window.I18N.INFO_SECTIONS.forEach(function (sec) {
      var c = sec[lang()];
      var card = document.createElement("div");
      card.className = "info-card";
      var bodyHtml = c.body.split("\n\n").map(function (p) {
        return "<p>" + escapeHtml(p) + "</p>";
      }).join("");
      card.innerHTML =
        "<h3>" + escapeHtml(c.title) + "</h3>" +
        bodyHtml +
        '<a class="info-source" href="' + encodeURI(c.url) + '" target="_blank" rel="noopener">' +
        escapeHtml(c.source) + " ↗</a>";
      el.appendChild(card);
    });
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function renderPresetManageList() {
    var list = document.getElementById("preset-manage-list");
    list.innerHTML = "";
    state.presets.forEach(function (p) {
      var li = document.createElement("li");
      li.className = "preset-manage-row";
      li.innerHTML =
        '<span>' + TYPE_EMOJI[p.type] + " " + p.volumeMl + " mL @ " + p.abv + "%</span>" +
        '<button class="link-btn danger">✕</button>';
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

  function renderAll() {
    renderTopbarDate();
    renderPresetGrid();
    renderTodayCard();
    renderEntryList();
    renderStatCards();
    renderCharts();
    renderInfo();
    renderPresetManageList();
  }

  // ------------------------------------------------------------- tab nav

  function switchTab(tab) {
    ["log", "stats", "info", "settings"].forEach(function (t) {
      document.getElementById("tab-" + t).classList.toggle("hidden", t !== tab);
    });
    document.querySelectorAll(".tabbar-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    if (tab === "stats") renderCharts();
  }

  document.querySelectorAll(".tabbar-btn").forEach(function (b) {
    b.addEventListener("click", function () { switchTab(b.getAttribute("data-tab")); });
  });

  // ------------------------------------------------------------- modal

  var modalType = "beer";
  var modalMode = "log";

  function openModal(mode) {
    modalMode = mode || "log";
    document.getElementById("custom-modal").classList.remove("hidden");
    document.getElementById("modal-volume").value = "";
    document.getElementById("modal-abv").value = "";
    document.getElementById("modal-save-preset").checked = modalMode === "presetOnly";
    document.getElementById("modal-save-preset").parentElement.style.display =
      modalMode === "presetOnly" ? "none" : "";
    document.getElementById("modal-add").textContent =
      window.I18N.t(modalMode === "presetOnly" ? "modal.save" : "modal.add", lang());
    setModalType("beer");
    updatePreview();
  }
  function closeModal() { document.getElementById("custom-modal").classList.add("hidden"); }
  function setModalType(t) {
    modalType = t;
    document.querySelectorAll("#modal-type button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-type") === t);
    });
  }
  function updatePreview() {
    var v = parseFloat(document.getElementById("modal-volume").value) || 0;
    var a = parseFloat(document.getElementById("modal-abv").value) || 0;
    var g = Logic.round1(Logic.gramsFromVolumeAbv(v, a));
    document.getElementById("modal-preview").textContent = v + " mL @ " + a + "% ≈ " + g + " g";
  }

  document.getElementById("btn-open-custom").addEventListener("click", function () { openModal("log"); });
  document.getElementById("btn-add-preset").addEventListener("click", function () { openModal("presetOnly"); });
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("custom-modal").addEventListener("click", function (e) {
    if (e.target.id === "custom-modal") closeModal();
  });
  document.querySelectorAll("#modal-type button").forEach(function (b) {
    b.addEventListener("click", function () { setModalType(b.getAttribute("data-type")); });
  });
  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.getElementById("modal-abv").value = chip.getAttribute("data-abv");
      updatePreview();
    });
  });
  document.getElementById("modal-volume").addEventListener("input", updatePreview);
  document.getElementById("modal-abv").addEventListener("input", updatePreview);

  document.getElementById("modal-add").addEventListener("click", function () {
    var v = parseFloat(document.getElementById("modal-volume").value);
    var a = parseFloat(document.getElementById("modal-abv").value);
    if (!v || v <= 0 || a === undefined || a < 0 || isNaN(a)) {
      showToast(lang() === "de" ? "Bitte Menge und Alkoholgehalt angeben" : "Please enter volume and ABV", null);
      return;
    }
    var saveAsPreset = document.getElementById("modal-save-preset").checked;
    if (saveAsPreset) {
      state.presets.push({
        id: uid("p"),
        type: modalType,
        volumeMl: v,
        abv: a,
        en: typeLabel(modalType) + " " + v + " mL",
        de: typeLabel(modalType) + " " + v + " mL",
      });
      persistPresets();
      renderPresetGrid();
      renderPresetManageList();
    }
    if (modalMode === "log") {
      addEntry(modalType, v, a);
    } else {
      showToast(lang() === "de" ? "Button gespeichert" : "Button saved", null);
    }
    closeModal();
  });

  // ------------------------------------------------------------- settings

  document.querySelectorAll("#lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.settings.lang = b.getAttribute("data-lang");
      persistSettings();
      applyI18n();
      renderAll();
    });
  });
  document.querySelectorAll("#unit-toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.settings.unit = b.getAttribute("data-unit");
      persistSettings();
      applyI18n();
      renderAll();
    });
  });
  document.getElementById("donut-range").addEventListener("change", renderChartDonut);

  document.getElementById("btn-export").addEventListener("click", function () {
    var payload = {
      exportedAt: new Date().toISOString(),
      entries: state.entries,
      presets: state.presets,
      settings: state.settings,
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "liverlogger-backup-" + Logic.toDateKey(new Date()) + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById("btn-import").addEventListener("click", function () {
    document.getElementById("import-file").click();
  });
  document.getElementById("import-file").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (Array.isArray(data.entries)) state.entries = state.entries.concat(data.entries);
        if (Array.isArray(data.presets)) state.presets = data.presets;
        persistEntries();
        persistPresets();
        renderAll();
        showToast(lang() === "de" ? "Import erfolgreich" : "Import successful", null);
      } catch (err) {
        showToast(lang() === "de" ? "Ungültige Datei" : "Invalid file", null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("btn-clear").addEventListener("click", function () {
    if (!confirm(window.I18N.t("confirm.clear1", lang()))) return;
    if (!confirm(window.I18N.t("confirm.clear2", lang()))) return;
    state.entries = [];
    persistEntries();
    renderAll();
  });

  // ------------------------------------------------------------------ init

  document.getElementById("version-line").textContent = "LiverLogger v1.0 · offline-first";

  applyI18n();
  renderAll();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function (err) {
        console.warn("Service worker registration failed:", err);
      });
    });
  }
})();

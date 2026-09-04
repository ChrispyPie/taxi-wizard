TW.register("flow", function (el) {
  if (!document.querySelector('link[href="modules/flow/flow.css"]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "modules/flow/flow.css";
    document.head.appendChild(l);
  }

  var tab = "allt";
  var dir = "ank";
  var openId = "demo-cph";

  var DEMO = [
    { id: "demo-cph", tab: "flyg", dir: "ank", place: "Köpenhamn", code: "SK448", st: "Landat", bad: false, act: "11:22", plan: "11:15", dev: "+7", late: true, extra: [["Land", "Danmark"], ["Gate", "16"], ["Bagage", "Sista 11:38"]] },
    { id: "demo-arn", tab: "flyg", dir: "ank", place: "Stockholm ARN", code: "SK173", st: "I luften", bad: false, act: "12:05", plan: "12:05", dev: "", late: false, extra: [["Land", "Sverige"], ["Gate", "12"], ["Bagage", "Beräknad 12:18"]], now: true },
    { id: "demo-fra", tab: "flyg", dir: "ank", place: "Frankfurt", code: "LH820", st: "Inställd", bad: true, act: "12:40", plan: "12:40", dev: "", late: false, extra: [["Land", "Tyskland"], ["Gate", "—"], ["Bagage", "—"]] },
    { id: "demo-lhr", tab: "flyg", dir: "avg", place: "London LHR", code: "BA815", st: "Startat", bad: false, act: "12:10", plan: "12:00", dev: "+10", late: true, extra: [["Land", "Storbritannien"], ["Gate", "19"], ["Bagage", "—"]] },
    { id: "demo-oslo", tab: "tag", dir: "ank", place: "Oslo S", code: "X 400", st: "På väg", bad: false, act: "12:18", plan: "12:10", dev: "+8", late: true, extra: [["Senast sedd", "Ed"], ["Spår Gbg C", "3"]] },
    { id: "demo-sthlm", tab: "tag", dir: "avg", place: "Stockholm C", code: "Snabbtåg 438", st: "Schemalagd", bad: false, act: "13:02", plan: "13:02", dev: "", late: false, extra: [["Spår Gbg C", "5"]] },
    { id: "demo-frh", tab: "bat", dir: "ank", place: "Frederikshavn DK", code: "Jutlandica / Danica", st: "På väg", bad: false, act: "14:30", plan: "14:30", dev: "", late: false, extra: [["Kaj", "Danmarksterminalen"]] },
    { id: "demo-kiel", tab: "bat", dir: "avg", place: "Kiel DE", code: "Germanica / Scandinavica", st: "Göteborg", bad: false, act: "18:45", plan: "18:45", dev: "", late: false, extra: [["Kaj", "Tysklandsterminalen"]] },
    { id: "demo-bro", tab: "broar", dir: "", place: "Hissingsbron", code: "Öppning", st: "Planerad", bad: false, act: "12:00", plan: "12:00", dev: "", late: false, extra: [["Typ", "Fast tid"]] },
    { id: "demo-ev", tab: "event", dir: "", place: "Ullevi", code: "Evenemang", st: "Demo — tas bort", bad: false, act: "19:00", plan: "19:00", dev: "", late: false, extra: [["Info", "Egna ikoner senare"]] }
  ];

  var TABS = [
    ["allt", "ALLT"],
    ["flyg", "FLYG"],
    ["tag", "TÅG"],
    ["bat", "BÅT"],
    ["broar", "BROAR"],
    ["event", "EVENT"]
  ];

  function visible(r) {
    if (tab !== "allt" && r.tab !== tab) return false;
    if (tab === "allt" || tab === "flyg" || tab === "tag" || tab === "bat") {
      if (r.dir && r.dir !== dir) return false;
    }
    return true;
  }

  function rowHtml(r) {
    var extra = r.extra
      .map(function (kv) {
        return "<span>" + kv[0] + "</span><b>" + kv[1] + "</b>";
      })
      .join("");
    return (
      '<article class="row-item' +
      (r.id === openId ? " open" : "") +
      (r.now ? " now" : "") +
      '" data-row="' + r.id + '">' +
      '<div class="row-time">' +
      '<span class="act">' + r.act + "</span>" +
      '<span class="plan">(' + r.plan + ")</span>" +
      (r.dev
        ? '<span class="dev ' + (r.late ? "late" : "early") + '">' + r.dev + "</span>"
        : "") +
      "</div>" +
      '<div class="row-body">' +
      '<div class="row-place">' + r.place + "</div>" +
      '<div class="row-id">' + r.code + "</div>" +
      '<div class="row-st' + (r.bad ? " bad" : "") + '">' + r.st + "</div>" +
      "</div>" +
      '<button class="row-star" type="button" aria-label="Favorit">☆</button>' +
      '<div class="row-extra">' + extra + "</div>" +
      "</article>"
    );
  }

  function paint() {
    var tabs = TABS.map(function (t) {
      return (
        '<button class="flow-tab' +
        (tab === t[0] ? " on" : "") +
        '" data-tab="' + t[0] + '">' + t[1] + "</button>"
      );
    }).join("");

    var rows = DEMO.filter(visible).map(rowHtml).join("");
    if (!rows) rows = '<p class="empty">Inget i den här fliken än.</p>';

    el.innerHTML =
      '<div class="flow">' +
      '<div class="flow-chrome">' +
      '<div class="flow-tabs">' + tabs + "</div>" +
      '<div class="flow-dir">' +
      '<button class="ank' + (dir === "ank" ? " on" : "") + '" data-dir="ank">ANK</button>' +
      '<button class="avg' + (dir === "avg" ? " on" : "") + '" data-dir="avg">AVG</button>' +
      "</div>" +
      '<div class="flow-tools">' +
      '<div class="left">' +
      '<button class="flow-tool" type="button" title="Favoriter">☆</button>' +
      '<button class="flow-tool" type="button" title="Uppdatera">↻</button>' +
      "</div>" +
      '<span class="flow-win">−1 h · +12 h</span>' +
      '<div class="right">' +
      '<button class="flow-tool" type="button" title="Hoppa till nu">◎</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="flow-list" id="flowList">' +
      '<button class="flow-more" type="button">⌃</button>' +
      rows +
      '<button class="flow-more" type="button">⌄</button>' +
      "</div>" +
      "</div>";
  }

  el.onclick = function (e) {
    var t = e.target.closest("[data-tab]");
    if (t) {
      tab = t.getAttribute("data-tab");
      paint();
      return;
    }
    var d = e.target.closest("[data-dir]");
    if (d) {
      dir = d.getAttribute("data-dir");
      paint();
      return;
    }
    if (e.target.closest(".row-star")) {
      var star = e.target.closest(".row-star");
      star.classList.toggle("on");
      star.textContent = star.classList.contains("on") ? "★" : "☆";
      return;
    }
    var row = e.target.closest("[data-row]");
    if (row) {
      openId = openId === row.getAttribute("data-row") ? "" : row.getAttribute("data-row");
      paint();
    }
  };

  paint();
});

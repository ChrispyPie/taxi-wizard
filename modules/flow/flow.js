TW.register("flow", function (el) {
  if (!document.querySelector('link[href="modules/flow/flow.css"]')) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "modules/flow/flow.css";
    document.head.appendChild(l);
  }

  var tab = "summary";
  var dir = "ank";
  var openId = "demo-cph";

  var ICONS = [
    ["summary", "Allt", '<path d="M4 6h16M4 12h10M4 18h13"/>'],
    ["star", "Sparat", '<path d="M12 3l2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.4l1-5.9L3.4 9.3l6-.9L12 3z"/>'],
    ["flyg", "Flyg", '<path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h0A1.5 1.5 0 0 0 10 3.5V9L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"/>'],
    ["tag", "Tåg", '<rect x="5" y="3" width="14" height="13" rx="2"/><path d="M5 12h14M8 21l2-5h4l2 5"/>'],
    ["bat", "Båt", '<path d="M3 17c2 2 5 3 9 3s7-1 9-3M4 14l8-9 8 9M4 14h16"/>'],
    ["bro", "Broar", '<path d="M4 14h16M6 14V9h12v5M4 18h16"/>'],
    ["event", "Event", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>']
  ];

  var DEMO = [
    { id: "demo-cph", type: "flyg", dir: "ANK", city: "Köpenhamn", title: "SK448", event: "Landat", t: "11:22", planT: "(11:15)", delay: "+7", delayCls: "late", extra: [["Land", "Danmark"], ["Gate", "16"], ["Bagage", "Sista 11:38"]] },
    { id: "demo-arn", type: "flyg", dir: "ANK", city: "Stockholm ARN", title: "SK173", event: "I luften", t: "12:05", planT: "(12:05)", now: true, extra: [["Land", "Sverige"], ["Gate", "12"], ["Bagage", "Beräknad 12:18"]] },
    { id: "demo-fra", type: "flyg", dir: "ANK", city: "Frankfurt", title: "LH820", event: "Inställd", alert: true, t: "12:40", planT: "(12:40)", extra: [["Land", "Tyskland"], ["Gate", "—"], ["Bagage", "—"]] },
    { id: "demo-lhr", type: "flyg", dir: "AVG", city: "London LHR", title: "BA815", event: "Startat", t: "12:10", planT: "(12:00)", delay: "+10", delayCls: "late", extra: [["Land", "Storbritannien"], ["Gate", "19"], ["Bagage", "—"]] },
    { id: "demo-oslo", type: "tag", dir: "ANK", city: "Oslo S", title: "X 400", event: "På väg", t: "12:18", planT: "(12:10)", delay: "+8", delayCls: "late", extra: [["Senast sedd", "Ed"], ["Spår Gbg C", "3"]] },
    { id: "demo-sthlm", type: "tag", dir: "AVG", city: "Stockholm C", title: "Snabbtåg 438", event: "Schemalagd", t: "13:02", planT: "(13:02)", extra: [["Spår Gbg C", "5"]] },
    { id: "demo-frh", type: "bat", dir: "ANK", city: "Frederikshavn DK", title: "Jutlandica / Danica", event: "På väg", t: "14:30", planT: "(14:30)", extra: [["Kaj", '<a class="feed-map" target="_blank" rel="noopener" href="https://maps.google.com/?q=57.701195,11.947163">Danmarksterminalen</a>']] },
    { id: "demo-kiel", type: "bat", dir: "AVG", city: "Kiel DE", title: "Germanica / Scandinavica", event: "Göteborg", t: "18:45", planT: "(18:45)", extra: [["Kaj", '<a class="feed-map" target="_blank" rel="noopener" href="https://maps.google.com/?q=57.6938,11.9144">Tysklandsterminalen</a>']] },
    { id: "demo-bro", type: "bro", dir: "", city: "Hissingsbron", title: "Öppning", event: "Planerad", t: "12:00", planT: "(12:00)", extra: [["Typ", "Fast tid"]] },
    { id: "demo-ev", type: "event", dir: "", city: "Ullevi", title: "Evenemang", event: "Demo — tas bort", t: "19:00", planT: "(19:00)", extra: [["Info", "Egna ikoner senare"]] }
  ];

  function visible(r) {
    if (tab === "star") return false;
    if (tab !== "summary" && r.type !== tab) return false;
    if (r.dir === "ANK" && dir === "avg") return false;
    if (r.dir === "AVG" && dir === "ank") return false;
    return true;
  }

  function rowHtml(r) {
    var chips = '<span class="feed-chip ' + r.type + '"></span>';
    if (r.dir === "ANK") chips += '<span class="feed-chip ank">ANK</span>';
    if (r.dir === "AVG") chips += '<span class="feed-chip avg">AVG</span>';
    var kv = (r.extra || []).map(function (p) {
      return '<div class="feed-k">' + p[0] + '</div><div class="feed-v">' + p[1] + "</div>";
    }).join("");
    return (
      '<div class="feed-item' + (r.now ? " feed-now" : "") + (r.id === openId ? " open" : "") + '" data-sid="' + r.id + '">' +
      '<div class="feed-left">' +
      '<div class="feed-time">' + r.t + "</div>" +
      (r.planT ? '<div class="feed-plan">' + r.planT + "</div>" : "") +
      (r.delay ? '<div class="feed-dev ' + (r.delayCls || "") + '">' + r.delay + "</div>" : "") +
      "</div>" +
      "<div>" +
      '<div class="feed-title feed-chips" hidden>' + chips + '<span class="feed-id">' + r.title + "</span></div>" +
      '<div class="feed-city">' + r.city + "</div>" +
      '<div class="feed-idline">' + r.title + "</div>" +
      '<div class="feed-event' + (r.alert ? " is-alert" : "") + '">' + r.event + "</div>" +
      '<div class="feed-extra"><div class="feed-kv">' + kv + "</div></div>" +
      "</div>" +
      '<button type="button" class="feed-star" data-star="' + r.id + '" aria-label="Spara">★</button>' +
      "</div>"
    );
  }

  function paint() {
    var icons = ICONS.map(function (ic) {
      return (
        '<button type="button" class="flode-icon' + (tab === ic[0] ? " on" : "") + '" data-flode="' + ic[0] + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + ic[2] + "</svg>" +
        ic[1] +
        "</button>"
      );
    }).join("");

    var items = DEMO.filter(visible);
    var list = items.length
      ? items.map(rowHtml).join("")
      : '<p class="empty-hint">Inget att visa med dina filter.</p>';

    el.innerHTML =
      '<div class="flow" id="view-flode">' +
      '<div class="flode-sticky">' +
      '<div class="flode-icons" role="tablist" aria-label="Flöde">' + icons + "</div>" +
      '<div class="flode-toolbar">' +
      '<div class="flode-tools-left">' +
      '<button type="button" class="flode-tool" id="flodeNowBtn" title="Hoppa till nu" aria-label="Hoppa till nu">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>' +
      "</button>" +
      '<button type="button" class="flode-tool" id="flodeRefreshBtn" title="Uppdatera" aria-label="Uppdatera">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.2-5.8"/><path d="M21 4v6h-6"/></svg>' +
      "</button>" +
      '<button type="button" class="flode-tool dir-btn" id="dirMini" title="Byt Ank / Avg">' +
      (dir === "ank" ? "Ank" : "Avg") +
      "</button>" +
      "</div>" +
      '<div class="flode-tools-right">' +
      '<button type="button" class="flode-tool" id="flodeFilterBtn" title="Filter" aria-label="Filter">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>' +
      "</button>" +
      '<button type="button" class="feed-star" id="flodeStarAllBtn" title="Märk eller rensa listan" aria-label="Märk alla">★</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="flow-list" id="flodeScroll">' +
      '<button type="button" class="flode-more" id="flodeMorePast" aria-label="Visa en timme bakåt">⌃</button>' +
      '<div id="flodeList" class="card feed-card">' + list + "</div>" +
      '<button type="button" class="flode-more" id="flodeMoreFuture" aria-label="Visa en timme framåt">⌄</button>' +
      '<p class="hint" id="flodeHint">Flöde = tider. Olyckor och köer ligger under TRAFIK-kartan.</p>' +
      "</div>" +
      "</div>";
  }

  el.onclick = function (e) {
    var ic = e.target.closest("[data-flode]");
    if (ic) {
      tab = ic.getAttribute("data-flode");
      paint();
      return;
    }
    if (e.target.closest("#dirMini")) {
      dir = dir === "ank" ? "avg" : "ank";
      paint();
      return;
    }
    var star = e.target.closest(".feed-star[data-star]");
    if (star) {
      star.classList.toggle("on");
      return;
    }
    var row = e.target.closest(".feed-item[data-sid]");
    if (row) {
      var id = row.getAttribute("data-sid");
      openId = openId === id ? "" : id;
      paint();
    }
  };

  paint();
});

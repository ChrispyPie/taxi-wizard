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
  var helpOpen = false;
  var placeOpen = false;
  var filterOpen = false;
  var savedScroll = 0;
  var refreshing = false;
  var skipRailClick = false;

  var ICONS = [
    ["summary", "Allt", '<path d="M4 6h16M4 12h10M4 18h13"/>'],
    ["star", "Sparat", '<path d="M12 3l2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.4l1-5.9L3.4 9.3l6-.9L12 3z"/>'],
    ["flyg", "Flyg", '<path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2h0A1.5 1.5 0 0 0 10 3.5V9L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"/>'],
    ["tag", "Tåg", '<rect x="5" y="3" width="14" height="13" rx="2"/><path d="M5 12h14M8 21l2-5h4l2 5"/>'],
    ["bat", "Båt", '<path d="M3 17c2 2 5 3 9 3s7-1 9-3M4 14l8-9 8 9M4 14h16"/>'],
    ["bro", "Broar", '<path d="M4 14h16M6 14V9h12v5M4 18h16"/>'],
    ["event", "Event", '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>']
  ];

  var PLACES = {
    flyg: ["Landvetter Flp"],
    tag: ["Göteborg C"],
    other: ["Göteborg"]
  };

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

  function placeList() {
    if (tab === "flyg") return PLACES.flyg;
    if (tab === "tag") return PLACES.tag;
    return PLACES.other;
  }

  function placeLabel() {
    return placeList()[0];
  }

  function visible(r) {
    if (tab === "star") return false;
    if (tab !== "summary" && r.type !== tab) return false;
    if (r.dir === "ANK" && dir === "avg") return false;
    if (r.dir === "AVG" && dir === "ank") return false;
    return true;
  }

  function rowHtml(r) {
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
      '<div class="feed-city">' + r.city + "</div>" +
      '<div class="feed-idline">' + r.title + "</div>" +
      '<div class="feed-event' + (r.alert ? " is-alert" : "") + '">' + r.event + "</div>" +
      '<div class="feed-extra"><div class="feed-kv">' + kv + "</div></div>" +
      "</div>" +
      '<button type="button" class="feed-star" data-star="' + r.id + '" aria-label="Spara">★</button>' +
      "</div>"
    );
  }

  function helpHtml() {
    if (!helpOpen) return "";
    return (
      '<div class="flow-sheet" data-close-sheet="1">' +
      '<div class="flow-card">' +
      "<h3>Så funkar flödet</h3>" +
      "<p><b>Flikar</b> — Allt, Sparat, eller ett trafikslag.</p>" +
      "<p><b>Ank / Avg</b> — ankomst eller avgång. Broar och event påverkas inte.</p>" +
      "<p><b>Plats</b> — station, flygplats eller ort för fliken. Fler platser kommer.</p>" +
      "<p><b>Nu</b> — hoppa till nu.</p>" +
      "<p><b>Uppdatera</b> — dra ner i flikarna eller knappraden.</p>" +
      "<p><b>★</b> — spara en rad. Överst: märk eller rensa synliga rader.</p>" +
      "<p><b>Filter</b> — mer finlir, inte klart än.</p>" +
      '<button type="button" class="flow-card-ok" data-close-sheet="1">Stäng</button>' +
      "</div></div>"
    );
  }

  function filterHtml() {
    return (
      '<button type="button" class="flow-rail' + (filterOpen ? " open" : "") + '" id="filterRail" aria-label="Filter">' + (filterOpen ? "\u203a" : "\u2039") + "</button>" +
      '<div class="flow-scrim' + (filterOpen ? " on" : "") + '" data-close-sheet="1"></div>' +
      '<aside class="flow-drawer' + (filterOpen ? " on" : "") + '">' +
      "<h3>Filter</h3>" +
      "<p>Här kommer extra filter. Inte klart än.</p>" +
      '<button type="button" class="flow-card-ok" data-close-sheet="1">Stäng</button>' +
      "</aside>"
    );
  }

  function paint() {
    var sc0 = document.getElementById("flodeScroll");
    if (sc0) savedScroll = sc0.scrollTop;
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
      '<div class="flode-sticky" id="flodeSticky">' +
      '<div class="flode-icons" role="tablist" aria-label="Flöde">' + icons + "</div>" +
      '<div class="flode-toolbar">' +
      '<div class="flode-tools-left">' +
      '<button type="button" class="flode-tool" id="flodeNowBtn" title="Hoppa till nu" aria-label="Hoppa till nu">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>' +
      "</button>" +
      '<button type="button" class="flode-tool dir-btn" id="dirMini" title="Byt Ank / Avg">' +
      (dir === "ank" ? "Ank" : "Avg") +
      "</button>" +
      "</div>" +
      '<div class="flode-place-wrap' + (placeOpen ? " open" : "") + '">' +
      '<button type="button" class="flode-place" id="placeBtn" title="Plats">' +
      placeLabel() + " ▾</button>" +
      '<div class="place-menu">' +
      placeList().map(function (name) {
        return '<button type="button" class="place-opt on">' + name + "</button>";
      }).join("") +
      "</div></div>" +
      '<div class="flode-tools-right">' +
      '<button type="button" class="flode-tool" id="helpBtn" title="Hjälp" aria-label="Hjälp">?</button>' +
      '<button type="button" class="feed-star" id="flodeStarAllBtn" title="Märk eller rensa listan" aria-label="Märk alla">★</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="ptr" id="ptrBar">↻</div>' +
      '<div class="flow-list" id="flodeScroll">' +
      '<div id="flodeList" class="card feed-card">' +
      '<button type="button" class="feed-more-past" id="flodeMorePast" aria-label="Visa en timme bakåt">⌃</button>' +
      list +
      "</div>" +
      '<button type="button" class="flode-more" id="flodeMoreFuture" aria-label="Visa en timme framåt">⌄</button>' +
      '<p class="hint" id="flodeHint">Flöde = tider. Olyckor och köer ligger under TRAFIK-kartan.</p>' +
      "</div>" +
      helpHtml() +
      filterHtml() +
      "</div>";
    bindRail();
    bindPtr();
    hidePastEnd();
    var sc = document.getElementById("flodeScroll");
    if (sc && savedScroll > 8) sc.scrollTop = savedScroll;
  }

  el.onclick = function (e) {
    if (placeOpen && !e.target.closest(".flode-place-wrap")) {
      placeOpen = false;
      paint();
      return;
    }
    if (e.target.closest(".place-opt")) {
      placeOpen = false;
      paint();
      return;
    }
    if (e.target.closest("[data-close-sheet]")) {
      helpOpen = false;
      placeOpen = false;
      filterOpen = false;
      paint();
      return;
    }
    if (e.target.closest("#filterRail")) {
      if (skipRailClick) { skipRailClick = false; return; }
      filterOpen = !filterOpen;
      helpOpen = false;
      placeOpen = false;
      paint();
      return;
    }
    var ic = e.target.closest("[data-flode]");
    if (ic) {
      tab = ic.getAttribute("data-flode");
      helpOpen = false;
      placeOpen = false;
      filterOpen = false;
      paint();
      return;
    }
    if (e.target.closest("#dirMini")) {
      dir = dir === "ank" ? "avg" : "ank";
      paint();
      return;
    }
    if (e.target.closest("#helpBtn")) {
      helpOpen = !helpOpen;
      placeOpen = false;
      filterOpen = false;
      paint();
      return;
    }
    if (e.target.closest("#placeBtn")) {
      placeOpen = !placeOpen;
      helpOpen = false;
      filterOpen = false;
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

  function setPtr(pull, busy) {
    var bar = document.getElementById("ptrBar");
    if (!bar) return;
    var h = busy ? 36 : Math.min(40, pull * 0.55);
    bar.style.height = h + "px";
    bar.classList.toggle("on", pull > 8 || busy);
    bar.classList.toggle("spin", !!busy);
    bar.textContent = busy ? "\u21bb" : (pull > 56 ? "Släpp" : "\u21bb");
  }

  function runRefresh() {
    if (refreshing) return;
    refreshing = true;
    setPtr(80, true);
    setTimeout(function () {
      refreshing = false;
      savedScroll = 0;
      paint();
    }, 520);
  }

  function hidePastEnd() {
    var sc = document.getElementById("flodeScroll");
    var past = document.getElementById("flodeMorePast");
    if (!sc || !past) return;
    if (sc.scrollTop < 2) sc.scrollTop = past.offsetHeight;
  }

  function bindPtr() {
    var root = document.getElementById("view-flode");
    if (!root || root.getAttribute("data-ptr") === "1") return;
    root.setAttribute("data-ptr", "1");
    var y0 = 0, x0 = 0, tracking = false, armed = false, pull = 0;
    root.addEventListener("touchstart", function (e) {
      if (refreshing || helpOpen || placeOpen || filterOpen) return;
      if (e.target.closest(".flow-rail, .edge-handle")) return;
      var tch = e.changedTouches[0];
      x0 = tch.clientX; y0 = tch.clientY; pull = 0;
      var sc = document.getElementById("flodeScroll");
      var inChrome = !!e.target.closest(".flode-sticky");
      var atTop = sc && sc.scrollTop <= 24;
      armed = inChrome || atTop;
      tracking = armed;
    }, { passive: true });
    root.addEventListener("touchmove", function (e) {
      if (!tracking || !armed) return;
      var tch = e.changedTouches[0];
      var dx = tch.clientX - x0, dy = tch.clientY - y0;
      if (Math.abs(dx) > dy + 6) { tracking = false; setPtr(0, false); return; }
      if (dy < 0) { pull = 0; setPtr(0, false); return; }
      pull = dy;
      setPtr(pull, false);
    }, { passive: true });
    root.addEventListener("touchend", function () {
      if (!tracking) return;
      tracking = false; armed = false;
      if (pull > 56) runRefresh();
      else setPtr(0, false);
      pull = 0;
    }, { passive: true });
  }

  function railW() {
    var d = document.querySelector(".flow-drawer");
    return d ? d.offsetWidth : Math.min(window.innerWidth * 0.78, 280);
  }
  function dragRail(amt) {
    if (amt < 0) amt = 0;
    if (amt > 1) amt = 1;
    var d = document.querySelector(".flow-drawer");
    var h = document.getElementById("filterRail");
    var s = document.querySelector(".flow-scrim");
    var w = railW();
    if (d) {
      d.style.transition = "none";
      d.style.transform = "translateX(" + ((1 - amt) * 105) + "%)";
    }
    if (h) {
      h.style.transition = "none";
      h.style.right = (amt * w) + "px";
      h.textContent = amt > 0.5 ? "\u203a" : "\u2039";
    }
    if (s) {
      s.style.transition = "none";
      s.style.opacity = String(amt);
      s.style.pointerEvents = amt > 0.12 ? "auto" : "none";
    }
    return amt;
  }
  function endRailDrag(amt) {
    var d = document.querySelector(".flow-drawer");
    var h = document.getElementById("filterRail");
    var s = document.querySelector(".flow-scrim");
    if (d) { d.style.transition = ""; d.style.transform = ""; }
    if (h) { h.style.transition = ""; h.style.right = ""; }
    if (s) { s.style.transition = ""; s.style.opacity = ""; s.style.pointerEvents = ""; }
    filterOpen = amt >= 0.35;
    paint();
  }
  function bindRail() {
    var h = document.getElementById("filterRail");
    var d = document.querySelector(".flow-drawer");
    if (!h || h.getAttribute("data-bound") === "1") return;
    h.setAttribute("data-bound", "1");
    var x0 = 0, y0 = 0, start = 0, amt = 0, tracking = false, moved = false;
    function down(e) {
      var t = e.changedTouches[0];
      x0 = t.clientX; y0 = t.clientY;
      start = filterOpen ? 1 : 0;
      amt = start; tracking = true; moved = false;
    }
    function move(e) {
      if (!tracking) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (!moved && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx) + 10 && !moved) { tracking = false; return; }
      moved = true;
      amt = dragRail(start - dx / railW());
    }
    function up() {
      if (!tracking) return;
      tracking = false;
      if (moved) {
        skipRailClick = true;
        endRailDrag(amt);
      }
    }
    h.addEventListener("touchstart", down, { passive: true });
    h.addEventListener("touchmove", move, { passive: true });
    h.addEventListener("touchend", up, { passive: true });
    if (d) {
      d.addEventListener("touchstart", down, { passive: true });
      d.addEventListener("touchmove", move, { passive: true });
      d.addEventListener("touchend", up, { passive: true });
    }
  }

  paint();
});

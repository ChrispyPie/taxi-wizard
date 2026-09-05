(function () {
  var KEY = "tw-settings";
  var HINT_KEY = "tw-menu-hint";
  var loaded = {};
  var mounts = {};
  var app = document.getElementById("app");
  var menuOpen = false;
  var skipMenuClick = false;

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  var S = Object.assign({ size: "md", off: {}, user: "" }, loadSettings());

  function save() {
    localStorage.setItem(KEY, JSON.stringify({ size: S.size, off: S.off, user: S.user || "" }));
  }

  function hintSeen() {
    try {
      return localStorage.getItem(HINT_KEY) === "1";
    } catch (e) {
      return true;
    }
  }

  function markHint() {
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch (e) {}
  }

  function applySize() {
    document.documentElement.setAttribute("data-size", S.size);
  }

  function hash() {
    return (location.hash || "#/").replace(/^#/, "") || "/";
  }

  function go(path) {
    menuOpen = false;
    if (location.hash !== "#" + path) location.hash = path;
    else render();
  }

  function isOn(id) {
    return !S.off[id];
  }

  function setOn(id, on) {
    if (on) delete S.off[id];
    else S.off[id] = true;
    save();
    render();
  }

  function activeId() {
    var path = hash();
    if (path === "/settings") return "settings";
    if (path === "/about") return "about";
    if (path === "/login") return "login";
    var id = path.replace(/^\//, "");
    if (TW_MODULES.filter(function (m) { return m.id === id; })[0]) return id;
    return "home";
  }

  function accountLabel() {
    return S.user || "Logga in";
  }

  function drawerHtml() {
    var act = activeId();
    var mods = TW_MODULES.map(function (m) {
      return (
        '<button class="nav-link' + (act === m.id ? " on" : "") + '" data-go="/' + m.id + '">' +
        '<span class="mark">' + m.mark + "</span>" + m.name +
        "</button>"
      );
    }).join("");
    return (
      '<aside class="drawer' + (menuOpen ? " on" : "") + '" id="drawer">' +
      '<div class="drawer-head"><strong>Taxi Wizard</strong><span>Skal + moduler</span></div>' +
      "<nav>" +
      '<button class="nav-link' + (act === "home" ? " on" : "") + '" data-go="/"><span class="mark">⌂</span>Hem</button>' +
      mods +
      '<div class="nav-sep"></div>' +
      '<button class="nav-link' + (act === "settings" ? " on" : "") + '" data-go="/settings"><span class="mark">⚙</span>Inställningar</button>' +
      '<button class="nav-link' + (act === "login" ? " on" : "") + '" data-go="/login"><span class="mark">👤</span>' + accountLabel() + "</button>" +
      '<button class="nav-link' + (act === "about" ? " on" : "") + '" data-go="/about"><span class="mark">ℹ</span>Om</button>' +
      "</nav>" +
      "</aside>" +
      '<div class="scrim' + (menuOpen ? " on" : "") + '" data-close-menu="1"></div>'
    );
  }

  function handleHtml() {
    return (
      '<button type="button" class="edge-handle' + (menuOpen ? " open" : "") + '" id="edgeHandle" data-menu="1" aria-label="Meny">' + (menuOpen ? "\u2039" : "\u203a") + "</button>" +
      (hintSeen() || menuOpen ? "" : '<div class="edge-hint" id="edgeHint">Svep här för menyn</div>')
    );
  }

  function topBar(title) {
    return '<header class="top"><h1>' + title + "</h1></header>";
  }

  function homeView() {
    var tiles = TW_MODULES.filter(function (m) { return isOn(m.id); })
      .map(function (m) {
        return (
          '<button class="tile" data-go="/' + m.id + '">' +
          '<div class="mark">' + m.mark + "</div>" +
          "<h2>" + m.name + "</h2>" +
          "<p>" + m.desc + "</p>" +
          "</button>"
        );
      })
      .join("");
    if (!tiles) tiles = '<p class="empty">Inga moduler på. Öppna inställningar.</p>';
    return (
      '<main class="view">' +
      '<div class="grid">' + tiles + "</div>" +
      '<p class="hint">En app. Moduler du vill ha. Reklamfritt.</p>' +
      '<p class="foot">0.1.3 · skal</p>' +
      "</main>"
    );
  }

  function settingsView() {
    var sizes = ["sm", "md", "lg", "xl"];
    var labels = { sm: "Liten", md: "Normal", lg: "Stor", xl: "Störst" };
    var sizeBtns = sizes
      .map(function (k) {
        return (
          '<button data-size="' + k + '"' +
          (S.size === k ? ' class="on"' : "") +
          ">" + labels[k] + "</button>"
        );
      })
      .join("");
    var mods = TW_MODULES.map(function (m) {
      var on = isOn(m.id);
      return (
        '<div class="row">' +
        "<div><h3>" + m.name + "</h3><p>" + m.desc + "</p></div>" +
        '<button class="toggle' + (on ? " on" : "") + '" data-mod="' + m.id + '"><i></i></button>' +
        "</div>"
      );
    }).join("");
    return (
      '<main class="view settings">' +
      '<div class="row"><div><h3>Textstorlek</h3><p>För telefon och surfplatta i bilen.</p></div></div>' +
      '<div class="sizes">' + sizeBtns + "</div>" +
      '<div class="row" style="margin-top:18px"><div><h3>Moduler</h3><p>Visa eller dölj rutor på startsidan.</p></div></div>' +
      mods +
      "</main>"
    );
  }

  function aboutView() {
    return (
      '<main class="view">' +
      '<div class="about-box">' +
      "<h2>Om Taxi Wizard</h2>" +
      '<p class="hint">Skal för taximoduler. Flöde, logg och mer. Data ligger lokalt tills inlogg är klart.</p>' +
      '<p class="foot">Version 0.1.3</p>' +
      "</div>" +
      "</main>"
    );
  }

  function loginView() {
    return (
      '<main class="view">' +
      '<div class="login-box">' +
      "<h2>Konto</h2>" +
      '<p class="hint">Google / Apple-inlogg kommer. Just nu räcker ett namn som sparas i telefonen.</p>' +
      '<label for="loginName">Namn</label>' +
      '<input id="loginName" type="text" value="' + (S.user || "") + '" placeholder="Ditt namn">' +
      '<div class="login-actions">' +
      '<button class="primary" data-login="save">Spara</button>' +
      (S.user ? '<button data-login="out">Logga ut</button>' : "") +
      "</div>" +
      "</div>" +
      "</main>"
    );
  }

  function slotView() {
    return '<main class="view slot" id="slot"><p class="empty">Laddar…</p></main>';
  }

  function openMenu() {
    menuOpen = true;
    markHint();
    renderChromeOnly();
  }

  function bind() {
    app.onclick = function (e) {
      if (e.target.closest("#edgeHint")) {
        markHint();
        var hint = document.getElementById("edgeHint");
        if (hint) hint.remove();
        return;
      }
      if (e.target.closest("[data-close-menu]")) {
        menuOpen = false;
        renderChromeOnly();
        return;
      }
      if (e.target.closest("[data-menu]")) {
        if (skipMenuClick) { skipMenuClick = false; return; }
        if (menuOpen) {
          menuOpen = false;
          renderChromeOnly();
        } else {
          openMenu();
        }
        return;
      }
      var goEl = e.target.closest("[data-go]");
      if (goEl) {
        go(goEl.getAttribute("data-go"));
        return;
      }
      var sizeEl = e.target.closest("[data-size]");
      if (sizeEl) {
        S.size = sizeEl.getAttribute("data-size");
        save();
        applySize();
        render();
        return;
      }
      var modEl = e.target.closest("[data-mod]");
      if (modEl) {
        var id = modEl.getAttribute("data-mod");
        setOn(id, !isOn(id));
        return;
      }
      var loginEl = e.target.closest("[data-login]");
      if (loginEl) {
        var act = loginEl.getAttribute("data-login");
        if (act === "out") S.user = "";
        else {
          var inp = document.getElementById("loginName");
          S.user = inp ? String(inp.value || "").trim() : "";
        }
        save();
        go("/");
      }
    };
  }

  function menuW() {
    var d = document.getElementById("drawer");
    return d ? d.offsetWidth : Math.min(window.innerWidth * 0.82, 300);
  }

  function dragMenu(amt) {
    if (amt < 0) amt = 0;
    if (amt > 1) amt = 1;
    var d = document.getElementById("drawer");
    var h = document.getElementById("edgeHandle");
    var s = document.querySelector(".scrim");
    var w = menuW();
    if (d) {
      d.style.transition = "none";
      d.style.transform = "translateX(" + ((amt - 1) * 105) + "%)";
    }
    if (h) {
      h.style.transition = "none";
      h.style.left = (amt * w) + "px";
      h.textContent = amt > 0.5 ? "\u2039" : "\u203a";
    }
    if (s) {
      s.style.transition = "none";
      s.style.opacity = String(amt);
      s.style.pointerEvents = amt > 0.12 ? "auto" : "none";
    }
    return amt;
  }

  function endMenuDrag(amt) {
    var d = document.getElementById("drawer");
    var h = document.getElementById("edgeHandle");
    var s = document.querySelector(".scrim");
    if (d) { d.style.transition = ""; d.style.transform = ""; }
    if (h) { h.style.transition = ""; h.style.left = ""; }
    if (s) { s.style.transition = ""; s.style.opacity = ""; s.style.pointerEvents = ""; }
    menuOpen = amt >= 0.35;
    if (menuOpen) markHint();
    renderChromeOnly();
  }

  function bindHandle() {
    var h = document.getElementById("edgeHandle");
    var d = document.getElementById("drawer");
    if (!h || h.getAttribute("data-bound") === "1") return;
    h.setAttribute("data-bound", "1");
    var x0 = 0, y0 = 0, start = 0, amt = 0, tracking = false, moved = false;
    function down(e) {
      var t = e.changedTouches[0];
      x0 = t.clientX; y0 = t.clientY;
      start = menuOpen ? 1 : 0;
      amt = start; tracking = true; moved = false;
    }
    function move(e) {
      if (!tracking) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (!moved && Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx) + 10 && !moved) { tracking = false; return; }
      moved = true;
      amt = dragMenu(start + dx / menuW());
    }
    function up() {
      if (!tracking) return;
      tracking = false;
      if (moved) {
        skipMenuClick = true;
        endMenuDrag(amt);
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

  function titleFor(path) {
    if (path === "/settings") return "Inställningar";
    if (path === "/about") return "Om";
    if (path === "/login") return "Konto";
    var id = path.replace(/^\//, "");
    var mod = TW_MODULES.filter(function (m) { return m.id === id; })[0];
    if (mod) return mod.name;
    return "Taxi Wizard";
  }

  function renderChromeOnly() {
    var drawer = document.getElementById("drawer");
    var scrim = document.querySelector(".scrim");
    var handle = document.getElementById("edgeHandle");
    var hint = document.getElementById("edgeHint");
    if (drawer) drawer.classList.toggle("on", menuOpen);
    if (scrim) scrim.classList.toggle("on", menuOpen);
    if (handle) {
      handle.classList.toggle("open", menuOpen);
      handle.textContent = menuOpen ? "\u2039" : "\u203a";
    }
    if (hint && (menuOpen || hintSeen())) hint.remove();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (loaded[src]) return resolve();
      var s = document.createElement("script");
      s.src = src;
      s.onload = function () {
        loaded[src] = true;
        resolve();
      };
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  function render() {
    applySize();
    var path = hash();
    var title = titleFor(path);
    var body = "";
    var id = path.replace(/^\//, "");
    var mod = TW_MODULES.filter(function (m) { return m.id === id; })[0];

    if (path === "/settings") body = settingsView();
    else if (path === "/about") body = aboutView();
    else if (path === "/login") body = loginView();
    else if (mod) {
      if (!isOn(mod.id)) {
        go("/");
        return;
      }
      body = slotView();
    } else body = homeView();

    var hideTop = !!(mod && mod.embedNav);
    app.classList.toggle("embed-nav", hideTop);
    app.innerHTML =
      (hideTop ? "" : topBar(title)) +
      drawerHtml() +
      handleHtml() +
      '<div class="stage" id="stage">' + body + "</div>";
    bindHandle();

    if (mod && isOn(mod.id)) {
      var slot = document.getElementById("slot");
      loadScript(mod.src)
        .then(function () {
          var fn = mounts[mod.id];
          if (fn) fn(slot, { go: go, settings: S });
          else slot.innerHTML = '<p class="empty">Modulen laddades men registrerade sig inte.</p>';
        })
        .catch(function () {
          slot.innerHTML = '<p class="empty">Kunde inte ladda modulen.</p>';
        });
    }
  }

  window.TW = {
    register: function (id, mount) {
      mounts[id] = mount;
    },
    openMenu: openMenu
  };

  applySize();
  bind();
  window.addEventListener("hashchange", render);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
  render();
})();

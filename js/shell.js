(function () {
  var KEY = "tw-settings";
  var loaded = {};
  var mounts = {};
  var app = document.getElementById("app");

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  var S = Object.assign({ size: "md", off: {} }, loadSettings());

  function save() {
    localStorage.setItem(KEY, JSON.stringify({ size: S.size, off: S.off }));
  }

  function applySize() {
    document.documentElement.setAttribute("data-size", S.size);
  }

  function hash() {
    return (location.hash || "#/").replace(/^#/, "") || "/";
  }

  function go(path) {
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

  function topBar(title, back) {
    return (
      '<header class="top">' +
      (back
        ? '<button class="icon-btn" data-go="/">←</button>'
        : '<span class="icon-btn" aria-hidden="true"></span>') +
      "<h1>" + title + "</h1>" +
      '<button class="icon-btn" data-go="/settings" title="Inställningar">⚙</button>' +
      "</header>"
    );
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
      topBar("Taxi Wizard", false) +
      '<main class="view">' +
      '<div class="grid">' + tiles + "</div>" +
      '<p class="hint">En app. Moduler du vill ha. Reklamfritt.</p>' +
      '<p class="foot">0.1.0 · skal</p>' +
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
      topBar("Inställningar", true) +
      '<main class="view">' +
      '<div class="row"><div><h3>Textstorlek</h3><p>För telefon och surfplatta i bilen.</p></div></div>' +
      '<div class="sizes">' + sizeBtns + "</div>" +
      '<div class="row" style="margin-top:18px"><div><h3>Moduler</h3><p>Visa eller dölj rutor på startsidan.</p></div></div>' +
      mods +
      '<div class="row"><div><h3>Konto</h3><p>Inlogg kommer. Data ligger lokalt tills vidare.</p></div>' +
      '<button class="ghost" disabled>Senare</button></div>' +
      "</main>"
    );
  }

  function slotView(mod) {
    return (
      topBar(mod.name, true) +
      '<main class="view" id="slot"><p class="empty">Laddar…</p></main>'
    );
  }

  function bind() {
    app.onclick = function (e) {
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
      }
    };
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
    if (path === "/settings") {
      app.innerHTML = settingsView();
      return;
    }
    var id = path.replace(/^\//, "");
    var mod = TW_MODULES.filter(function (m) { return m.id === id; })[0];
    if (!mod) {
      app.innerHTML = homeView();
      return;
    }
    if (!isOn(mod.id)) {
      go("/");
      return;
    }
    app.innerHTML = slotView(mod);
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

  window.TW = {
    register: function (id, mount) {
      mounts[id] = mount;
    }
  };

  applySize();
  bind();
  window.addEventListener("hashchange", render);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
  render();
})();

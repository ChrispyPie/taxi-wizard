TW.register("flow", function (el) {
  el.innerHTML = '<p class="empty">Hämtar cachen från taxikit.shop…</p>';

  function loadFeed() {
    return new Promise(function (resolve, reject) {
      if (window.TW_loadGot) return resolve();
      var s = document.createElement("script");
      s.src = "modules/flow/feed.js";
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  loadFeed()
    .then(function () {
      return TW_loadGot();
    })
    .then(function (data) {
      var ank = (data.arrivals || []).length;
      var avg = (data.departures || []).length;
      el.innerHTML =
        '<p class="empty">' +
        "Läser <b>samma</b> cache som live-appen.<br>" +
        "Inget eget anrop till Swedavia.<br><br>" +
        "Uppdaterad: " + (data.updated || "—") + "<br>" +
        "Ankomster i filen: " + ank + "<br>" +
        "Avgångar i filen: " + avg +
        "</p>";
    })
    .catch(function () {
      el.innerHTML =
        '<p class="empty">Kunde inte läsa got.json från taxikit.shop.<br>Inget Swedavia-anrop gjordes.</p>';
    });
});

/* Läser live-cachen. Inget eget Swedavia-/Trafikverket-anrop här. */
window.TW_FEED = {
  got: "https://taxikit.shop/skiftlogg/feed/got.json",
  tag: "https://taxikit.shop/skiftlogg/feed/tag.json"
};

window.TW_loadGot = function () {
  return fetch(TW_FEED.got, { cache: "no-store" }).then(function (r) {
    if (!r.ok) throw new Error("got.json " + r.status);
    return r.json();
  });
};

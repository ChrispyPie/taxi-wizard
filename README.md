# Taxi Wizard

Skal för taximoduler. Inte skiftloggen som redan ligger live.

Live orörd: https://taxikit.shop/skiftlogg

## Idé

En app i stället för tio. Skalet håller globala grejer (textstorlek, konto, vilka rutor som syns). Varje del är en egen modul med egna filer.

## Start

Öppna `index.html` lokalt eller via GitHub Pages.

## Struktur

```
index.html
css/shell.css
js/shell.js
js/registry.js          vilka moduler som finns
modules/flow/flow.js
modules/logg/logg.js
```

Skalet laddar en modul först när du öppnar den.

## Pages

Settings → Pages → Deploy from branch `main` / root.
Sedan: `https://chrispypie.github.io/taxi-wizard/`

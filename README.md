# ThumbnailStudio

**Design YouTube & Instagram thumbnails as code.** A props-driven thumbnail
designer built on [Remotion](https://www.remotion.dev): every thumbnail is a
React component you edit live in a visual panel — no design app, no manual
pixel-pushing — and export to PNG / JPEG / WebP at exact platform sizes.

## About

ThumbnailStudio turns thumbnail design into a repeatable, prop-driven workflow.
Instead of dragging boxes in an image editor, you compose typed layers — text,
images, shapes, lines, icons, QR codes — and tune every attribute (color,
position, scale, rotation, opacity, effects) from Remotion Studio's
auto-generated panel, with a live preview. One design definition renders to the
three native sizes for **YouTube** (16:9), **Reels/Stories** (9:16), and
**Instagram feed** (1:1), and exports deterministically from the CLI — so the
same props always produce the same pixels.

<!-- Placeholder — replace assets/screenshot-studio.png with a real Remotion Studio screenshot (16:9 recommended). -->
![Remotion Studio — editing a thumbnail live](assets/screenshot-studio.png)

## Highlights

- 🎨 **Edit visually, ship consistently** — tune every layer (color, position,
  scale, rotation, opacity, effects) in Remotion Studio's auto-generated props
  panel. Live preview, no custom UI to learn.
- 📐 **Three native formats** — 16:9 (YouTube), 9:16 (Reels/Stories), 1:1 (feed),
  all driven by one component and schema.
- 🧱 **Rich layer types** — text, images, shapes, lines, icons, and QR codes,
  freely stacked by z-index.
- ✨ **Built-in effects** — gradients, shadows, glow, blur, duotone, sticker
  outlines, frosted glass, film grain, curved text, and inline text highlights.
- 🔤 **14 bundled fonts** and **~300k [Iconify](https://iconify.design) icons**
  (common sets render fully offline), plus emoji.
- 🖼️ **Reproducible exports** — render from the CLI, script batch outputs, or
  feed a saved props JSON. What you preview is exactly what renders.

## Screenshots

<!-- Placeholders — replace the images under assets/ with real screenshots. -->

| Editing props in the Studio panel | Live preview |
| --- | --- |
| ![Editing props panel](assets/screenshot-editing.png) | ![Live preview](assets/screenshot-preview.png) |

## Quick start

Requires **[Node.js](https://nodejs.org) 20+** (this repo pins **22** via
`.nvmrc`) and **[Git](https://git-scm.com)**.

```bash
# Clone over SSH …
git clone git@github.com:SonapSav/ThumbnailStudio.git
# … or over HTTPS
git clone https://github.com/SonapSav/ThumbnailStudio.git

cd ThumbnailStudio
npm install
npm run studio
```

Studio opens at **http://localhost:3013**. Pick a composition in the left
sidebar, then edit its props in the right panel — color pickers, sliders, text
areas, and add/remove buttons for each layer. Changes preview instantly.

> **On Linux?** Rendering needs a few headless-Chrome system libraries — see
> [Platform setup](#platform-setup). macOS and Windows work with just the steps
> above.

## Platform setup

Runs on **Windows, macOS, and Linux**.

### Windows / macOS

Nothing extra — Node + `npm install` is all you need.

### Linux

Remotion renders through headless Chrome, which needs shared libraries not
present on a bare install. Debian / Ubuntu:

```bash
sudo apt update
sudo apt install -y libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 \
  libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 \
  libpango-1.0-0 libcairo2 libcups2 libatk-bridge2.0-0
```

> Newer Ubuntu (22.04 / 24.04) uses `libasound2t64` in place of `libasound2`.
> Full list: [Remotion Linux dependencies](https://www.remotion.dev/docs/miscellaneous/linux-dependencies).

## Formats

| Composition            | Aspect | Size        | Use                     |
| ---------------------- | ------ | ----------- | ----------------------- |
| `Thumbnail-Landscape`  | 16:9   | 1280 × 720  | YouTube thumbnail       |
| `Thumbnail-Portrait`   | 9:16   | 1080 × 1920 | Reels / Stories cover   |
| `Thumbnail-Square`     | 1:1    | 1080 × 1080 | Instagram feed post     |

All three share one component (`src/Thumbnail.tsx`) and one schema
(`src/schema/thumbnail.ts`); they differ only in dimensions and starting props.
Two ready-made template compositions (`Thumbnail-Landscape-Top10`,
`Thumbnail-Landscape-ModernBlue`) show fuller designs to start from.

## The layer model

A thumbnail is a **canvas background** plus a set of typed **layer arrays**. Add
as many of each as you like; every layer shares the same transform controls.

The background (`backgroundType`) is a full-frame fill: **solid** color,
**linear** or **radial** gradient, or an **image** (`backgroundImageSrc` +
fit + focal point) — the same fill engine shapes use.

Whole-frame effects (root props): an **overlay** (`overlayType`:
vignette / top / bottom / full scrim, placed at `overlayZIndex` in the stack for
legibility) and **film grain** (`noiseEnabled` + `noiseOpacity`).

**Alignment grid** (`gridEnabled`) — a design helper drawn *above every layer*:
ruled lines every `gridSpacing` px (default 100) measured out from the canvas
centre in all four directions, with the centre axes emphasised and a centre dot.
`gridColor` / `gridOpacity` tune its look. It's just a positioning guide —
turn it **off before exporting**.

- **texts** — content, font, size/weight, color, outline, a whole-phrase
  background box, and **inline highlights**: wrap part of the text in
  `==double equals==` to give just that word/phrase its own box
  (`highlightColor` / `highlightTextColor` / padding / radius), independent of
  the whole-phrase box. A span can carry its own color: `==#22d3ee SALE==`.
  Set **`curveRadius`** to bend text along an arc (+ = dome / badge-top, − =
  valley); curved mode is plain text (no box/highlights).
- **images** — from `public/` (by filename), a URL, or a data URI; fit +
  radius, shadow, glow, **`blur`**, and **duotone** (`duotoneShadow` /
  `duotoneHighlight` — a stylized 2-tone photo grade).
  Images & icons also support a **sticker outline** (`outlineColor` /
  `outlineWidth` — a solid border hugging the alpha).
- **lines** — a straight line, two `mode`s: **vector** (from the `transform`
  origin, `length` px at `angle`) or **points** (from `(x1,y1)` to `(x2,y2)`,
  measured from the origin). `color`, `thickness`, `style`
  (solid / dashed / dotted), and independent endpoint markers `startCap` /
  `endCap` (none / arrow / circle — mix freely), plus shadow / glow / blur.
- **icons** — any [Iconify](https://iconify.design) icon via `iconName`
  (`"set:name"`, e.g. `mdi:fire`, `simple-icons:youtube`), with color, size,
  shadow & glow. `fillType` can be **solid** (color), **linear/radial**
  (gradient), or **image** — the last two use the icon as a **mask** so a
  gradient or **photo shows through the icon shape** (a heart/play-button full
  of a photo). Sets `lucide` / `mdi` / `simple-icons` are bundled (render
  offline); ~300k more work with internet at export. Browse + copy names with
  **`icon-picker.html`** (open it in a browser). **Emoji** work through this
  layer too — `twemoji` is bundled, so `twemoji:fire` renders 🔥 in full color.
- **qrcodes** — a scannable QR (`data` = URL/text) on a rounded card, with
  color / bg / size / margin, plus shadow, glow, blur.
- **shapes** — rectangle / ellipse / triangle, with a **solid, linear, radial,
  or image fill** (`fillType`), stroke, shadow, glow, and **`backdropBlur`**
  (frosted-glass: blurs what's behind — pair with a translucent fill). A
  gradient panel is
  just a shape with `fillType: "linear"`; `"radial"` gives a circular gradient
  (great for orbs/spotlights); `"image"` fills the shape with a photo
  (`fillImageSrc` + `fillImageFit`) clipped to its outline — an ellipse becomes
  a circular photo crop, with a **focal point** (`fillImageFocusX/Y`, 0–100%) to
  keep e.g. a face framed when cropped. All fills work on every shape kind.

Every layer has a `transform`:

| Prop       | Meaning                                          |
| ---------- | ------------------------------------------------ |
| `x` / `y`  | Pixel offset **from canvas center** (0,0 = mid)  |
| `scale`    | Size multiplier (1 = natural)                    |
| `rotation` | Degrees, clockwise                               |
| `opacity`  | 0 → 1                                             |
| `zIndex`   | Global stacking order across all layers (higher = front) |

Layers from every array are composited into a single stack ordered by
`zIndex`, so a shape can sit behind or in front of any text or image.

> Layers are kept in **per-type arrays** rather than one mixed list because
> Remotion's visual schema editor doesn't render controls for discriminated
> unions. `zIndex` is what unifies them at render time.

## Exporting

Render a single still (output lands in `out/`):

```bash
npm run render:yt       # Thumbnail-Landscape  -> out/youtube.png
npm run render:reel     # Thumbnail-Portrait   -> out/reel.png
npm run render:square   # Thumbnail-Square     -> out/square.png
npm run render:all      # all three
```

Render with custom props (e.g. saved from Studio) or a different format:

```bash
npx remotion still Thumbnail-Landscape out/custom.png --props=my-props.json
npx remotion still Thumbnail-Square out/custom.jpg --image-format=jpeg
```

## Images

Put files in `public/` and reference them by filename in an image layer's
`src` (e.g. `logo.png`). Full URLs and `data:` URIs also work.

## Fonts

Google Fonts are loaded in `src/fonts.ts`:

- **Sans / display:** Inter, Roboto, Montserrat, Poppins, Oswald, Fredoka, Teko
- **Heavy display:** Anton, Bebas Neue, Archivo Black, Bangers
- **Serif:** Playfair Display
- **Handwriting:** Permanent Marker, Caveat

Add a font by importing its `loadFont` in `src/fonts.ts` and adding it to the
`FONTS` map — it then appears automatically in the `fontFamily` dropdown.

## Project layout

```
src/
  index.ts            registerRoot
  Root.tsx            the five <Composition> registrations + inline defaultProps
  Thumbnail.tsx       composites all layers by zIndex; background, overlay, grid
  formats.ts          dimensions per aspect ratio
  fonts.ts            Google font loading + fontFamily enum source
  icons.ts            bundled Iconify sets (lucide / mdi / simple-icons / twemoji)
  schema/             zod schemas (transform, layers, thumbnail props)
  layers/             LayerFrame + Text / Image / Shape / Icon / Qr / Line / CurvedText
                      components and fill / shadow / duotone / outline helpers
public/               image assets
assets/               README screenshots
icon-picker.html      standalone Iconify browser (search + copy icon names)
.githooks/            prepare-commit-msg hook (co-author trailer)
```

## Contributing

Commit authorship is standardized by a tracked git hook. `core.hooksPath` is
local config, so activate it once after cloning:

```bash
git config core.hooksPath .githooks
```

It appends the project's co-author trailer to every commit automatically.

## License

ThumbnailStudio's own source code is licensed **MIT © 2026 Panos Vasilopoulos** —
see [`LICENSE`](LICENSE).

> **Remotion is not MIT.** This project is built on
> [Remotion](https://www.remotion.dev), which is distributed under the
> [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md):
> free for individuals and small teams, but a **paid company license** is
> required above a team-size / revenue threshold. The MIT license here covers
> only this repository's code — it grants no rights to Remotion. Make sure your
> use of Remotion qualifies before relying on it, especially commercially.

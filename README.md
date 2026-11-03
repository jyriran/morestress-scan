# More Stress Scan

Browser version of the More Stress Snapchat Lens. Point a phone at a More Stress
print: the page recognises it, fills the stress meter over the print and shows a
random verdict. Tap to reroll, record a clip, share it. No app needed.

Live: https://jyriran.github.io/morestress-scan/ (later `https://scan.morestress.com`)

## How it works

- `index.html` — the whole page. Intro with a no-camera preview, then the camera
  scan (MindAR image tracking + three.js, loaded from jsDelivr).
- `designs/designs.js` — every scannable design: its flattened print, where the
  meter is drawn on it (`overlay.box`), its shop link and its verdict pack.
- `designs/<id>/target.jpg` — the print, flattened and cropped to the panel.
- `designs/targets.mind` — compiled tracking data for all prints. **Built
  automatically** by GitHub Actions on every push; never edit by hand.

## Add a new design

1. Flatten the print (a straight-on photo or the print file) and save it as
   `designs/<new-id>/target.jpg` (about 1000px wide), plus a 300px `thumb.jpg`.
2. Add an entry to `MS_DESIGNS` in `designs/designs.js`. Set `width`/`height`
   to the image size and `overlay.box` to the area the meter should cover.
3. Push to `main`. The **Build scan targets and publish** workflow compiles
   `targets.mind` and redeploys; **Scan test** then checks recognition with the
   video in `tests/`.

Good targets have lots of sharp, high-contrast detail (text, corners, bars) and
are not symmetrical. Plain areas, gradients and repeating patterns track badly.

## Custom domain (Dynadot)

1. In Dynadot: Domain → DNS settings → add a record: type **CNAME**, host
   **scan**, value **jyriran.github.io**.
2. In GitHub: Settings → Pages → Custom domain → `scan.morestress.com`, Save,
   then tick **Enforce HTTPS** once it appears.
3. Add a file `CNAME` containing `scan.morestress.com` to the repo.

The camera only works over HTTPS, which GitHub Pages provides.

Not a stress assessment. Results are random student humour.

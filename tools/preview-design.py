#!/usr/bin/env python3
"""Screenshot the no-camera preview for one design, to check overlay.box.

Usage (from the repo root, with the site served on :8765):
  python3 -m http.server 8765 &
  python3 tools/preview-design.py DESIGN_INDEX OUT.png

Uses Playwright with a local Chrome. Waits for the verdict to finish typing.
"""
import asyncio, sys
from playwright.async_api import async_playwright


async def main(idx, out):
    async with async_playwright() as p:
        kw = {}
        import shutil
        chrome = shutil.which("google-chrome") or shutil.which("chromium")
        if chrome:
            kw["executable_path"] = chrome
        b = await p.chromium.launch(args=["--no-sandbox"], **kw)
        pg = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        # show the requested design first in the preview
        await pg.add_init_script(f"""
          Object.defineProperty(window, 'MS_DESIGNS', {{
            configurable: true,
            set(v) {{ const d = v.slice(); const [x] = d.splice({idx}, 1); d.unshift(x);
                     Object.defineProperty(window, 'MS_DESIGNS', {{ value: d, writable: true }}); }},
          }});
        """)
        await pg.goto("http://localhost:8765/index.html")
        await pg.wait_for_timeout(3200)
        el = await pg.query_selector(".demo-frame")
        await el.screenshot(path=out)
        await b.close()


asyncio.run(main(int(sys.argv[1]), sys.argv[2]))

#!/usr/bin/env python3
"""Build the claude.ai preview copy of the scan page.

claude.ai artifacts can't use the camera, so the preview keeps the no-camera
demo and turns "Start camera scan" into a link to the live site.

Usage: python3 tools/build-preview.py OUT_DIR [LIVE_URL]
Writes OUT_DIR/index.html and copies each design's target.jpg/thumb.jpg.
Publish OUT_DIR/index.html as the artifact with those images as files.
"""
import os, re, shutil, sys

out_dir = sys.argv[1]
live = sys.argv[2] if len(sys.argv) > 2 else "https://jyriran.github.io/morestress-scan/"
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

s = open(os.path.join(root, "index.html")).read()
head = re.search(r"<head>(.*?)</head>", s, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", s, re.S).group(1)
keep = [m.group(1) for m in re.finditer(
    r'(<title>.*?</title>|<meta name="claude:viewport-fit-sides"[^>]*>|<link[^>]*>|<style>.*?</style>)', head, re.S)]

designs_js = open(os.path.join(root, "designs/designs.js")).read()
body = body.replace('<script src="designs/designs.js"></script>', "<script>\n" + designs_js + "\n</script>")
start = re.search(r'<button class="btn btn-acid" id="startBtn"[^>]*>.*?</button>', body, re.S)
if not start:
    sys.exit("start button not found in index.html")
body = body.replace(start.group(0),
    f'<a class="btn btn-acid" href="{live}" target="_blank" rel="noopener">Open the camera scan <span>↗</span></a>')
body = body.replace('$("startBtn").addEventListener("click", start);', "")

os.makedirs(out_dir, exist_ok=True)
open(os.path.join(out_dir, "index.html"), "w").write("\n".join(keep) + "\n" + body)

files = []
for d in sorted(os.listdir(os.path.join(root, "designs"))):
    src = os.path.join(root, "designs", d)
    if not os.path.isdir(src):
        continue
    os.makedirs(os.path.join(out_dir, "designs", d), exist_ok=True)
    for f in ("target.jpg", "thumb.jpg"):
        if os.path.exists(os.path.join(src, f)):
            shutil.copy(os.path.join(src, f), os.path.join(out_dir, "designs", d, f))
            files.append(f"designs/{d}/{f}")
print("wrote", os.path.join(out_dir, "index.html"))
print("files:", " ".join(files))

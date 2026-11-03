#!/usr/bin/env python3
"""Flatten a photo of a More Stress print into a scan target.

Usage:
  python3 tools/flatten-print.py PHOTO OUT_DIR [--corners x1,y1,x2,y2,x3,y3,x4,y4] [--width 1000]

Without --corners it finds the print's corner brackets by their acid-green
colour (works for prints with lime corner marks like Academic System Status).
With --corners, give the four corners in pixel coordinates of PHOTO in the
order top-left, top-right, bottom-right, bottom-left.

If the input is already a flat print file (PNG/JPG straight from the design
tool), pass --flat to skip the perspective step and just resize.

Writes OUT_DIR/target.jpg (width px wide) and OUT_DIR/thumb.jpg (300 px) and
prints the width/height to put in designs/designs.js.
"""
import argparse, os, sys
import cv2
import numpy as np


def find_lime_corners(img):
    b, g, r = [img[:, :, i].astype(int) for i in range(3)]
    mask = (g > 150) & (r > 120) & (b < 110) & (g - b > 80)
    ys, xs = np.nonzero(mask)
    if len(xs) < 50:
        sys.exit("Could not find acid-green corner marks. Pass --corners instead.")
    s, d = xs + ys, xs - ys
    return np.float32([
        (xs[s.argmin()], ys[s.argmin()]),  # top-left
        (xs[d.argmax()], ys[d.argmax()]),  # top-right
        (xs[s.argmax()], ys[s.argmax()]),  # bottom-right
        (xs[d.argmin()], ys[d.argmin()]),  # bottom-left
    ])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("photo")
    ap.add_argument("out_dir")
    ap.add_argument("--corners")
    ap.add_argument("--width", type=int, default=1000)
    ap.add_argument("--flat", action="store_true")
    a = ap.parse_args()

    img = cv2.imread(a.photo)
    if img is None:
        sys.exit(f"Cannot read {a.photo}")
    W = a.width
    if a.flat:
        h, w = img.shape[:2]
        H = round(W * h / w)
        out = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    else:
        if a.corners:
            v = [float(x) for x in a.corners.split(",")]
            src = np.float32(list(zip(v[0::2], v[1::2])))
        else:
            src = find_lime_corners(img)
        wpx = (np.linalg.norm(src[1] - src[0]) + np.linalg.norm(src[2] - src[3])) / 2
        hpx = (np.linalg.norm(src[3] - src[0]) + np.linalg.norm(src[2] - src[1])) / 2
        H = round(W * hpx / wpx)
        M = cv2.getPerspectiveTransform(src, np.float32([[0, 0], [W, 0], [W, H], [0, H]]))
        out = cv2.warpPerspective(img, M, (W, H))
        print("corners used:", [tuple(int(c) for c in p) for p in src])

    os.makedirs(a.out_dir, exist_ok=True)
    cv2.imwrite(os.path.join(a.out_dir, "target.jpg"), out, [cv2.IMWRITE_JPEG_QUALITY, 95])
    th = cv2.resize(out, (300, round(300 * H / W)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(a.out_dir, "thumb.jpg"), th, [cv2.IMWRITE_JPEG_QUALITY, 85])
    print(f"width: {W}, height: {H}")


if __name__ == "__main__":
    main()

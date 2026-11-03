// End-to-end scan test: serves the site locally, feeds tests/shirt-scan.mp4 to
// Chrome as the camera, and checks the page locks onto the print.
import http from "http";
import { readFile, mkdir, writeFile, stat } from "fs/promises";
import path from "path";
import { chromium } from "playwright";

const root = path.resolve(".");
const outDir = path.join(root, "test-output");
await mkdir(outDir, { recursive: true });

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json", ".mind": "application/octet-stream" };
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(root, p);
    if (!file.startsWith(root)) throw new Error("bad path");
    await stat(file);
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end("not found"); }
});
await new Promise((r) => server.listen(8123, r));

const browser = await chromium.launch({
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-video-capture=${process.env.CAM}`,
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
  ],
});
const context = await browser.newContext({ viewport: { width: 390, height: 780 }, permissions: ["camera"] });
const page = await context.newPage();
const log = [];
page.on("console", (m) => log.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => log.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => log.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`));

const result = { locked: false, lockedAfterMs: null, verdictShown: false, statusTimeline: [] };
try {
  await page.goto("http://localhost:8123/index.html", { waitUntil: "load" });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "00-intro.png") });
  await page.click("#startBtn");
  const t0 = Date.now();
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const status = await page.textContent("#scanStatus").catch(() => "?");
    const verdict = await page.textContent("#scanVerdict").catch(() => "?");
    const loadingVisible = await page.isVisible("#loading").catch(() => false);
    const errorVisible = await page.isVisible("#error").catch(() => false);
    const loadText = await page.textContent("#loadText").catch(() => "");
    result.statusTimeline.push({ s: Math.round((Date.now() - t0) / 1000), status, verdict, loadingVisible, loadText, errorVisible });
    await page.screenshot({ path: path.join(outDir, `${String(i + 1).padStart(2, "0")}-scan.png`) });
    if (errorVisible) { result.error = await page.textContent("#error"); break; }
    if (!result.locked && /LOCKED/.test(status)) { result.locked = true; result.lockedAfterMs = Date.now() - t0; }
    if (result.locked && verdict && !/CALIBRATING|SEARCHING|LOST/.test(verdict)) { result.verdictShown = true; await page.waitForTimeout(1500); await page.screenshot({ path: path.join(outDir, "zz-verdict.png") }); break; }
  }
} catch (e) {
  result.exception = String(e && e.stack || e);
}
await writeFile(path.join(outDir, "result.json"), JSON.stringify(result, null, 2));
await writeFile(path.join(outDir, "console.log"), log.join("\n"));
console.log(JSON.stringify(result, null, 2));
console.log(log.slice(-40).join("\n"));
await browser.close();
server.close();
if (!result.locked) process.exit(1);

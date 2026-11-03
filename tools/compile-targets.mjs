// Compiles every design's target.jpg (in the order of designs/designs.js)
// into designs/targets.mind, the file the scanner uses to recognise prints.
//
// Run by the GitHub workflow. Needs a checkout of mind-ar-js v1.2.5 with its
// npm dependencies installed, passed as MINDAR_DIR.
import { readFile, writeFile } from "fs/promises";
import path from "path";
import vm from "vm";

const root = path.resolve(process.argv[2] || ".");
const mindarDir = path.resolve(process.env.MINDAR_DIR || "mind-ar-js");

// Load designs.js without a browser: it only assigns window.MS_DESIGNS.
const sandbox = { window: {} };
vm.runInNewContext(await readFile(path.join(root, "designs/designs.js"), "utf8"), sandbox);
const designs = sandbox.window.MS_DESIGNS || [];
if (!designs.length) throw new Error("No designs found in designs/designs.js");

const { OfflineCompiler } = await import(path.join(mindarDir, "src/image-target/offline-compiler.js"));
const { loadImage } = await import(path.join(mindarDir, "node_modules/canvas/index.js"));

const images = [];
for (const d of designs) {
  const file = path.join(root, d.target);
  console.log(`target ${images.length}: ${d.id} <- ${d.target}`);
  images.push(await loadImage(file));
}

const compiler = new OfflineCompiler();
let last = -10;
await compiler.compileImageTargets(images, (p) => {
  if (p - last >= 10) { console.log(`compiling ${Math.round(p)}%`); last = p; }
});
const buffer = compiler.exportData();
const out = path.join(root, "designs/targets.mind");
await writeFile(out, buffer);

// Record which designs (and which image versions) the file was built from,
// so the page can tell when targets.mind is stale.
const manifest = designs.map((d) => d.id);
await writeFile(path.join(root, "designs/targets.json"), JSON.stringify({ built: new Date().toISOString(), designs: manifest }, null, 2));
console.log(`wrote ${out} (${buffer.length} bytes) for ${manifest.join(", ")}`);

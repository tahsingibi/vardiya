import { readdir, stat, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
let count = 0, total = 0;
const chunks = [];
const hash = createHash("sha256");
async function walk(dir) {
 for (const name of (await readdir(dir)).sort()) {
  const file = path.join(dir, name);
  if (["_worker.js", "_routes.json", "functions", "wrangler.toml", "wrangler.json", "wrangler.jsonc"].includes(name)) throw new Error("Runtime artifact prohibited: " + file);
  const info = await stat(file);
  if (info.isDirectory()) await walk(file);
  else {
   count++; total += info.size;
   if (file.includes("_next/static/") && /\.(js|css)$/.test(file)) chunks.push("/" + path.relative("out", file).split(path.sep).join("/"));
   if (info.size > 25 * 1024 * 1024) throw new Error("Oversized asset: " + file);
   if (name !== "sw.js") hash.update(await readFile(file));
  }
 }
}
await walk("out");
if (count > 20000 || total > 1024 ** 3) throw new Error("Static artifact exceeds reviewed limits");
const version = hash.digest("hex").slice(0, 12);
const sw = (await readFile("public/sw.js", "utf8")).replace(/const STATIC_ASSETS = (\[[\s\S]*?\]);/, (_, list) => `const STATIC_ASSETS = ${JSON.stringify([...new Set([...JSON.parse(list), ...chunks])])};`);
await writeFile("out/sw.js", sw.replace(/const CACHE_NAME = .*;/, `const CACHE_NAME = "vardiya-${version}";`));
await writeFile("out/_headers", "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/api/og\n  Content-Type: image/png\n/sw.js\n  Cache-Control: no-cache\n/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n");
console.log(JSON.stringify({files:count,totalMiB: +(total/1024**2).toFixed(2),runtime:"static only"}));

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
const types = { ".html":"text/html; charset=utf-8", ".js":"application/javascript", ".css":"text/css", ".png":"image/png", ".ico":"image/x-icon", ".woff2":"font/woff2", ".webmanifest":"application/manifest+json", ".txt":"text/plain" };
createServer(async (req,res) => {
 try {
  let file = path.resolve(root, "." + decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if (!file.startsWith(root + path.sep) && file !== root) throw new Error("Path outside root");
  try { if ((await stat(file)).isDirectory()) file = path.join(file,"index.html"); } catch {}
  const body = await readFile(file);
  res.writeHead(200,{"Content-Type":file.endsWith("/api/og") ? "image/png" : types[path.extname(file)] || "application/octet-stream"}); res.end(body);
 } catch { res.writeHead(404);res.end("Not found"); }
}).listen(Number(process.env.PORT || 3100), process.env.HOST || "127.0.0.1",()=>console.log("Static preview ready"));

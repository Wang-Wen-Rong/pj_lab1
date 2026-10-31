import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const assets = new Map([
  ["/architecture.svg", "doc/architecture.svg"],
  ["/flowchart.svg", "examples/flowchart.svg"],
]);
createServer((request, response) => {
  const asset = assets.get(request.url);
  if (asset) {
    response.writeHead(200, { "Content-Type": "image/svg+xml; charset=utf-8" });
    response.end(readFileSync(asset));
  } else if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end('<!doctype html><meta charset="utf-8"><title>SVG Lab1 verification</title><style>body{font:16px system-ui;margin:24px;color:#182230}h1{font-size:24px}img{border:1px solid #ddd;max-width:100%}</style><h1>Lab1 — Browser rendering verification</h1><h2>Generated flowchart</h2><img src="/flowchart.svg" width="800" height="600"><h2>PlantUML architecture</h2><img src="/architecture.svg">');
  } else { response.writeHead(404); response.end("Not found"); }
}).listen(4173, "127.0.0.1", () => console.log("Preview: http://127.0.0.1:4173"));

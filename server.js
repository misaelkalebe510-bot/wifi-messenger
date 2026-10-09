const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 10000);
const ROOT = __dirname;
let latestMessage = { text: "", updatedAt: null };

const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}
http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (req.method === "GET" && url.pathname === "/api/message")
    return send(res, 200, JSON.stringify(latestMessage), "application/json; charset=utf-8");
  if (req.method === "POST" && url.pathname === "/api/message") {
    let body = "";
    req.on("data", chunk => { body += chunk; if (body.length > 10000) req.destroy(); });
    req.on("end", () => {
      try {
        const text = String(JSON.parse(body || "{}").text || "").trim().slice(0, 500);
        if (!text) return send(res, 400, JSON.stringify({error:"Escreva uma mensagem."}), "application/json; charset=utf-8");
        latestMessage = { text, updatedAt: new Date().toISOString() };
        return send(res, 200, JSON.stringify({ok:true}), "application/json; charset=utf-8");
      } catch { return send(res, 400, JSON.stringify({error:"Pedido inválido."}), "application/json; charset=utf-8"); }
    });
    return;
  }
  const route = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = path.resolve(ROOT, "." + route);
  if (!file.startsWith(ROOT + path.sep)) return send(res, 403, "Proibido.");
  fs.readFile(file, (err, data) => err ? send(res, 404, "Página não encontrada.") : send(res, 200, data, mime[path.extname(file)] || "application/octet-stream"));
}).listen(PORT, "0.0.0.0", () => console.log("Wi-Fi Messenger rodando na porta " + PORT));

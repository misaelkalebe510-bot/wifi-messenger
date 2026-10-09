const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = Number(process.env.PORT || 10000);
const ROOT = __dirname;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
let latestMessage = { text: '', name: '', updatedAt: null, id: 0 };
let nextId = 1;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
function send(res, status, body, type='text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body);
}
function json(res, status, data) { send(res, status, JSON.stringify(data), 'application/json; charset=utf-8'); }
function readBody(req, cb) { let body=''; req.on('data', chunk => { body += chunk; if (body.length > 10000) { req.destroy(); } }); req.on('end', () => { try { cb(JSON.parse(body || '{}')); } catch { json(res, 400, {error:'Pedido inválido.'}); } }); }
http.createServer((req,res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'POST' && url.pathname === '/api/login') {
    let body=''; req.on('data', chunk => { body += chunk; if(body.length > 5000) req.destroy(); });
    req.on('end', () => { let data={}; try { data=JSON.parse(body||'{}'); } catch { return json(res,400,{error:'Pedido inválido.'}); }
      if (!ADMIN_PASSWORD) return json(res, 503, {error:'Defina ADMIN_PASSWORD nas variáveis de ambiente do Render antes de usar o painel.'});
      return json(res, data.password === ADMIN_PASSWORD ? 200 : 401, data.password === ADMIN_PASSWORD ? {ok:true} : {error:'Senha incorreta.'});
    }); return;
  }
  if (req.method === 'GET' && url.pathname === '/api/message') return json(res, 200, latestMessage);
  if (req.method === 'POST' && url.pathname === '/api/message') {
    if (!ADMIN_PASSWORD) return json(res, 503, {error:'O administrador ainda não configurou uma senha no Render.'});
    if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) return json(res, 401, {error:'Acesso negado. Entre no painel com a senha.'});
    let body=''; req.on('data', chunk => { body += chunk; if(body.length > 10000) req.destroy(); });
    req.on('end', () => { let data; try { data=JSON.parse(body||'{}'); } catch { return json(res,400,{error:'Pedido inválido.'}); }
      const text=String(data.text||'').trim().slice(0,500); const name=String(data.name||'Administrador').trim().slice(0,60);
      if (!text) return json(res,400,{error:'Escreva uma mensagem.'});
      latestMessage={text,name:name||'Administrador',updatedAt:new Date().toISOString(),id:nextId++}; return json(res,200,{ok:true});
    }); return;
  }
  const route = url.pathname === '/' ? '/index.html' : url.pathname;
  const file = path.resolve(ROOT, '.' + route);
  if (!file.startsWith(ROOT + path.sep)) return send(res,403,'Proibido.');
  fs.readFile(file,(err,data)=>err?send(res,404,'Página não encontrada.'):send(res,200,data,mime[path.extname(file)]||'application/octet-stream'));
}).listen(PORT,'0.0.0.0',()=>console.log('Wi-Fi Messenger rodando na porta '+PORT));

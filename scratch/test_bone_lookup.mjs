import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.glb': 'model/gltf-binary'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath.startsWith('/VHS/')) reqPath = reqPath.slice(5);
  if (reqPath === '' || reqPath === '/') reqPath = 'index.html';
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath)) {
    const pubPath = path.join(path.resolve('public'), reqPath);
    if (fs.existsSync(pubPath)) filePath = pubPath;
    else { res.writeHead(404); res.end('Not found'); return; }
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((r) => server.listen(5197, r));

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\temp\\edge_test_bone_' + Date.now();
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

const port = 9815;
const proc = spawn(browserPath, [
  '--headless=new',
  '--remote-debugging-port=' + port,
  '--user-data-dir=' + userDataDir,
  '--ignore-certificate-errors',
  '--window-size=1280,720',
  'about:blank'
]);

try {
  let targets = null;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      targets = await res.json();
      if (targets?.length) break;
    } catch (e) {}
  }

  const page = targets.find(p => p.type === 'page') || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5197/VHS/' });

  // Wait for model load
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 400));
    const check = await send('Runtime.evaluate', {
      expression: '!!(window.game && window.game.engine && window.game.engine.playerBean && window.game.engine.playerBean.isModelLoaded)',
      returnByValue: true
    });
    if (check.result?.value) break;
  }

  // Find all bones and attach a red marker box to Head_C_nub_07
  const attachResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const b = window.game.engine.playerBean;
      const bones = [];
      b.characterRoot.traverse(c => {
        if (c.isBone) bones.push(c.name);
      });

      const headNub = b.characterRoot.getObjectByName('Head_C_nub_07');
      const headJnt = b.characterRoot.getObjectByName('Head_C_jnt01_04');
      const chest = b.characterRoot.getObjectByName('Chest_C_jnt_02');

      // Create a visible test sphere on headNub
      // Using mesh constructor from existing mesh geometry
      const sphereGeo = new b.eyeMesh.geometry.constructor();
      return {
        hasNub: !!headNub,
        hasJnt: !!headJnt,
        hasChest: !!chest,
        bones
      };
    })()`,
    returnByValue: true
  });

  console.log('Bone lookup result:', JSON.stringify(attachResult.result?.value, null, 2));

  ws.close();
} finally {
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
}

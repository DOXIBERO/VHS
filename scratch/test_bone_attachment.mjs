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

await new Promise((r) => server.listen(5198, r));

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\temp\\edge_bones_' + Date.now();
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

const port = 9812;
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
  await send('Page.navigate', { url: 'http://localhost:5198/VHS/' });

  // Wait for model load
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 400));
    const check = await send('Runtime.evaluate', {
      expression: '!!(window.game && window.game.engine && window.game.engine.playerBean && window.game.engine.playerBean.isModelLoaded)',
      returnByValue: true
    });
    if (check.result?.value) break;
  }

  // Inspect bones in browser
  const boneInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const b = window.game.engine.playerBean;
      const head = b.characterRoot.getObjectByName('Head_C_nub_07');
      const headParent = b.characterRoot.getObjectByName('Head_C_jnt01_04');
      const chest = b.characterRoot.getObjectByName('Chest_C_jnt_02');

      const vHead = new THREE.Vector3();
      const vHeadP = new THREE.Vector3();
      const vChest = new THREE.Vector3();

      head.getWorldPosition(vHead);
      headParent.getWorldPosition(vHeadP);
      chest.getWorldPosition(vChest);

      return {
        headPos: { x: vHead.x, y: vHead.y, z: vHead.z },
        headPPos: { x: vHeadP.x, y: vHeadP.y, z: vHeadP.z },
        chestPos: { x: vChest.x, y: vChest.y, z: vChest.z },
        headLocal: { x: head.position.x, y: head.position.y, z: head.position.z },
        headPLocal: { x: headParent.position.x, y: headParent.position.y, z: headParent.position.z }
      };
    })()`,
    returnByValue: true
  });

  console.log('Bone info:', JSON.stringify(boneInfo.result?.value, null, 2));

  // Test breathing movement on the bone over 1 second:
  const breathingTest = await send('Runtime.evaluate', {
    expression: `new Promise(resolve => {
      const b = window.game.engine.playerBean;
      const head = b.characterRoot.getObjectByName('Head_C_nub_07');
      const positions = [];
      const start = performance.now();

      function sample() {
        const v = new THREE.Vector3();
        head.getWorldPosition(v);
        positions.push({ t: performance.now() - start, y: v.y, z: v.z });
        if (performance.now() - start < 1200) {
          requestAnimationFrame(sample);
        } else {
          const minY = Math.min(...positions.map(p => p.y));
          const maxY = Math.max(...positions.map(p => p.y));
          const deltaY = maxY - minY;
          resolve({ minY, maxY, deltaY, sampleCount: positions.length });
        }
      }
      sample();
    })`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Breathing test on bone:', JSON.stringify(breathingTest.result?.value, null, 2));

  ws.close();
} finally {
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
}

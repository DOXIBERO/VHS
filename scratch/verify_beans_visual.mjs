import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Minimal static file server for dist
const distDir = path.resolve('dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath.startsWith('/VHS/')) {
    reqPath = reqPath.slice(5);
  }
  if (reqPath === '' || reqPath === '/') reqPath = 'index.html';

  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath)) {
    // Check in public
    const pubPath = path.join(path.resolve('public'), reqPath);
    if (fs.existsSync(pubPath)) {
      filePath = pubPath;
    } else {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(5199, resolve));
console.log('[Server] Local test server listening on http://localhost:5199/VHS/');

// Launch headless Edge
const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\temp\\edge_beans_' + Date.now();
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

const port = 9811;
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
  await new Promise((resolve) => ws.onopen = resolve);

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

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      console.log('[Browser Console]:', text);
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5199/VHS/' });

  console.log('[Browser] Navigated to http://localhost:5199/VHS/ ... waiting for model load');

  // Poll until isModelLoaded === true
  let loaded = false;
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 400));
    const check = await send('Runtime.evaluate', {
      expression: '!!(window.game && window.game.engine && window.game.engine.playerBean && window.game.engine.playerBean.isModelLoaded)',
      returnByValue: true
    });
    if (check.result?.value) {
      loaded = true;
      break;
    }
  }

  console.log(`[Browser] Player bean model loaded: ${loaded}`);

  // Let scene settle and animate
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 1: Classic Skin
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const outDir = path.resolve('C:/Users/Bilal 26/.gemini/antigravity/brain/c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e/scratch');
  fs.writeFileSync(path.join(outDir, 'bean_classic.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved bean_classic.png');

  // Switch to KREUZBERG skin (shiny gold chain + black body + acid green shoes + flat cap)
  await send('Runtime.evaluate', {
    expression: "window.game.engine.playerBean.applySkin('KREUZBERG')"
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 2: Kreuzberg Skin with Gold Chain
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'bean_kreuzberg_goldchain.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved bean_kreuzberg_goldchain.png');

  // Spawn 20 beans on screen with BeanFactory
  const spawnRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const f = window.game.engine.beanFactory;
      const skins = ['CLASSIC', 'KREUZBERG', 'SPÄTI', 'U-BAHN', 'BERGHAIN'];
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const rad = 4.5;
        f.createBean({
          id: 'crowd_bean_' + i,
          position: { x: Math.cos(angle) * rad, y: 1.5, z: Math.sin(angle) * rad },
          skin: skins[i % skins.length]
        });
      }
      return { totalActive: f.activeCount, available: f.availableCount };
    })()`,
    returnByValue: true
  });
  console.log('[Browser] Spawned 20 beans result:', spawnRes.result?.value);

  // Let 20 beans simulate and settle
  await new Promise(r => setTimeout(r, 1500));

  // Measure FPS over 2 seconds
  const fpsEval = await send('Runtime.evaluate', {
    expression: `new Promise(resolve => {
      let frames = 0;
      const start = performance.now();
      function count() {
        frames++;
        if (performance.now() - start < 2000) {
          requestAnimationFrame(count);
        } else {
          resolve(Math.round((frames / (performance.now() - start)) * 1000));
        }
      }
      requestAnimationFrame(count);
    })`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log(`[Browser] FPS with 21 beans running: ${fpsEval.result?.value} FPS`);

  // Screenshot 3: 20 beans running together
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'beans_20_multiskin.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved beans_20_multiskin.png');

  ws.close();
} finally {
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
  console.log('Finished visual test.');
}

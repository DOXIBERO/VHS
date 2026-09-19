import { spawn } from 'child_process';
import fs from 'fs';

async function inspectFallGuy() {
  const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\temp\\edge_inspect_' + Date.now();
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const port = 9810 + Math.floor(Math.random() * 100);
  const proc = spawn(browserPath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--ignore-certificate-errors',
    '--allow-file-access-from-files',
    'about:blank'
  ]);

  try {
    let versionData;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 300));
      try {
        const versionRes = await fetch(`http://127.0.0.1:${port}/json/version`);
        versionData = await versionRes.json();
        break;
      } catch (e) {}
    }
    if (!versionData) throw new Error('Could not connect to Edge debugger');
    const ws = new WebSocket(versionData.webSocketDebuggerUrl);

    await new Promise(r => ws.onopen = r);

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    // Create a local test page that imports three and loads the model
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <script type="importmap">
          {
            "imports": {
              "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
              "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
            }
          }
        </script>
      </head>
      <body>
        <script type="module">
          import * as THREE from 'three';
          import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
          import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

          const loader = new GLTFLoader();
          const dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
          loader.setDRACOLoader(dracoLoader);

          window.loader = loader;
        </script>
      </body>
      </html>
    `;

    const filePath = 'C:\\Users\\Bilal 26\\Documents\\VHS\\scratch\\test_model_page.html';
    fs.writeFileSync(filePath, testHtml);

    await send('Page.navigate', { url: 'file:///' + filePath.replace(/\\\\/g, '/') });
    await new Promise(r => setTimeout(r, 3000));

    // Now load fall_guy.glb buffer and parse it
    const glbBuffer = fs.readFileSync('C:\\Users\\Bilal 26\\Documents\\VHS\\public\\models\\characters\\fall_guy.glb');
    const base64Glb = glbBuffer.toString('base64');

    const evalResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        const raw = atob("${base64Glb}");
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

        return new Promise((resolve, reject) => {
          window.loader.parse(bytes.buffer, '', (gltf) => {
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);
            
            const anims = gltf.animations.map(a => ({ name: a.name, duration: a.duration }));
            const meshes = [];
            gltf.scene.traverse(c => {
              if (c.isMesh) meshes.push({ name: c.name, geo: c.geometry.type });
            });

            resolve({
              size: { x: size.x, y: size.y, z: size.z },
              center: { x: center.x, y: center.y, z: center.z },
              animations: anims,
              meshes: meshes
            });
          }, reject);
        });
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Fall Guy Model Inspection Result:', JSON.stringify(evalResult.result?.value, null, 2));
    ws.close();
  } finally {
    proc.kill();
  }
}

inspectFallGuy().catch(console.error);

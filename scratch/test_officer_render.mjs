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

await new Promise((r) => server.listen(5194, r));

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\temp\\edge_officer_render_' + Date.now();
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

const port = 9818;
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

  const consoleLogs = [];
  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      consoleLogs.push(text);
      console.log('[Browser]:', text);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('[Exception]:', JSON.stringify(data.params.exceptionDetails));
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5194/VHS/' });

  // Wait for model load
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 400));
    const check = await send('Runtime.evaluate', {
      expression: '!!(window.game && window.game.engine && window.game.engine.playerBean && window.game.engine.playerBean.isModelLoaded)',
      returnByValue: true
    });
    if (check.result?.value) break;
  }

  // Evaluate creation using THREE from eyeMesh.geometry constructor
  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      try {
        const bean = window.game.engine.playerBean;
        const root = bean.characterRoot;

        // Obtain THREE classes safely from existing instances
        const Group = root.constructor;
        const Mesh = bean.bodyMesh.constructor;
        const MeshStandardMat = bean.bodyMesh.material.constructor;
        const CylinderGeo = bean.berlinCap?.children[0]?.geometry?.constructor;
        const BoxGeo = bean.berlinCap?.children[1]?.geometry?.constructor;
        const TorusGeo = bean.goldChain?.children[0]?.geometry?.constructor;
        const OctahedronGeo = bean.goldChain?.children[1]?.geometry?.constructor;

        // Hide Berlin cap and gold chain
        if (bean.accessoriesGroup) bean.accessoriesGroup.visible = false;

        // Look up Head Bone
        const headNub = root.getObjectByName('Head_C_nub_07');
        if (!headNub) return { error: 'No headNub' };

        // Colors & Materials
        const navyMat = new MeshStandardMat({ color: 0x0F1D38, roughness: 0.6, metalness: 0.05 });
        const goldMat = new MeshStandardMat({ color: 0xFFD700, roughness: 0.12, metalness: 0.95 });
        const blackGlossMat = new MeshStandardMat({ color: 0x0A0A0A, roughness: 0.1, metalness: 0.85 });
        const sunglassesLensMat = new MeshStandardMat({ color: 0x050505, roughness: 0.05, metalness: 0.95 });
        const whiteGloveMat = new MeshStandardMat({ color: 0xF8FAFC, roughness: 0.35 });

        // Set body, gloves, and boots
        if (bean.bodyMesh) {
          bean.bodyMesh.material = navyMat;
        }
        if (bean.handMesh) {
          bean.handMesh.material = whiteGloveMat;
        }
        if (bean.legMesh) {
          bean.legMesh.material = blackGlossMat;
        }

        // ==========================================
        // 1. POLICE OFFICER PEAKED CAP (كاسكيطة البوليسي)
        // Mounted on headNub (crown of head)
        // In headNub local space, +Y is UP, +Z is FORWARD
        // ==========================================
        const capGroup = new Group();
        capGroup.name = 'Officer_PoliceCap';

        // Cap Crown (Navy Blue flared octagonal cylinder)
        const crownGeo = new CylinderGeo(0.55, 0.44, 0.22, 24);
        const crown = new Mesh(crownGeo, navyMat);
        crown.position.set(0, 0.08, 0.02);
        crown.rotation.x = -0.12;
        crown.castShadow = true;
        capGroup.add(crown);

        // Gold Trim along top edge
        const trimGeo = new TorusGeo(0.55, 0.018, 12, 24);
        const trim = new Mesh(trimGeo, goldMat);
        trim.position.set(0, 0.18, 0.03);
        trim.rotation.x = Math.PI / 2 - 0.12;
        capGroup.add(trim);

        // Black Visor (Curved downward in front)
        const visorGeo = new CylinderGeo(0.52, 0.52, 0.03, 24, 1, false, 0, Math.PI);
        const visor = new Mesh(visorGeo, blackGlossMat);
        visor.position.set(0, -0.01, 0.12);
        visor.rotation.x = 0.45;
        visor.rotation.y = Math.PI / 2;
        visor.scale.set(1.05, 1, 0.55);
        visor.castShadow = true;
        capGroup.add(visor);

        // Gold Braid Cord over visor
        const cordGeo = new TorusGeo(0.48, 0.022, 10, 24, Math.PI);
        const cord = new Mesh(cordGeo, goldMat);
        cord.position.set(0, 0.01, 0.06);
        cord.rotation.x = Math.PI / 2 - 0.08;
        cord.rotation.z = Math.PI;
        capGroup.add(cord);

        // Golden Badge on Cap Front
        const badgeGeo = new CylinderGeo(0.09, 0.09, 0.02, 16);
        const badge = new Mesh(badgeGeo, goldMat);
        badge.position.set(0, 0.11, 0.50);
        badge.rotation.x = Math.PI / 2 - 0.12;
        capGroup.add(badge);

        // 5-Point Star on Badge
        const starGeo = new OctahedronGeo(0.06, 0);
        const star = new Mesh(starGeo, goldMat);
        star.position.set(0, 0.11, 0.52);
        star.rotation.z = Math.PI / 5;
        capGroup.add(star);

        headNub.add(capGroup);

        // ==========================================
        // 2. POLICE AVIATOR SUNGLASSES (نظارات البوليسي)
        // Sitting over the eyes, attached to headNub
        // ==========================================
        const shadesGroup = new Group();
        shadesGroup.name = 'Officer_Aviators';

        const lensGeo = new BoxGeo(0.24, 0.17, 0.03);
        const lensL = new Mesh(lensGeo, sunglassesLensMat);
        lensL.position.set(-0.16, -0.10, 0.54);
        lensL.rotation.y = -0.12;
        shadesGroup.add(lensL);

        const lensR = new Mesh(lensGeo, sunglassesLensMat);
        lensR.position.set(0.16, -0.10, 0.54);
        lensR.rotation.y = 0.12;
        shadesGroup.add(lensR);

        // Golden Brow Bar
        const barGeo = new CylinderGeo(0.015, 0.015, 0.54, 8);
        const bar = new Mesh(barGeo, goldMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, -0.02, 0.54);
        shadesGroup.add(bar);

        headNub.add(shadesGroup);

        // ==========================================
        // 3. CHEST ACCESSORIES: GOLD POLICE BADGE & TIE
        // ==========================================
        const chestGroup = new Group();
        chestGroup.name = 'Officer_Chest';

        // Police Star Badge on Left Breast
        const chestBadge = new Mesh(new OctahedronGeo(0.09, 0), goldMat);
        chestBadge.position.set(-0.24, -0.28, 0.56);
        chestBadge.scale.set(1, 1.2, 0.35);
        chestBadge.castShadow = true;
        chestGroup.add(chestBadge);

        // Black Police Tie
        const tie = new Mesh(new BoxGeo(0.11, 0.42, 0.025), blackGlossMat);
        tie.position.set(0, -0.38, 0.57);
        tie.rotation.x = -0.12;
        chestGroup.add(tie);

        // Shoulder Epaulets (Left & Right)
        const epauletGeo = new BoxGeo(0.18, 0.04, 0.28);
        const epL = new Mesh(epauletGeo, navyMat);
        epL.position.set(-0.52, -0.15, 0.08);
        epL.rotation.z = -0.35;
        chestGroup.add(epL);

        const epStarL = new Mesh(new OctahedronGeo(0.04, 0), goldMat);
        epStarL.position.set(-0.54, -0.12, 0.08);
        chestGroup.add(epStarL);

        const epR = new Mesh(epauletGeo, navyMat);
        epR.position.set(0.52, -0.15, 0.08);
        epR.rotation.z = 0.35;
        chestGroup.add(epR);

        const epStarR = new Mesh(new OctahedronGeo(0.04, 0), goldMat);
        epStarR.position.set(0.54, -0.12, 0.08);
        chestGroup.add(epStarR);

        // Walkie-Talkie on Left Shoulder
        const radio = new Mesh(new BoxGeo(0.09, 0.16, 0.08), blackGlossMat);
        radio.position.set(-0.46, -0.06, 0.12);
        radio.rotation.z = -0.2;
        chestGroup.add(radio);

        const antenna = new Mesh(new CylinderGeo(0.01, 0.01, 0.14, 8), blackGlossMat);
        antenna.position.set(-0.48, 0.07, 0.12);
        chestGroup.add(antenna);

        headNub.add(chestGroup);

        return { success: true };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`,
    returnByValue: true
  });

  console.log('Officer render eval result:', JSON.stringify(evalResult.result?.value, null, 2));

  // Let animation play and settle for 1 second
  await new Promise(r => setTimeout(r, 1200));

  // Move camera to nice front view
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cam = window.game.engine.camera;
      cam.position.set(0, 2.2, 4.0);
      cam.lookAt(0, 1.3, 0);
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outDir = path.resolve('C:/Users/Bilal 26/.gemini/antigravity/brain/c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e');
  fs.writeFileSync(path.join(outDir, 'officer_skin_preview.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved officer_skin_preview.png successfully!');

  ws.close();
} finally {
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
}

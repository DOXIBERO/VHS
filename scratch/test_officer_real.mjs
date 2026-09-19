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

await new Promise((r) => server.listen(5191, r));

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\temp\\edge_officer_real_' + Date.now();
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

const port = 9821;
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
  const uncaughtErrors = [];
  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      consoleLogs.push(text);
      console.log('[Browser Console]:', text);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const desc = data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text;
      uncaughtErrors.push(desc);
      console.error('[UNCAUGHT EXCEPTION]:', desc);
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5191/VHS/' });

  // Wait for model load
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 400));
    const check = await send('Runtime.evaluate', {
      expression: '!!(window.game && window.game.engine && window.game.engine.playerBean && window.game.engine.playerBean.isModelLoaded)',
      returnByValue: true
    });
    if (check.result?.value) break;
  }

  // Inject Officer Skin with pure THREE.Mesh
  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      try {
        const THREE = window.THREE;
        const bean = window.game.engine.playerBean;
        const root = bean.characterRoot;

        // Hide Berlin cap and gold chain
        if (bean.accessoriesGroup) bean.accessoriesGroup.visible = false;

        // 1. Uniform Materials by CLONING original materials
        const bodyMat = bean.bodyMesh.material.clone();
        bodyMat.map = null;
        bodyMat.color.setHex(0x0F172A); // Deep Police Navy
        bodyMat.roughness = 0.55;
        bodyMat.metalness = 0.05;
        bean.bodyMesh.material = bodyMat;

        const handMat = bean.handMesh.material.clone();
        handMat.map = null;
        handMat.color.setHex(0xF8FAFC); // Crisp White parade gloves
        handMat.roughness = 0.35;
        bean.handMesh.material = handMat;

        const legMat = bean.legMesh.material.clone();
        legMat.map = null;
        legMat.color.setHex(0x050505); // High-gloss polished black boots
        legMat.roughness = 0.15;
        legMat.metalness = 0.85;
        bean.legMesh.material = legMat;

        const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.12, metalness: 0.95 });
        const blackGlossMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, roughness: 0.1, metalness: 0.85 });
        const navyMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.55, metalness: 0.05 });
        const sunglassesMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.05, metalness: 0.95 });
        const silverMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.1, metalness: 0.95 });

        // Master accessories group attached to bean.mesh (synced with physics body)
        const officerGroup = new THREE.Group();
        officerGroup.name = 'Officer_Group';
        bean.mesh.add(officerGroup);

        // =========================================================
        // A. THE POLICE OFFICER PEAKED CAP (كاسكيطة الضابط)
        // Top of head is at y = 0.93. Cap sits at y = 0.95
        // =========================================================
        const cap = new THREE.Group();
        cap.name = 'PoliceCap';

        // 1. Navy Flared Crown
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.30, 0.18, 24), navyMat);
        crown.position.set(0, 0.98, 0.04);
        crown.rotation.x = -0.15; // Cool backward/forward tilt
        crown.castShadow = true;
        cap.add(crown);

        // 2. Gold Piping around top seam
        const piping = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.015, 10, 24), goldMat);
        piping.position.set(0, 1.06, 0.05);
        piping.rotation.x = Math.PI / 2 - 0.15;
        cap.add(piping);

        // 3. Black Gloss Curved Visor (Visière)
        const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.025, 24, 1, false, 0, Math.PI), blackGlossMat);
        visor.position.set(0, 0.89, 0.16);
        visor.rotation.x = 0.42;
        visor.rotation.y = Math.PI / 2;
        visor.scale.set(1.05, 1, 0.70);
        visor.castShadow = true;
        cap.add(visor);

        // 4. Gold Chin Strap Cord & Side Buttons
        const cord = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.018, 8, 24, Math.PI), goldMat);
        cord.position.set(0, 0.91, 0.10);
        cord.rotation.x = Math.PI / 2 - 0.10;
        cord.rotation.z = Math.PI;
        cap.add(cord);

        // 5. Golden Police Star Crest on Front
        const badgePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 16), goldMat);
        badgePlate.position.set(0, 1.00, 0.38);
        badgePlate.rotation.x = Math.PI / 2 - 0.15;
        cap.add(badgePlate);

        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), goldMat);
        star.position.set(0, 1.00, 0.40);
        star.rotation.z = Math.PI / 5;
        cap.add(star);

        officerGroup.add(cap);

        // =========================================================
        // B. POLICE AVIATOR SUNGLASSES (نظارات البوليسي كحلة)
        // Positioned right in front of eyes (y = 0.60, z = 0.41)
        // =========================================================
        const aviators = new THREE.Group();
        aviators.name = 'Aviators';

        const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), sunglassesMat);
        lensL.position.set(-0.12, 0.60, 0.41);
        lensL.rotation.y = -0.12;
        aviators.add(lensL);

        const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), sunglassesMat);
        lensR.position.set(0.12, 0.60, 0.41);
        lensR.rotation.y = 0.12;
        aviators.add(lensR);

        // Gold Top Brow Bar & Bridge
        const browBar = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.42, 8), goldMat);
        browBar.rotation.z = Math.PI / 2;
        browBar.position.set(0, 0.67, 0.41);
        aviators.add(browBar);

        const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8), goldMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.61, 0.42);
        aviators.add(bridge);

        officerGroup.add(aviators);

        // =========================================================
        // C. CHEST DETAILS: GOLD BADGE, TIE, EPAULETS & DUTY BELT
        // =========================================================
        const bodyDetails = new THREE.Group();
        bodyDetails.name = 'BodyDetails';

        // 1. Police Star Shield Badge on Left Chest
        const chestBadge = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), goldMat);
        chestBadge.position.set(-0.18, 0.28, 0.45);
        chestBadge.scale.set(1, 1.2, 0.35);
        chestBadge.castShadow = true;
        bodyDetails.add(chestBadge);

        // 2. Black Police Tie
        const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.025), blackGlossMat);
        tie.position.set(0, 0.18, 0.46);
        tie.rotation.x = -0.10;
        bodyDetails.add(tie);

        // 3. Shoulder Epaulets with Golden Stars
        const epL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.22), navyMat);
        epL.position.set(-0.38, 0.36, 0.05);
        epL.rotation.z = -0.32;
        bodyDetails.add(epL);

        const epStarL = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), goldMat);
        epStarL.position.set(-0.40, 0.38, 0.05);
        bodyDetails.add(epStarL);

        const epR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.22), navyMat);
        epR.position.set(0.38, 0.36, 0.05);
        epR.rotation.z = 0.32;
        bodyDetails.add(epR);

        const epStarR = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), goldMat);
        epStarR.position.set(0.40, 0.38, 0.05);
        bodyDetails.add(epStarR);

        // 4. Walkie-Talkie on Left Shoulder
        const radio = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.13, 0.06), blackGlossMat);
        radio.position.set(-0.34, 0.44, 0.07);
        radio.rotation.z = -0.15;
        bodyDetails.add(radio);

        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.12, 8), blackGlossMat);
        antenna.position.set(-0.35, 0.54, 0.07);
        bodyDetails.add(antenna);

        // 5. Police Duty Belt with Silver Buckle
        const belt = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.032, 12, 32), blackGlossMat);
        belt.position.set(0, -0.06, 0.02);
        belt.rotation.x = Math.PI / 2;
        bodyDetails.add(belt);

        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.07, 0.025), silverMat);
        buckle.position.set(0, -0.06, 0.48);
        bodyDetails.add(buckle);

        // 6. Mini Police Baton (Matraque) on Right Hip
        const baton = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.26, 8), blackGlossMat);
        baton.position.set(0.46, -0.10, 0.05);
        baton.rotation.z = 0.25;
        bodyDetails.add(baton);

        officerGroup.add(bodyDetails);

        // Hook up rhythmic breathing sync with head bone!
        const headNub = root.getObjectByName('Head_C_nub_07');
        let initialHeadY = headNub ? headNub.position.y : 0;
        const prevUpdate = bean.update.bind(bean);
        bean.update = function(dt) {
          prevUpdate(dt);
          if (headNub) {
            const dy = (headNub.position.y - initialHeadY) * 0.65;
            cap.position.y = dy;
            aviators.position.y = dy;
            bodyDetails.position.y = dy * 0.4;
          }
        };

        return { success: true };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    })()`,
    returnByValue: true
  });

  console.log('Eval result:', JSON.stringify(evalResult.result?.value, null, 2));

  // Let scene run for 1.2s
  await new Promise(r => setTimeout(r, 1200));

  // Position camera for a close-up character portrait
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cam = window.game.engine.camera;
      cam.position.set(0, 1.2, 2.2);
      cam.lookAt(0, 0.8, 0);
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outDir = path.resolve('C:/Users/Bilal 26/.gemini/antigravity/brain/c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e');
  fs.writeFileSync(path.join(outDir, 'officer_skin_portrait.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved officer_skin_portrait.png successfully!');

  ws.close();
} finally {
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
}

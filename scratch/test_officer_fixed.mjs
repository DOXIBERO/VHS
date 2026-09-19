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

await new Promise((r) => server.listen(5193, r));

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\temp\\edge_officer_fixed_' + Date.now();
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

const port = 9819;
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

  const uncaughtErrors = [];
  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description).join(' ');
      console.log('[Browser Console]:', text);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      uncaughtErrors.push(data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text);
      console.error('[UNCAUGHT EXCEPTION]:', data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text);
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'http://localhost:5193/VHS/' });

  // Wait for model load
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 400));
    const check = await send('Runtime.evaluate', {
      expression: '!!(window.game && window.game.engine && window.game.engine.playerBean && window.game.engine.playerBean.isModelLoaded)',
      returnByValue: true
    });
    if (check.result?.value) break;
  }

  // Inject Officer Skin with world-bone sync loop
  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      try {
        const bean = window.game.engine.playerBean;
        const root = bean.characterRoot;

        // Obtain THREE constructors
        const Group = root.constructor;
        const Mesh = bean.bodyMesh.constructor;
        const MeshStandardMat = bean.bodyMesh.material.constructor;
        const CylinderGeo = bean.berlinCap?.children[0]?.geometry?.constructor;
        const BoxGeo = bean.berlinCap?.children[1]?.geometry?.constructor;
        const TorusGeo = bean.goldChain?.children[0]?.geometry?.constructor;
        const OctahedronGeo = bean.goldChain?.children[1]?.geometry?.constructor;

        // Hide Berlin cap and gold chain
        if (bean.accessoriesGroup) bean.accessoriesGroup.visible = false;

        const headNub = root.getObjectByName('Head_C_nub_07');
        const chest = root.getObjectByName('Chest_C_jnt_02');

        // Colors & Materials
        const navyMat = new MeshStandardMat({ color: 0x0F172A, roughness: 0.65, metalness: 0.05 });
        const goldMat = new MeshStandardMat({ color: 0xFFD700, roughness: 0.12, metalness: 0.95 });
        const blackGlossMat = new MeshStandardMat({ color: 0x080808, roughness: 0.1, metalness: 0.85 });
        const sunglassesLensMat = new MeshStandardMat({ color: 0x050505, roughness: 0.05, metalness: 0.95 });
        const whiteGloveMat = new MeshStandardMat({ color: 0xF8FAFC, roughness: 0.35 });

        // Apply body colors
        if (bean.bodyMesh) bean.bodyMesh.material = navyMat;
        if (bean.handMesh) bean.handMesh.material = whiteGloveMat;
        if (bean.legMesh) bean.legMesh.material = blackGlossMat;

        // Create Master Officer Accessories Group attached to bean.mesh (Scene level)
        const officerGroup = new Group();
        officerGroup.name = 'Officer_Skin_Accessories';
        bean.mesh.add(officerGroup);

        // ==========================================
        // 1. POLICE OFFICER PEAKED CAP (كاسكيطة الضابط)
        // Positioned at top of head (y ~ 0.82)
        // ==========================================
        const capGroup = new Group();
        capGroup.name = 'PoliceCap';

        // Cap Crown (Navy flared cylinder)
        const crownGeo = new CylinderGeo(0.36, 0.28, 0.16, 24);
        const crown = new Mesh(crownGeo, navyMat);
        crown.position.set(0, 0.84, 0.04);
        crown.rotation.x = -0.12;
        crown.castShadow = true;
        capGroup.add(crown);

        // Gold Piping Trim around top
        const trimGeo = new TorusGeo(0.36, 0.014, 12, 24);
        const trim = new Mesh(trimGeo, goldMat);
        trim.position.set(0, 0.91, 0.05);
        trim.rotation.x = Math.PI / 2 - 0.12;
        capGroup.add(trim);

        // Black Curved Visor (Visière)
        const visorGeo = new CylinderGeo(0.34, 0.34, 0.025, 24, 1, false, 0, Math.PI);
        const visor = new Mesh(visorGeo, blackGlossMat);
        visor.position.set(0, 0.77, 0.14);
        visor.rotation.x = 0.42;
        visor.rotation.y = Math.PI / 2;
        visor.scale.set(1.05, 1, 0.65);
        visor.castShadow = true;
        capGroup.add(visor);

        // Gold Braid Cord across visor
        const cordGeo = new TorusGeo(0.32, 0.016, 10, 24, Math.PI);
        const cord = new Mesh(cordGeo, goldMat);
        cord.position.set(0, 0.79, 0.08);
        cord.rotation.x = Math.PI / 2 - 0.10;
        cord.rotation.z = Math.PI;
        capGroup.add(cord);

        // Golden Badge Plate with Star Emblem on Front of Cap
        const badgePlateGeo = new CylinderGeo(0.065, 0.065, 0.015, 16);
        const badgePlate = new Mesh(badgePlateGeo, goldMat);
        badgePlate.position.set(0, 0.86, 0.36);
        badgePlate.rotation.x = Math.PI / 2 - 0.12;
        capGroup.add(badgePlate);

        const starGeo = new OctahedronGeo(0.045, 0);
        const star = new Mesh(starGeo, goldMat);
        star.position.set(0, 0.86, 0.38);
        star.rotation.z = Math.PI / 5;
        capGroup.add(star);

        officerGroup.add(capGroup);

        // ==========================================
        // 2. POLICE AVIATOR SUNGLASSES (نظارات البوليسي كحلة)
        // Positioned right over the cute Fall Guy eyes (y ~ 0.58)
        // ==========================================
        const aviatorsGroup = new Group();
        aviatorsGroup.name = 'PoliceAviators';

        const lensGeo = new BoxGeo(0.16, 0.12, 0.02);
        const lensL = new Mesh(lensGeo, sunglassesLensMat);
        lensL.position.set(-0.11, 0.58, 0.38);
        lensL.rotation.y = -0.12;
        aviatorsGroup.add(lensL);

        const lensR = new Mesh(lensGeo, sunglassesLensMat);
        lensR.position.set(0.11, 0.58, 0.38);
        lensR.rotation.y = 0.12;
        aviatorsGroup.add(lensR);

        // Gold Top Brow Bar
        const barGeo = new CylinderGeo(0.01, 0.01, 0.38, 8);
        const bar = new Mesh(barGeo, goldMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 0.64, 0.38);
        aviatorsGroup.add(bar);

        // Gold Nose Bridge
        const bridgeGeo = new CylinderGeo(0.01, 0.01, 0.08, 8);
        const bridge = new Mesh(bridgeGeo, goldMat);
        bridge.rotation.z = Math.PI / 2;
        bridge.position.set(0, 0.59, 0.39);
        aviatorsGroup.add(bridge);

        officerGroup.add(aviatorsGroup);

        // ==========================================
        // 3. POLICE CHEST BADGE, EPAULETS & TIE
        // ==========================================
        const uniformAcc = new Group();
        uniformAcc.name = 'UniformAccessories';

        // Gold Police Badge on Left Chest
        const chestBadge = new Mesh(new OctahedronGeo(0.07, 0), goldMat);
        chestBadge.position.set(-0.18, 0.28, 0.44);
        chestBadge.scale.set(1, 1.2, 0.35);
        chestBadge.castShadow = true;
        uniformAcc.add(chestBadge);

        // Black Police Tie
        const tie = new Mesh(new BoxGeo(0.08, 0.32, 0.02), blackGlossMat);
        tie.position.set(0, 0.20, 0.45);
        tie.rotation.x = -0.12;
        uniformAcc.add(tie);

        // Shoulder Epaulets with Golden Stars (Left & Right)
        const epauletGeo = new BoxGeo(0.14, 0.03, 0.22);
        const epL = new Mesh(epauletGeo, navyMat);
        epL.position.set(-0.38, 0.35, 0.06);
        epL.rotation.z = -0.32;
        uniformAcc.add(epL);

        const epStarL = new Mesh(new OctahedronGeo(0.03, 0), goldMat);
        epStarL.position.set(-0.40, 0.37, 0.06);
        uniformAcc.add(epStarL);

        const epR = new Mesh(epauletGeo, navyMat);
        epR.position.set(0.38, 0.35, 0.06);
        epR.rotation.z = 0.32;
        uniformAcc.add(epR);

        const epStarR = new Mesh(new OctahedronGeo(0.03, 0), goldMat);
        epStarR.position.set(0.40, 0.37, 0.06);
        uniformAcc.add(epStarR);

        // Police Walkie-Talkie on Left Shoulder
        const radio = new Mesh(new BoxGeo(0.07, 0.12, 0.06), blackGlossMat);
        radio.position.set(-0.34, 0.44, 0.08);
        radio.rotation.z = -0.15;
        uniformAcc.add(radio);

        const antenna = new Mesh(new CylinderGeo(0.008, 0.008, 0.10, 8), blackGlossMat);
        antenna.position.set(-0.35, 0.54, 0.08);
        uniformAcc.add(antenna);

        // Police Duty Belt with Silver Buckle
        const beltTorusGeo = new TorusGeo(0.44, 0.032, 12, 32);
        const beltMesh = new Mesh(beltTorusGeo, blackGlossMat);
        beltMesh.position.set(0, -0.15, 0.02);
        beltMesh.rotation.x = Math.PI / 2;
        uniformAcc.add(beltMesh);

        // Silver Buckle in Front
        const silverMat = new MeshStandardMat({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.1 });
        const buckle = new Mesh(new BoxGeo(0.09, 0.07, 0.025), silverMat);
        buckle.position.set(0, -0.15, 0.46);
        uniformAcc.add(buckle);

        // Mini Baton (Matraque) on Right Hip
        const baton = new Mesh(new CylinderGeo(0.018, 0.018, 0.28, 8), blackGlossMat);
        baton.position.set(0.44, -0.18, 0.05);
        baton.rotation.z = 0.25;
        uniformAcc.add(baton);

        officerGroup.add(uniformAcc);

        // Synchronize with headBone breathing dynamically in the animation loop!
        const origUpdate = bean.update.bind(bean);
        let baseHeadY = null;
        bean.update = function(dt) {
          origUpdate(dt);
          if (headNub) {
            if (baseHeadY === null) baseHeadY = headNub.position.y;
            const deltaY = (headNub.position.y - baseHeadY) * 0.65; // scaled to character
            capGroup.position.y = deltaY;
            aviatorsGroup.position.y = deltaY;
            uniformAcc.position.y = deltaY * 0.5; // subtle chest breathing!
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

  // Let animation play for 1 second
  await new Promise(r => setTimeout(r, 1200));

  // Position camera for a stunning full body and close-up preview
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cam = window.game.engine.camera;
      cam.position.set(0, 2.0, 3.8);
      cam.lookAt(0, 1.2, 0);
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outDir = path.resolve('C:/Users/Bilal 26/.gemini/antigravity/brain/c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e');
  fs.writeFileSync(path.join(outDir, 'officer_skin_perfect.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved officer_skin_perfect.png successfully! Errors:', uncaughtErrors.length);

  ws.close();
} finally {
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
}

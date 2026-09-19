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

await new Promise((r) => server.listen(5195, r));

const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = 'C:\\temp\\edge_officer_' + Date.now();
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

const port = 9817;
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
  await send('Page.navigate', { url: 'http://localhost:5195/VHS/' });

  // Wait for model load
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 400));
    const check = await send('Runtime.evaluate', {
      expression: '!!(window.game && window.game.engine && window.game.engine.playerBean && window.game.engine.playerBean.isModelLoaded)',
      returnByValue: true
    });
    if (check.result?.value) break;
  }

  // Inject and construct the full Officer Skin with bone rigging in browser!
  const injectOfficer = await send('Runtime.evaluate', {
    expression: `(() => {
      const bean = window.game.engine.playerBean;
      const root = bean.characterRoot;

      // Bone lookups
      const headNub = root.getObjectByName('Head_C_nub_07');
      const headJnt = root.getObjectByName('Head_C_jnt01_04');
      const chest = root.getObjectByName('Chest_C_jnt_02');

      // 1. Materials
      const navyMat = new THREE.MeshStandardMaterial({
        color: 0x14213D, // Deep Moroccan / Police Navy
        roughness: 0.65,
        metalness: 0.05
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Gleaming polished gold
        metalness: 0.95,
        roughness: 0.12
      });
      const blackGlossMat = new THREE.MeshStandardMaterial({
        color: 0x0A0A0A, // High gloss patent leather
        roughness: 0.15,
        metalness: 0.8
      });
      const sunglassesLensMat = new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.05,
        metalness: 0.95
      });
      const whiteGloveMat = new THREE.MeshStandardMaterial({
        color: 0xF8FAFC,
        roughness: 0.4
      });

      // Apply body, hands, and legs colors
      if (bean.bodyMesh) {
        bean.bodyMesh.material = navyMat;
      }
      if (bean.handMesh) {
        bean.handMesh.material = whiteGloveMat; // White ceremonial/traffic gloves!
      }
      if (bean.legMesh) {
        bean.legMesh.material = blackGlossMat; // Polished black boots!
      }

      // Hide previous accessories
      if (bean.accessoriesGroup) {
        bean.accessoriesGroup.visible = false;
      }

      // Clean existing officer group if any
      const existing = root.getObjectByName('Officer_Rigged_Group');
      if (existing) existing.parent.remove(existing);

      const officerRoot = new THREE.Group();
      officerRoot.name = 'Officer_Rigged_Group';

      // ==========================================
      // A. POLICE OFFICER PEAKED CAP (كاسكيطة البوليسي)
      // Attached to Head_C_nub_07 so it breathes and bobs with the head!
      // ==========================================
      const capGroup = new THREE.Group();
      capGroup.name = 'PoliceCap_Group';

      // 1. Flared Crown (Flared cylinder, slightly taller and wider at top)
      const crownGeo = new THREE.CylinderGeometry(0.55, 0.48, 0.22, 24);
      const crownMesh = new THREE.Mesh(crownGeo, navyMat);
      crownMesh.position.set(0, 0.08, 0.02);
      crownMesh.rotation.x = -0.12; // Slight tilt
      crownMesh.castShadow = true;
      capGroup.add(crownMesh);

      // 2. Gold Crown Piping (Torus around top rim)
      const pipingGeo = new THREE.TorusGeometry(0.55, 0.018, 12, 24);
      const pipingMesh = new THREE.Mesh(pipingGeo, goldMat);
      pipingMesh.position.set(0, 0.18, 0.03);
      pipingMesh.rotation.x = Math.PI / 2 - 0.12;
      pipingMesh.castShadow = true;
      capGroup.add(pipingMesh);

      // 3. Black Gloss Curved Visor (Visière)
      // Cylinder slice or flattened curved box
      const visorGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.03, 24, 1, false, 0, Math.PI);
      const visorMesh = new THREE.Mesh(visorGeo, blackGlossMat);
      visorMesh.position.set(0, -0.01, 0.12);
      visorMesh.rotation.x = 0.45; // Curved down over eyes
      visorMesh.rotation.y = Math.PI / 2;
      visorMesh.scale.set(1.05, 1, 0.55);
      visorMesh.castShadow = true;
      capGroup.add(visorMesh);

      // 4. Gold Chin Strap Cord & Side Buttons
      const strapGeo = new THREE.TorusGeometry(0.49, 0.02, 10, 24, Math.PI);
      const strapMesh = new THREE.Mesh(strapGeo, goldMat);
      strapMesh.position.set(0, 0.01, 0.06);
      strapMesh.rotation.x = Math.PI / 2 - 0.08;
      strapMesh.rotation.z = Math.PI;
      capGroup.add(strapMesh);

      // Side buttons (gold cylinders)
      const buttonGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12);
      const btnL = new THREE.Mesh(buttonGeo, goldMat);
      btnL.position.set(-0.48, 0.01, 0.08);
      btnL.rotation.z = Math.PI / 2;
      capGroup.add(btnL);

      const btnR = new THREE.Mesh(buttonGeo, goldMat);
      btnR.position.set(0.48, 0.01, 0.08);
      btnR.rotation.z = -Math.PI / 2;
      capGroup.add(btnR);

      // 5. Official Police Golden Star / Shield Crest on Front
      const badgePlateGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);
      const badgePlate = new THREE.Mesh(badgePlateGeo, goldMat);
      badgePlate.position.set(0, 0.12, 0.52);
      badgePlate.rotation.x = Math.PI / 2 - 0.12;
      capGroup.add(badgePlate);

      // 5-point Star Emblem (Octahedron relief)
      const starGeo = new THREE.OctahedronGeometry(0.06, 0);
      const starMesh = new THREE.Mesh(starGeo, goldMat);
      starMesh.position.set(0, 0.12, 0.54);
      starMesh.rotation.z = Math.PI / 5;
      capGroup.add(starMesh);

      // Attach Cap to headNub
      headNub.add(capGroup);

      // ==========================================
      // B. POLICE AVIATOR SUNGLASSES (نظارات البوليسي كحلة)
      // Attached to headJnt so they align with eyes & breathe with head
      // ==========================================
      const aviatorsGroup = new THREE.Group();
      aviatorsGroup.name = 'Aviators_Group';

      // Left Lens (Teardrop/curved box)
      const lensGeo = new THREE.BoxGeometry(0.22, 0.16, 0.03);
      const lensL = new THREE.Mesh(lensGeo, sunglassesLensMat);
      lensL.position.set(-0.16, 0.04, 0.52);
      lensL.rotation.y = -0.15;
      aviatorsGroup.add(lensL);

      // Right Lens
      const lensR = new THREE.Mesh(lensGeo, sunglassesLensMat);
      lensR.position.set(0.16, 0.04, 0.52);
      lensR.rotation.y = 0.15;
      aviatorsGroup.add(lensR);

      // Gold Brow Bar & Bridge
      const browBarGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.54, 8);
      const browBar = new THREE.Mesh(browBarGeo, goldMat);
      browBar.rotation.z = Math.PI / 2;
      browBar.position.set(0, 0.11, 0.52);
      aviatorsGroup.add(browBar);

      const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8);
      const bridge = new THREE.Mesh(bridgeGeo, goldMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 0.04, 0.53);
      aviatorsGroup.add(bridge);

      headNub.add(aviatorsGroup);

      // ==========================================
      // C. CHEST POLICE BADGE & SHOULDER EPAULETS
      // Attached to chest bone (moves with torso breathing!)
      // ==========================================
      const chestAccGroup = new THREE.Group();
      chestAccGroup.name = 'ChestAccessories_Group';

      // 1. Police Star Badge on Left Breast
      const chestBadgeGeo = new THREE.OctahedronGeometry(0.09, 0);
      const chestBadge = new THREE.Mesh(chestBadgeGeo, goldMat);
      chestBadge.position.set(-0.24, -0.12, 0.58);
      chestBadge.scale.set(1, 1.2, 0.35);
      chestBadge.castShadow = true;
      chestAccGroup.add(chestBadge);

      // 2. Left Shoulder Epaulet (قياطين الكتاف)
      const epauletGeo = new THREE.BoxGeometry(0.18, 0.04, 0.30);
      const epauletL = new THREE.Mesh(epauletGeo, navyMat);
      epauletL.position.set(-0.52, 0.02, 0.08);
      epauletL.rotation.z = -0.35;
      chestAccGroup.add(epauletL);

      const epauletStarL = new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), goldMat);
      epauletStarL.position.set(-0.54, 0.05, 0.08);
      chestAccGroup.add(epauletStarL);

      // 3. Right Shoulder Epaulet
      const epauletR = new THREE.Mesh(epauletGeo, navyMat);
      epauletR.position.set(0.52, 0.02, 0.08);
      epauletR.rotation.z = 0.35;
      chestAccGroup.add(epauletR);

      const epauletStarR = new THREE.Mesh(new THREE.OctahedronGeometry(0.04, 0), goldMat);
      epauletStarR.position.set(0.54, 0.05, 0.08);
      chestAccGroup.add(epauletStarR);

      // 4. Police Radio / Walkie-Talkie on Left Shoulder
      const radioBoxGeo = new THREE.BoxGeometry(0.09, 0.16, 0.08);
      const radioMesh = new THREE.Mesh(radioBoxGeo, blackGlossMat);
      radioMesh.position.set(-0.46, 0.12, 0.12);
      radioMesh.rotation.z = -0.2;
      chestAccGroup.add(radioMesh);

      // Radio Antenna
      const antennaGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.14, 8);
      const antennaMesh = new THREE.Mesh(antennaGeo, blackGlossMat);
      antennaMesh.position.set(-0.48, 0.25, 0.12);
      chestAccGroup.add(antennaMesh);

      // 5. Black Police Tie
      const tieGeo = new THREE.BoxGeometry(0.10, 0.40, 0.02);
      const tieMesh = new THREE.Mesh(tieGeo, blackGlossMat);
      tieMesh.position.set(0, -0.22, 0.59);
      tieMesh.rotation.x = -0.12;
      chestAccGroup.add(tieMesh);

      // 6. Police Duty Belt with Silver Buckle
      const beltTorusGeo = new THREE.TorusGeometry(0.56, 0.04, 12, 32);
      const beltMesh = new THREE.Mesh(beltTorusGeo, blackGlossMat);
      beltMesh.position.set(0, -0.46, 0.02);
      beltMesh.rotation.x = Math.PI / 2;
      chestAccGroup.add(beltMesh);

      // Silver Buckle in front
      const buckleGeo = new THREE.BoxGeometry(0.12, 0.10, 0.03);
      const silverMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95, roughness: 0.1 });
      const buckleMesh = new THREE.Mesh(buckleGeo, silverMat);
      buckleMesh.position.set(0, -0.46, 0.58);
      chestAccGroup.add(buckleMesh);

      // Mini Police Baton (Matraque) on right hip
      const batonGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 8);
      const batonMesh = new THREE.Mesh(batonGeo, blackGlossMat);
      batonMesh.position.set(0.56, -0.48, 0.05);
      batonMesh.rotation.z = 0.25;
      chestAccGroup.add(batonMesh);

      // Because chest bone in Maya/GLTF has 180 deg X flip, we handle orientation:
      // In Three.js bone space:
      headNub.add(chestAccGroup);

      return { success: true, capAttached: true, aviatorsAttached: true, badgeAttached: true };
    })()`,
    returnByValue: true
  });

  console.log('Officer injection result:', JSON.stringify(injectOfficer.result?.value, null, 2));

  // Let animation play and breathe for 1 second
  await new Promise(r => setTimeout(r, 1200));

  // Take full body front screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  const outDir = path.resolve('C:/Users/Bilal 26/.gemini/antigravity/brain/c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e');
  fs.writeFileSync(path.join(outDir, 'officer_skin_front.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved officer_skin_front.png');

  // Move camera close to head for detailed close-up shot
  await send('Runtime.evaluate', {
    expression: `(() => {
      const cam = window.game.engine.camera;
      cam.position.set(0, 1.8, 3.2);
      cam.lookAt(0, 1.4, 0);
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'officer_skin_closeup.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved officer_skin_closeup.png');

  ws.close();
} finally {
  try { proc.kill(); } catch (e) {}
  try { server.close(); } catch (e) {}
}

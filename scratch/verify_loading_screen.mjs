import { spawn } from 'child_process';
import fs from 'fs';

async function testLoadingScreen() {
  const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\temp\\edge_load_' + Date.now();
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const port = 9750 + Math.floor(Math.random() * 200);
  const proc = spawn(browserPath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--ignore-certificate-errors',
    '--window-size=1280,720',
    'about:blank'
  ]);

  try {
    await new Promise(r => setTimeout(r, 1500));
    const versionRes = await fetch(`http://127.0.0.1:${port}/json/version`);
    const versionData = await versionRes.json();
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

    let loadedPromise = new Promise(resolve => {
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'Page.loadEventFired') {
          ws.removeEventListener('message', handler);
          resolve();
        }
      };
      ws.addEventListener('message', handler);
    });

    await send('Page.enable');
    await send('Runtime.enable');

    await send('Page.navigate', { url: 'https://doxibero.github.io/VHS/?t=' + Date.now() });
    await loadedPromise;
    await new Promise(r => setTimeout(r, 1000));

    // Verify loading overlay elements in DOM
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('loading-screen');
        const bar = document.getElementById('loading-bar-fill');
        const text = document.getElementById('loading-text');
        return {
          hasOverlay: !!overlay,
          hasBar: !!bar,
          hasText: !!text,
          isHidden: overlay?.classList.contains('loading-hidden'),
          text: text?.textContent,
          barWidth: bar?.style.width
        };
      })()`,
      returnByValue: true
    });

    console.log('Loading Overlay DOM State:', evalRes.result?.value);

    // Make visible at 70% to take a clean screenshot of the UI design
    await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('loading-screen');
        const bar = document.getElementById('loading-bar-fill');
        const text = document.getElementById('loading-text');
        if (overlay) overlay.classList.remove('loading-hidden');
        if (bar) bar.style.width = '70%';
        if (text) text.textContent = 'Loading... 70%';
      })()`
    });

    await new Promise(r => setTimeout(r, 500));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    fs.writeFileSync('C:\\Users\\Bilal 26\\.gemini\\antigravity\\brain\\c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e\\scratch\\loading_screen_verified.png', buffer);
    console.log('Loading screen design verified and saved to loading_screen_verified.png!');

    ws.close();
  } finally {
    proc.kill();
  }
}

testLoadingScreen().catch(console.error);

import { spawn } from 'child_process';
import fs from 'fs';

async function diagnoseModel() {
  const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\temp\\edge_diag_' + Date.now();
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const port = 9850 + Math.floor(Math.random() * 50);
  const proc = spawn(browserPath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--ignore-certificate-errors',
    '--window-size=1280,720',
    'about:blank'
  ]);

  try {
    let versionData;
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 250));
      try {
        const versionRes = await fetch(`http://127.0.0.1:${port}/json/version`);
        versionData = await versionRes.json();
        break;
      } catch (e) {}
    }
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

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        console.log('[BROWSER LOG]:', text);
      }
      if (data.method === 'Log.entryAdded') {
        console.log('[BROWSER ENTRY]:', data.params.entry.text);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Network.enable');

    console.log('Navigating to https://doxibero.github.io/VHS/ ...');
    await send('Page.navigate', { url: 'https://doxibero.github.io/VHS/?t=' + Date.now() });

    // Wait 5 seconds to give time for model to fetch and render
    await new Promise(r => setTimeout(r, 5000));

    // Inspect window state
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const engine = window.engine;
        const player = engine?.playerBean;
        return {
          hasEngine: !!engine,
          hasPlayer: !!player,
          isModelLoaded: player?.isModelLoaded,
          meshChildren: player?.mesh?.children?.length,
          meshPos: player?.mesh?.position,
          bodyPos: player?.body?.position
        };
      })()`,
      returnByValue: true
    });

    console.log('Diagnostic evaluation result:', evalRes?.result?.value);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Bilal 26\\.gemini\\antigravity\brain\\c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e\\scratch\\diag_screenshot.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved diag_screenshot.png');

    ws.close();
  } finally {
    proc.kill();
  }
}

diagnoseModel().catch(console.error);

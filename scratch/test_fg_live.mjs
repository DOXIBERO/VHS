import { spawn } from 'child_process';
import fs from 'fs';

async function testFallGuyLive() {
  const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\temp\\edge_test_fg_' + Date.now();
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const port = 9880 + Math.floor(Math.random() * 50);
  const proc = spawn(browserPath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--ignore-certificate-errors',
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
        console.log('[BROWSER ERROR]:', data.params.entry.text);
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');

    console.log('Navigating to https://doxibero.github.io/VHS/ ...');
    await send('Page.navigate', { url: 'https://doxibero.github.io/VHS/?t=' + Date.now() });

    // Wait 7 seconds for model and draco to load
    await new Promise(r => setTimeout(r, 7000));

    const checkState = await send('Runtime.evaluate', {
      expression: `(() => {
        const p = window.game?.engine?.playerBean;
        return {
          hasGame: !!window.game,
          hasEngine: !!window.game?.engine,
          hasPlayer: !!p,
          isModelLoaded: p?.isModelLoaded,
          children: p?.mesh?.children?.length,
          pos: p?.mesh?.position
        };
      })()`,
      returnByValue: true
    });

    console.log('Check State:', checkState?.result?.value);

    const ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Bilal 26\\.gemini\\antigravity\\brain\\c94bf4b4-4ec4-4dbc-8f13-68b3b58b5c2e\\scratch\\live_fg_test.png', Buffer.from(ss.data, 'base64'));
    console.log('Saved live_fg_test.png!');

    ws.close();
  } finally {
    proc.kill();
  }
}

testFallGuyLive().catch(console.error);

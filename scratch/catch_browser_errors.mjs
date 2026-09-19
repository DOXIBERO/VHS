import { spawn } from 'child_process';
import fs from 'fs';

async function catchErrors() {
  const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\temp\\edge_err_' + Date.now();
  if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

  const port = 9910 + Math.floor(Math.random() * 50);
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
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        console.log('[BROWSER LOG]:', text);
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('[UNCAUGHT JS EXCEPTION]:', JSON.stringify(data.params.exceptionDetails));
      }
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

    console.log('Navigating to live site...');
    await send('Page.navigate', { url: 'https://doxibero.github.io/VHS/?t=' + Date.now() });
    await loadedPromise;
    console.log('Page loaded! Waiting 6s for GLB & Draco...');

    await new Promise(r => setTimeout(r, 6000));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const engine = window.game?.engine;
        const player = engine?.playerBean;
        return {
          isModelLoaded: player?.isModelLoaded,
          children: player?.mesh?.children?.length,
          pos: player?.mesh?.position,
          hasScene: !!engine?.scene
        };
      })()`,
      returnByValue: true
    });
    console.log('Model status in browser:', check?.result?.value);

    ws.close();
  } finally {
    proc.kill();
  }
}

catchErrors().catch(console.error);

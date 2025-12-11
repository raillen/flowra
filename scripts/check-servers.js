import http from 'http';

/**
 * Verifica se os servidores estão rodando antes dos testes
 */

function checkServer(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 2000,
    };

    const req = http.request(options, (res) => {
      resolve({ running: true, status: res.statusCode });
    });

    req.on('error', () => {
      resolve({ running: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false });
    });

    req.end();
  });
}

async function checkServers() {
  console.log('🔍 Verificando se os servidores estão rodando...\n');

  const backend = await checkServer('http://localhost:3000/health', 'Backend');
  const frontend = await checkServer('http://localhost:5173', 'Frontend');

  console.log(`Backend (http://localhost:3000): ${backend.running ? '✅ Rodando' : '❌ Não está rodando'}`);
  console.log(`Frontend (http://localhost:5173): ${frontend.running ? '✅ Rodando' : '❌ Não está rodando'}\n`);

  if (!backend.running) {
    console.log('⚠️  Backend não está rodando. O Playwright tentará iniciá-lo automaticamente.');
  }

  if (!frontend.running) {
    console.log('⚠️  Frontend não está rodando. O Playwright tentará iniciá-lo automaticamente.');
  }

  if (backend.running && frontend.running) {
    console.log('✅ Ambos os servidores estão rodando. Os testes usarão os servidores existentes.\n');
  }
}

checkServers().catch(console.error);


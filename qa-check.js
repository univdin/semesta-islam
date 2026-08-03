const http = require('http');

const routes = [
  '/',
  '/developer',
  '/contributions',
  '/booking',
  '/discovery',
  '/ambassador',
  '/management/lajnah',
  '/management/governance',
  '/directory',
  '/educator/verification',
  '/affiliate'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get('http://localhost:3000' + route, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          hasError: data.includes('Error:') || data.includes('Unhandled Runtime Error'),
          length: data.length
        });
      });
    }).on('error', (err) => {
      resolve({ route, status: 0, error: err.message });
    });
  });
}

async function run() {
  for (const r of routes) {
    const result = await checkRoute(r);
    console.log(result);
  }
}
run();

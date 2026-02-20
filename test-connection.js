#!/usr/bin/env node

/**
 * Test Frontend-Backend Connection
 * Simple script to verify API connectivity
 */

const http = require('http');

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function testEndpoint(host, port, path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        log(`✅ ${description} - Server responding`, 'green');
        resolve(true);
      } else {
        log(`⚠️  ${description} - Status: ${res.statusCode}`, 'yellow');
        resolve(true);
      }
    });

    req.on('error', (error) => {
      log(`❌ ${description} - ${error.message}`, 'red');
      resolve(false);
    });

    req.on('timeout', () => {
      log(`❌ ${description} - Timeout`, 'red');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  log('\n🔍 Testing Frontend-Backend Connection...\n', 'blue');

  log('Testing Backend API:', 'yellow');
  const backendHealth = await testEndpoint('localhost', 8000, '/api/health', 'Backend Health Check');
  const backendDocs = await testEndpoint('localhost', 8000, '/docs', 'Backend API Docs');

  log('\nTesting Frontend:', 'yellow');
  const frontend = await testEndpoint('localhost', 5173, '/', 'Frontend Server');

  log('\n' + '='.repeat(50), 'blue');

  if (backendHealth && frontend) {
    log('\n✅ All services are running!', 'green');
    log('\n📋 Access Points:', 'blue');
    log('  Frontend: http://localhost:5173', 'yellow');
    log('  Backend API: http://localhost:8000', 'yellow');
    log('  API Docs: http://localhost:8000/docs', 'yellow');
    log('\n  Login: admin / admin123\n', 'yellow');
  } else {
    log('\n❌ Some services are not running!', 'red');
    log('\n📋 Start Services:', 'blue');
    if (!backendHealth) {
      log('  Backend: cd backend && start.bat (or ./start.sh)', 'yellow');
    }
    if (!frontend) {
      log('  Frontend: cd frontend && npm run dev', 'yellow');
    }
    log('');
  }

  log('='.repeat(50) + '\n', 'blue');
}

runTests();

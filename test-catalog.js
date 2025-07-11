#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

// Test catalog loading by starting the backend and checking endpoints
function testCatalogEndpoints() {
  return new Promise((resolve) => {
    console.log('🔍 Testing catalog endpoints...');
    
    const backendProcess = spawn('yarn', ['workspace', 'backend', 'start'], {
      cwd: __dirname,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    let backendOutput = '';
    let backendError = '';
    let backendStarted = false;
    
    backendProcess.stdout.on('data', (data) => {
      backendOutput += data.toString();
      if (backendOutput.includes('Listening on') || backendOutput.includes('Backend is listening')) {
        backendStarted = true;
      }
    });
    
    backendProcess.stderr.on('data', (data) => {
      backendError += data.toString();
    });
    
    // Wait for startup
    setTimeout(async () => {
      if (backendStarted) {
        console.log('✅ Backend started successfully');
        
        // Test catalog endpoints
        try {
          const entities = await makeRequest('/api/catalog/entities');
          console.log(`✅ Catalog API accessible - found ${entities.length} entities`);
          
          // Check for our custom entities
          const personalComponents = entities.filter(e => e.spec && e.spec.owner === 'user:personal');
          console.log(`✅ Personal components found: ${personalComponents.length}`);
          
          const systems = entities.filter(e => e.kind === 'System');
          console.log(`✅ Systems found: ${systems.length}`);
          
          const resources = entities.filter(e => e.kind === 'Resource');
          console.log(`✅ Resources found: ${resources.length}`);
          
          const templates = entities.filter(e => e.kind === 'Template');
          console.log(`✅ Templates found: ${templates.length}`);
          
        } catch (error) {
          console.log(`❌ Catalog API error: ${error.message}`);
        }
        
      } else {
        console.log(`❌ Backend startup failed: ${backendError}`);
      }
      
      backendProcess.kill();
      resolve();
    }, 45000); // Give backend more time to start
  });
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 7007,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

async function runCatalogTests() {
  console.log('🧪 Running Catalog Tests...\n');
  
  try {
    await testCatalogEndpoints();
  } catch (error) {
    console.log(`❌ Catalog test failed: ${error.message}`);
  }
}

// Only run if not dealing with native dependency issues
if (process.argv.includes('--skip-backend')) {
  console.log('⚠️  Skipping backend tests due to native dependency issues');
} else {
  runCatalogTests().catch(console.error);
}
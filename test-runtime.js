#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const testConfig = {
  frontendPort: 3000,
  backendPort: 7007,
  startupTimeout: 30000,
  healthCheckTimeout: 10000
};

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(name, passed, error = null) {
  if (passed) {
    console.log(`✅ ${name}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${name}`);
    testResults.failed++;
    if (error) {
      testResults.errors.push({ test: name, error: error.message });
      console.log(`   Error: ${error.message}`);
    }
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      resolve(false);
    });
    
    req.end();
  });
}

function testDependencies() {
  const packagePath = path.join(__dirname, 'package.json');
  const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const nodeModulesExists = fs.existsSync(nodeModulesPath);
  
  logTest('node_modules directory exists', nodeModulesExists);
  
  // Check critical dependencies
  const criticalDeps = [
    '@backstage/core-components',
    '@backstage/core-plugin-api',
    '@backstage/plugin-catalog',
    'react',
    'react-dom'
  ];
  
  criticalDeps.forEach(dep => {
    const depPath = path.join(__dirname, 'node_modules', dep);
    const depExists = fs.existsSync(depPath);
    logTest(`Dependency exists: ${dep}`, depExists);
  });
}

function testBuild() {
  return new Promise((resolve) => {
    console.log('🔨 Testing build process...');
    
    const buildProcess = spawn('yarn', ['build'], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let buildOutput = '';
    let buildError = '';
    
    buildProcess.stdout.on('data', (data) => {
      buildOutput += data.toString();
    });
    
    buildProcess.stderr.on('data', (data) => {
      buildError += data.toString();
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        logTest('Build process completes successfully', true);
      } else {
        logTest('Build process completes successfully', false, 
          new Error(`Build failed with code ${code}: ${buildError}`));
      }
      resolve();
    });
    
    // Timeout after 2 minutes
    setTimeout(() => {
      buildProcess.kill();
      logTest('Build process completes successfully', false, 
        new Error('Build process timed out'));
      resolve();
    }, 120000);
  });
}

function testLinting() {
  return new Promise((resolve) => {
    console.log('🔍 Testing linting...');
    
    const lintProcess = spawn('yarn', ['lint'], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let lintOutput = '';
    let lintError = '';
    
    lintProcess.stdout.on('data', (data) => {
      lintOutput += data.toString();
    });
    
    lintProcess.stderr.on('data', (data) => {
      lintError += data.toString();
    });
    
    lintProcess.on('close', (code) => {
      if (code === 0) {
        logTest('Linting passes', true);
      } else {
        logTest('Linting passes', false, 
          new Error(`Linting failed: ${lintError}`));
      }
      resolve();
    });
    
    // Timeout after 1 minute
    setTimeout(() => {
      lintProcess.kill();
      logTest('Linting passes', false, 
        new Error('Linting process timed out'));
      resolve();
    }, 60000);
  });
}

function testFrontendStartup() {
  return new Promise((resolve) => {
    console.log('🚀 Testing frontend startup...');
    
    const frontendProcess = spawn('yarn', ['workspace', 'app', 'start'], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let frontendOutput = '';
    let frontendError = '';
    let frontendStarted = false;
    
    frontendProcess.stdout.on('data', (data) => {
      frontendOutput += data.toString();
      if (frontendOutput.includes('webpack compiled successfully')) {
        frontendStarted = true;
      }
    });
    
    frontendProcess.stderr.on('data', (data) => {
      frontendError += data.toString();
    });
    
    // Wait for startup
    setTimeout(async () => {
      if (frontendStarted) {
        logTest('Frontend starts successfully', true);
        
        // Test port accessibility
        const portAccessible = await checkPort(testConfig.frontendPort);
        logTest(`Frontend accessible on port ${testConfig.frontendPort}`, portAccessible);
      } else {
        logTest('Frontend starts successfully', false, 
          new Error(`Frontend startup failed: ${frontendError}`));
      }
      
      frontendProcess.kill();
      resolve();
    }, testConfig.startupTimeout);
  });
}

async function runTests() {
  console.log('🧪 Running Backstage Runtime Tests...\n');
  
  console.log('📦 Testing dependencies:');
  testDependencies();
  
  console.log('\n🔍 Testing linting:');
  await testLinting();
  
  console.log('\n🚀 Testing frontend startup:');
  await testFrontendStartup();
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🐛 Errors found:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
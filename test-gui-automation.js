#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Comprehensive GUI and API testing system
class BackstageTestMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      frontend: { status: 'unknown', errors: [], warnings: [] },
      backend: { status: 'unknown', errors: [], warnings: [] },
      api: { status: 'unknown', errors: [], warnings: [] },
      catalog: { status: 'unknown', errors: [], warnings: [] },
      templates: { status: 'unknown', errors: [], warnings: [] },
      plugins: { status: 'unknown', errors: [], warnings: [] },
      console: { errors: [], warnings: [] },
      network: { errors: [], warnings: [] },
      performance: { metrics: {}, issues: [] }
    };
    
    this.frontendProcess = null;
    this.backendProcess = null;
    this.isRunning = false;
  }

  async startMonitoring() {
    console.log('🔍 Starting Comprehensive Backstage Monitoring System...\n');
    
    // Start application processes
    await this.startApplications();
    
    // Wait for startup
    await this.waitForStartup();
    
    // Run all tests
    await this.runAllTests();
    
    // Generate report
    await this.generateReport();
    
    // Cleanup
    await this.cleanup();
    
    return this.results;
  }

  async startApplications() {
    console.log('🚀 Starting Backstage applications...');
    
    // Start frontend
    this.frontendProcess = spawn('yarn', ['workspace', 'app', 'start'], {
      cwd: __dirname,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    this.frontendProcess.stdout.on('data', (data) => {
      this.processFrontendOutput(data.toString());
    });
    
    this.frontendProcess.stderr.on('data', (data) => {
      this.processFrontendError(data.toString());
    });
    
    // Try to start backend (may fail due to native deps)
    try {
      this.backendProcess = spawn('yarn', ['workspace', 'backend', 'start'], {
        cwd: __dirname,
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      this.backendProcess.stdout.on('data', (data) => {
        this.processBackendOutput(data.toString());
      });
      
      this.backendProcess.stderr.on('data', (data) => {
        this.processBackendError(data.toString());
      });
    } catch (error) {
      this.results.backend.status = 'failed';
      this.results.backend.errors.push(`Backend startup failed: ${error.message}`);
    }
    
    this.isRunning = true;
  }

  processFrontendOutput(output) {
    // Look for success indicators
    if (output.includes('webpack compiled successfully')) {
      this.results.frontend.status = 'running';
      console.log('✅ Frontend compiled successfully');
    }
    
    if (output.includes('Project is running at')) {
      console.log('✅ Frontend server started');
    }
    
    // Look for errors
    if (output.includes('ERROR') || output.includes('Failed to compile')) {
      this.results.frontend.errors.push(output);
    }
    
    // Look for warnings
    if (output.includes('WARNING') || output.includes('DeprecationWarning')) {
      this.results.frontend.warnings.push(output);
    }
  }

  processFrontendError(error) {
    console.log('⚠️  Frontend stderr:', error);
    this.results.frontend.errors.push(error);
  }

  processBackendOutput(output) {
    if (output.includes('Listening on') || output.includes('Backend is listening')) {
      this.results.backend.status = 'running';
      console.log('✅ Backend started successfully');
    }
    
    if (output.includes('ERROR')) {
      this.results.backend.errors.push(output);
    }
    
    if (output.includes('WARNING')) {
      this.results.backend.warnings.push(output);
    }
  }

  processBackendError(error) {
    console.log('⚠️  Backend stderr:', error);
    this.results.backend.errors.push(error);
    
    if (error.includes('isolated-vm') || error.includes('better-sqlite3')) {
      this.results.backend.status = 'native_deps_failed';
    }
  }

  async waitForStartup() {
    console.log('⏳ Waiting for application startup...');
    
    // Wait up to 45 seconds for startup
    for (let i = 0; i < 45; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if frontend is ready
      if (await this.checkPort(3000)) {
        console.log('✅ Frontend is responding');
        break;
      }
    }
    
    // Check if backend is ready
    if (await this.checkPort(7007)) {
      console.log('✅ Backend is responding');
    }
  }

  async checkPort(port) {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => resolve(false));
      req.end();
    });
  }

  async runAllTests() {
    console.log('\n🧪 Running Comprehensive Tests...\n');
    
    await this.testFrontendHealthy();
    await this.testAPIEndpoints();
    await this.testCatalogData();
    await this.testTemplates();
    await this.testPlugins();
    await this.testPerformance();
    await this.simulateUserInteractions();
  }

  async testFrontendHealthy() {
    console.log('🔍 Testing Frontend Health...');
    
    try {
      const response = await this.makeRequest('http://localhost:3000/');
      
      if (response.statusCode === 200) {
        this.results.frontend.status = 'healthy';
        console.log('✅ Frontend is healthy');
      } else {
        this.results.frontend.status = 'unhealthy';
        this.results.frontend.errors.push(`Frontend returned status ${response.statusCode}`);
      }
    } catch (error) {
      this.results.frontend.status = 'unreachable';
      this.results.frontend.errors.push(`Frontend unreachable: ${error.message}`);
    }
  }

  async testAPIEndpoints() {
    console.log('🔍 Testing API Endpoints...');
    
    const endpoints = [
      '/api/catalog/entities',
      '/api/catalog/entities/by-name/component/default/desktop-projects',
      '/api/catalog/locations',
      '/api/auth/providers',
      '/api/techdocs/static/docs'
    ];
    
    let workingEndpoints = 0;
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(`http://localhost:7007${endpoint}`);
        
        if (response.statusCode === 200) {
          workingEndpoints++;
          console.log(`✅ ${endpoint} - OK`);
        } else {
          console.log(`❌ ${endpoint} - Status ${response.statusCode}`);
          this.results.api.errors.push(`${endpoint} returned ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.message}`);
        this.results.api.errors.push(`${endpoint}: ${error.message}`);
      }
    }
    
    this.results.api.status = workingEndpoints > 0 ? 'partial' : 'failed';
    if (workingEndpoints === endpoints.length) {
      this.results.api.status = 'healthy';
    }
  }

  async testCatalogData() {
    console.log('🔍 Testing Catalog Data...');
    
    try {
      const response = await this.makeRequest('http://localhost:7007/api/catalog/entities');
      
      if (response.statusCode === 200) {
        const entities = JSON.parse(response.body);
        
        console.log(`✅ Catalog loaded ${entities.length} entities`);
        
        // Check for expected entities
        const components = entities.filter(e => e.kind === 'Component');
        const systems = entities.filter(e => e.kind === 'System');
        const templates = entities.filter(e => e.kind === 'Template');
        const resources = entities.filter(e => e.kind === 'Resource');
        
        console.log(`   Components: ${components.length}`);
        console.log(`   Systems: ${systems.length}`);
        console.log(`   Templates: ${templates.length}`);
        console.log(`   Resources: ${resources.length}`);
        
        // Check for personal entities
        const personalEntities = entities.filter(e => 
          e.spec && e.spec.owner === 'user:personal'
        );
        
        if (personalEntities.length > 0) {
          console.log(`✅ Found ${personalEntities.length} personal entities`);
          this.results.catalog.status = 'healthy';
        } else {
          console.log('⚠️  No personal entities found');
          this.results.catalog.warnings.push('No personal entities found in catalog');
          this.results.catalog.status = 'incomplete';
        }
      } else {
        this.results.catalog.status = 'failed';
        this.results.catalog.errors.push(`Catalog API returned ${response.statusCode}`);
      }
    } catch (error) {
      this.results.catalog.status = 'failed';
      this.results.catalog.errors.push(`Catalog test failed: ${error.message}`);
    }
  }

  async testTemplates() {
    console.log('🔍 Testing Templates...');
    
    try {
      const response = await this.makeRequest('http://localhost:7007/api/catalog/entities?filter=kind=template');
      
      if (response.statusCode === 200) {
        const templates = JSON.parse(response.body);
        
        if (templates.length > 0) {
          console.log(`✅ Found ${templates.length} templates`);
          this.results.templates.status = 'healthy';
          
          // Check specific templates
          const dataTemplates = templates.filter(t => 
            t.metadata.tags && t.metadata.tags.includes('data')
          );
          
          if (dataTemplates.length > 0) {
            console.log(`✅ Data templates available: ${dataTemplates.length}`);
          } else {
            this.results.templates.warnings.push('No data templates found');
          }
        } else {
          this.results.templates.status = 'empty';
          this.results.templates.warnings.push('No templates found');
        }
      } else {
        this.results.templates.status = 'failed';
        this.results.templates.errors.push(`Templates API returned ${response.statusCode}`);
      }
    } catch (error) {
      this.results.templates.status = 'failed';
      this.results.templates.errors.push(`Templates test failed: ${error.message}`);
    }
  }

  async testPlugins() {
    console.log('🔍 Testing Plugins...');
    
    const pluginTests = [
      { name: 'Catalog', path: '/catalog' },
      { name: 'API Docs', path: '/api-docs' },
      { name: 'TechDocs', path: '/docs' },
      { name: 'Create', path: '/create' },
      { name: 'Search', path: '/search' }
    ];
    
    let workingPlugins = 0;
    
    for (const plugin of pluginTests) {
      try {
        const response = await this.makeRequest(`http://localhost:3000${plugin.path}`);
        
        if (response.statusCode === 200) {
          workingPlugins++;
          console.log(`✅ ${plugin.name} plugin - OK`);
        } else {
          console.log(`❌ ${plugin.name} plugin - Status ${response.statusCode}`);
          this.results.plugins.errors.push(`${plugin.name} plugin returned ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${plugin.name} plugin - ${error.message}`);
        this.results.plugins.errors.push(`${plugin.name} plugin: ${error.message}`);
      }
    }
    
    this.results.plugins.status = workingPlugins > 0 ? 'partial' : 'failed';
    if (workingPlugins === pluginTests.length) {
      this.results.plugins.status = 'healthy';
    }
  }

  async testPerformance() {
    console.log('🔍 Testing Performance...');
    
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('http://localhost:3000/');
      const loadTime = Date.now() - startTime;
      
      this.results.performance.metrics.pageLoadTime = loadTime;
      
      if (loadTime < 2000) {
        console.log(`✅ Page load time: ${loadTime}ms (Good)`);
      } else if (loadTime < 5000) {
        console.log(`⚠️  Page load time: ${loadTime}ms (Slow)`);
        this.results.performance.issues.push(`Slow page load: ${loadTime}ms`);
      } else {
        console.log(`❌ Page load time: ${loadTime}ms (Very Slow)`);
        this.results.performance.issues.push(`Very slow page load: ${loadTime}ms`);
      }
    } catch (error) {
      this.results.performance.issues.push(`Performance test failed: ${error.message}`);
    }
  }

  async simulateUserInteractions() {
    console.log('🔍 Simulating User Interactions...');
    
    // Test key user flows
    const userFlows = [
      { name: 'Browse Catalog', path: '/catalog' },
      { name: 'View Components', path: '/catalog?filters%5Bkind%5D=component' },
      { name: 'View Systems', path: '/catalog?filters%5Bkind%5D=system' },
      { name: 'Create Menu', path: '/create' },
      { name: 'Search', path: '/search' }
    ];
    
    for (const flow of userFlows) {
      try {
        const response = await this.makeRequest(`http://localhost:3000${flow.path}`);
        
        if (response.statusCode === 200) {
          console.log(`✅ ${flow.name} - Accessible`);
        } else {
          console.log(`❌ ${flow.name} - Status ${response.statusCode}`);
          this.results.frontend.errors.push(`${flow.name} returned ${response.statusCode}`);
        }
      } catch (error) {
        console.log(`❌ ${flow.name} - ${error.message}`);
        this.results.frontend.errors.push(`${flow.name}: ${error.message}`);
      }
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const req = http.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BackstageTestMonitor/1.0'
        },
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async generateReport() {
    console.log('\n📊 Generating Comprehensive Report...\n');
    
    const report = this.generateTextReport();
    const jsonReport = JSON.stringify(this.results, null, 2);
    
    // Save reports
    fs.writeFileSync(path.join(__dirname, 'gui-test-report.txt'), report);
    fs.writeFileSync(path.join(__dirname, 'gui-test-results.json'), jsonReport);
    
    console.log(report);
    console.log(`\n📄 Reports saved:`);
    console.log(`   - gui-test-report.txt`);
    console.log(`   - gui-test-results.json`);
  }

  generateTextReport() {
    const timestamp = new Date().toISOString();
    
    return `
# Backstage GUI & API Automated Test Report
Generated: ${timestamp}

## 🚀 Application Status
Frontend: ${this.getStatusIcon(this.results.frontend.status)} ${this.results.frontend.status}
Backend: ${this.getStatusIcon(this.results.backend.status)} ${this.results.backend.status}
API: ${this.getStatusIcon(this.results.api.status)} ${this.results.api.status}

## 📊 Component Health
Catalog: ${this.getStatusIcon(this.results.catalog.status)} ${this.results.catalog.status}
Templates: ${this.getStatusIcon(this.results.templates.status)} ${this.results.templates.status}
Plugins: ${this.getStatusIcon(this.results.plugins.status)} ${this.results.plugins.status}

## 🐛 Issues Found
${this.formatIssues()}

## 📈 Performance Metrics
${this.formatPerformance()}

## 🔍 What These Results Mean
${this.interpretResults()}

## 🛠️ Recommended Actions
${this.generateRecommendations()}
`;
  }

  getStatusIcon(status) {
    const icons = {
      healthy: '✅',
      running: '✅',
      partial: '⚠️',
      incomplete: '⚠️',
      failed: '❌',
      unreachable: '❌',
      unknown: '❓',
      native_deps_failed: '🔧'
    };
    return icons[status] || '❓';
  }

  formatIssues() {
    let issues = [];
    
    Object.entries(this.results).forEach(([component, data]) => {
      if (data.errors && data.errors.length > 0) {
        issues.push(`${component.toUpperCase()} ERRORS:`);
        data.errors.forEach(error => issues.push(`  - ${error}`));
      }
      if (data.warnings && data.warnings.length > 0) {
        issues.push(`${component.toUpperCase()} WARNINGS:`);
        data.warnings.forEach(warning => issues.push(`  - ${warning}`));
      }
    });
    
    return issues.length > 0 ? issues.join('\n') : 'No critical issues detected';
  }

  formatPerformance() {
    const metrics = this.results.performance.metrics;
    let output = [];
    
    if (metrics.pageLoadTime) {
      output.push(`Page Load Time: ${metrics.pageLoadTime}ms`);
    }
    
    if (this.results.performance.issues.length > 0) {
      output.push('Performance Issues:');
      this.results.performance.issues.forEach(issue => {
        output.push(`  - ${issue}`);
      });
    }
    
    return output.length > 0 ? output.join('\n') : 'No performance data available';
  }

  interpretResults() {
    const interpretations = [];
    
    if (this.results.frontend.status === 'healthy') {
      interpretations.push('✅ Frontend is working correctly - you can browse the catalog and navigate the UI');
    }
    
    if (this.results.backend.status === 'native_deps_failed') {
      interpretations.push('🔧 Backend has native dependency issues - templates and scaffolding may not work');
    }
    
    if (this.results.catalog.status === 'healthy') {
      interpretations.push('✅ Catalog is loaded with your personal infrastructure data');
    }
    
    if (this.results.templates.status === 'healthy') {
      interpretations.push('✅ Templates are available for creating new records');
    }
    
    return interpretations.join('\n');
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.backend.status === 'native_deps_failed') {
      recommendations.push('🔧 Install build tools: Run `npm install -g node-gyp` and install Xcode command line tools');
    }
    
    if (this.results.api.status === 'failed') {
      recommendations.push('🚀 Use frontend-only mode: `yarn workspace app start` for basic functionality');
    }
    
    if (this.results.performance.issues.length > 0) {
      recommendations.push('⚡ Optimize performance: Consider using production builds or faster hardware');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : 'No specific recommendations at this time';
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.frontendProcess) {
      this.frontendProcess.kill();
    }
    
    if (this.backendProcess) {
      this.backendProcess.kill();
    }
    
    // Wait a moment for processes to terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Main execution
async function main() {
  const monitor = new BackstageTestMonitor();
  
  try {
    await monitor.startMonitoring();
    process.exit(0);
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    process.exit(1);
  }
}

// Allow running directly or importing
if (require.main === module) {
  main();
}

module.exports = BackstageTestMonitor;
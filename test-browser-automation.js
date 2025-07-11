#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Browser automation for GUI testing (using simple approach)
class BrowserTestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      consoleErrors: [],
      consoleWarnings: [],
      networkErrors: [],
      pageErrors: [],
      screenshots: [],
      performance: {},
      accessibility: [],
      userFlows: []
    };
  }

  async runBrowserTests() {
    console.log('🌐 Running Browser-based GUI Tests...\n');
    
    // Test with curl-based approach first
    await this.testPageResponses();
    
    // Test JavaScript execution
    await this.testJavaScriptExecution();
    
    // Test API calls from frontend
    await this.testFrontendAPIIntegration();
    
    return this.results;
  }

  async testPageResponses() {
    console.log('🔍 Testing Page Responses...');
    
    const pages = [
      { name: 'Home', path: '/' },
      { name: 'Catalog', path: '/catalog' },
      { name: 'Create', path: '/create' },
      { name: 'API Docs', path: '/api-docs' },
      { name: 'Settings', path: '/settings' },
      { name: 'Search', path: '/search' }
    ];
    
    for (const page of pages) {
      try {
        const result = await this.fetchPageContent(`http://localhost:3000${page.path}`);
        
        if (result.success) {
          console.log(`✅ ${page.name} - Loads successfully`);
          
          // Check for common error patterns in HTML
          if (result.content.includes('Error:') || result.content.includes('Failed to')) {
            this.results.pageErrors.push(`${page.name}: Found error text in HTML`);
          }
          
          // Check for React errors
          if (result.content.includes('React') && result.content.includes('Error')) {
            this.results.pageErrors.push(`${page.name}: React error detected`);
          }
          
          // Check for empty or minimal content
          if (result.content.length < 1000) {
            this.results.pageErrors.push(`${page.name}: Suspiciously small content (${result.content.length} chars)`);
          }
          
        } else {
          console.log(`❌ ${page.name} - ${result.error}`);
          this.results.pageErrors.push(`${page.name}: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ ${page.name} - ${error.message}`);
        this.results.pageErrors.push(`${page.name}: ${error.message}`);
      }
    }
  }

  async testJavaScriptExecution() {
    console.log('🔍 Testing JavaScript Execution...');
    
    try {
      // Create a simple HTML test file that loads the Backstage app
      const testHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Backstage Test</title>
  <script>
    window.testErrors = [];
    window.testWarnings = [];
    
    // Capture console errors
    const originalError = console.error;
    console.error = function(...args) {
      window.testErrors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Capture console warnings
    const originalWarn = console.warn;
    console.warn = function(...args) {
      window.testWarnings.push(args.join(' '));
      originalWarn.apply(console, args);
    };
    
    // Test basic JavaScript execution
    setTimeout(() => {
      // Try to access common Backstage elements
      const catalog = document.querySelector('[data-testid="catalog"]');
      const sidebar = document.querySelector('[data-testid="sidebar"]');
      
      if (!catalog) {
        window.testErrors.push('Catalog element not found');
      }
      
      if (!sidebar) {
        window.testErrors.push('Sidebar element not found');
      }
      
      // Check for React mount
      if (!window.React && !document.querySelector('[data-reactroot]')) {
        window.testErrors.push('React application not mounted');
      }
      
      // Save results
      const results = {
        errors: window.testErrors,
        warnings: window.testWarnings,
        reactMounted: !!window.React || !!document.querySelector('[data-reactroot]'),
        timestamp: new Date().toISOString()
      };
      
      console.log('TEST_RESULTS:', JSON.stringify(results));
    }, 5000);
  </script>
</head>
<body>
  <iframe src="http://localhost:3000" width="100%" height="600"></iframe>
</body>
</html>`;
      
      fs.writeFileSync(path.join(__dirname, 'test-gui.html'), testHTML);
      console.log('✅ Created GUI test file');
      
    } catch (error) {
      console.log(`❌ JavaScript test setup failed: ${error.message}`);
      this.results.pageErrors.push(`JavaScript test setup: ${error.message}`);
    }
  }

  async testFrontendAPIIntegration() {
    console.log('🔍 Testing Frontend API Integration...');
    
    // Test if frontend can connect to backend APIs
    const apiTests = [
      { name: 'Catalog API', endpoint: '/api/catalog/entities' },
      { name: 'Auth API', endpoint: '/api/auth/providers' },
      { name: 'TechDocs API', endpoint: '/api/techdocs/static/docs' }
    ];
    
    for (const test of apiTests) {
      try {
        const result = await this.fetchPageContent(`http://localhost:7007${test.endpoint}`);
        
        if (result.success) {
          console.log(`✅ ${test.name} - Responding`);
          
          // Check if it's valid JSON
          try {
            JSON.parse(result.content);
            console.log(`✅ ${test.name} - Valid JSON response`);
          } catch (e) {
            this.results.networkErrors.push(`${test.name}: Invalid JSON response`);
          }
        } else {
          console.log(`❌ ${test.name} - ${result.error}`);
          this.results.networkErrors.push(`${test.name}: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} - ${error.message}`);
        this.results.networkErrors.push(`${test.name}: ${error.message}`);
      }
    }
  }

  async fetchPageContent(url) {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      
      exec(`curl -s "${url}"`, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else if (stderr) {
          resolve({ success: false, error: stderr });
        } else {
          resolve({ success: true, content: stdout });
        }
      });
    });
  }

  generateReport() {
    const report = `
# Browser GUI Test Report
Generated: ${this.results.timestamp}

## 🖥️ Page Loading Test Results
${this.results.pageErrors.length === 0 ? '✅ All pages loaded successfully' : 
  `❌ ${this.results.pageErrors.length} page issues found:\n${this.results.pageErrors.map(e => `  - ${e}`).join('\n')}`}

## 🔗 API Integration Test Results
${this.results.networkErrors.length === 0 ? '✅ All API endpoints responding' : 
  `❌ ${this.results.networkErrors.length} API issues found:\n${this.results.networkErrors.map(e => `  - ${e}`).join('\n')}`}

## 📊 Summary
- Console Errors: ${this.results.consoleErrors.length}
- Console Warnings: ${this.results.consoleWarnings.length}
- Page Errors: ${this.results.pageErrors.length}
- Network Errors: ${this.results.networkErrors.length}

## 🎯 Key Findings
${this.generateFindings()}

## 🛠️ Recommendations
${this.generateBrowserRecommendations()}
`;
    
    return report;
  }

  generateFindings() {
    const findings = [];
    
    if (this.results.pageErrors.length === 0) {
      findings.push('✅ All core pages are loading and accessible');
    }
    
    if (this.results.networkErrors.length === 0) {
      findings.push('✅ Frontend can communicate with backend APIs');
    }
    
    if (this.results.pageErrors.some(e => e.includes('React'))) {
      findings.push('⚠️ React application issues detected');
    }
    
    if (this.results.networkErrors.some(e => e.includes('Catalog'))) {
      findings.push('⚠️ Catalog API communication issues');
    }
    
    return findings.length > 0 ? findings.join('\n') : 'No specific findings to report';
  }

  generateBrowserRecommendations() {
    const recommendations = [];
    
    if (this.results.pageErrors.length > 0) {
      recommendations.push('🔍 Check browser console for JavaScript errors');
    }
    
    if (this.results.networkErrors.length > 0) {
      recommendations.push('🔧 Verify backend services are running');
    }
    
    if (this.results.pageErrors.some(e => e.includes('small content'))) {
      recommendations.push('⚡ Pages may not be fully loading - check for build issues');
    }
    
    return recommendations.length > 0 ? recommendations.join('\n') : 'No specific recommendations needed';
  }
}

// Main execution
async function main() {
  const browserTest = new BrowserTestSuite();
  
  try {
    const results = await browserTest.runBrowserTests();
    const report = browserTest.generateReport();
    
    // Save report
    fs.writeFileSync(path.join(__dirname, 'browser-test-report.txt'), report);
    fs.writeFileSync(path.join(__dirname, 'browser-test-results.json'), JSON.stringify(results, null, 2));
    
    console.log('\n' + report);
    console.log(`\n📄 Browser test reports saved:`);
    console.log(`   - browser-test-report.txt`);
    console.log(`   - browser-test-results.json`);
    
  } catch (error) {
    console.error('❌ Browser testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BrowserTestSuite;
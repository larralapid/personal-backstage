#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test suite configuration
const testSuite = {
  'Configuration Tests': {
    script: 'test-config.js',
    description: 'Validates YAML syntax and Backstage entity structure'
  },
  'Catalog Relationship Tests': {
    script: 'test-catalog-simple.js',
    description: 'Tests entity relationships and template validation'
  },
  'Linting Tests': {
    command: 'yarn lint --since 7a1a061',
    description: 'Runs ESLint on changed files'
  },
  'Frontend Startup Test': {
    command: 'yarn workspace app start',
    description: 'Tests frontend application startup',
    timeout: 30000,
    successPattern: 'webpack compiled successfully'
  }
};

let overallResults = {
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  errors: []
};

function runScript(scriptName) {
  return new Promise((resolve) => {
    const child = spawn('node', [scriptName], {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: output,
        error: error
      });
    });
  });
}

function runCommand(command, options = {}) {
  return new Promise((resolve) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    let output = '';
    let error = '';
    let success = false;
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      if (options.successPattern && output.includes(options.successPattern)) {
        success = true;
      }
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({
        success: options.successPattern ? success : code === 0,
        output: output,
        error: error
      });
    });
    
    // Handle timeout for startup tests
    if (options.timeout) {
      setTimeout(() => {
        child.kill();
        resolve({
          success: success,
          output: output,
          error: error + '\n(Process terminated due to timeout)'
        });
      }, options.timeout);
    }
  });
}

function extractTestResults(output) {
  const lines = output.split('\n');
  let passed = 0;
  let failed = 0;
  
  lines.forEach(line => {
    if (line.startsWith('✅')) passed++;
    if (line.startsWith('❌')) failed++;
  });
  
  return { passed, failed };
}

async function runAllTests() {
  console.log('🧪 Running Complete Test Suite for Personal Backstage\n');
  console.log('='.repeat(60));
  
  const testResults = {};
  
  for (const [testName, testConfig] of Object.entries(testSuite)) {
    console.log(`\n🔍 ${testName}`);
    console.log(`📝 ${testConfig.description}`);
    console.log('-'.repeat(50));
    
    let result;
    
    if (testConfig.script) {
      result = await runScript(testConfig.script);
    } else if (testConfig.command) {
      result = await runCommand(testConfig.command, {
        timeout: testConfig.timeout,
        successPattern: testConfig.successPattern
      });
    }
    
    testResults[testName] = result;
    
    if (result.success) {
      console.log(`✅ ${testName} PASSED`);
      const details = extractTestResults(result.output);
      overallResults.passedTests += details.passed;
      overallResults.failedTests += details.failed;
      overallResults.totalTests += details.passed + details.failed;
    } else {
      console.log(`❌ ${testName} FAILED`);
      overallResults.failedTests += 1;
      overallResults.totalTests += 1;
      overallResults.errors.push({
        test: testName,
        error: result.error || 'Unknown error'
      });
    }
  }
  
  // Generate comprehensive report
  console.log('\n' + '=' * 60);
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(60));
  
  console.log(`\n📈 Overall Results:`);
  console.log(`   Total Tests: ${overallResults.totalTests}`);
  console.log(`   Passed: ${overallResults.passedTests}`);
  console.log(`   Failed: ${overallResults.failedTests}`);
  console.log(`   Success Rate: ${((overallResults.passedTests / overallResults.totalTests) * 100).toFixed(1)}%`);
  
  console.log(`\n📋 Test Suite Results:`);
  Object.entries(testResults).forEach(([testName, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`   ${status} ${testName}`);
  });
  
  if (overallResults.errors.length > 0) {
    console.log(`\n🐛 Errors Summary:`);
    overallResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.test}`);
      console.log(`      ${error.error.split('\n')[0]}`);
    });
  }
  
  console.log(`\n🔧 Recommendations:`);
  if (overallResults.failedTests === 0) {
    console.log('   ✅ All tests passed! Your Backstage setup is working correctly.');
    console.log('   🚀 You can now use your personal infrastructure hub.');
  } else {
    console.log('   ⚠️  Some tests failed. Review the errors above.');
    console.log('   🔍 Check the detailed output for specific issues.');
  }
  
  console.log(`\n📚 Next Steps:`);
  console.log('   1. Start your Backstage frontend: yarn workspace app start');
  console.log('   2. Visit http://localhost:3000 to access your hub');
  console.log('   3. Browse the catalog to see your personal infrastructure');
  console.log('   4. Use templates to create new data records and backlog items');
  
  // Write detailed report to file
  const reportPath = path.join(__dirname, 'test-report.md');
  const reportContent = generateMarkdownReport(testResults);
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  process.exit(overallResults.failedTests > 0 ? 1 : 0);
}

function generateMarkdownReport(testResults) {
  const timestamp = new Date().toISOString();
  
  return `# Personal Backstage Test Report

**Generated:** ${timestamp}

## Summary

- **Total Tests:** ${overallResults.totalTests}
- **Passed:** ${overallResults.passedTests}
- **Failed:** ${overallResults.failedTests}
- **Success Rate:** ${((overallResults.passedTests / overallResults.totalTests) * 100).toFixed(1)}%

## Test Suite Results

${Object.entries(testResults).map(([testName, result]) => {
  const status = result.success ? '✅ PASS' : '❌ FAIL';
  return `### ${testName}

**Status:** ${status}

**Description:** ${testSuite[testName].description}

${result.error ? `**Error:**\n\`\`\`\n${result.error}\n\`\`\`` : ''}
`;
}).join('\n')}

## Infrastructure Overview

Your personal Backstage instance includes:

### 🏗️ Systems Tracked
- Personal Infrastructure
- Data Management
- Workflow Management

### 📦 Components Tracked
- Desktop Projects
- Quartz Site
- TechPlug Solutions
- Voter Recon API
- Resume Generator
- Personal Workflows
- Daily Logging

### 📊 Data Management
- Active Data Templates (content you create)
- Passive Data Templates (automatically logged data)
- Data categorization and tracking

### 📝 Workflow Management
- Backlog item tracking
- Changelog management
- Task dependencies

## Usage Instructions

1. **Start the application:**
   \`\`\`bash
   cd personal-backstage
   yarn workspace app start
   \`\`\`

2. **Access your hub:** Visit [http://localhost:3000](http://localhost:3000)

3. **Browse catalog:** Explore your personal infrastructure components

4. **Create records:** Use templates to add new data records and backlog items

---

*Report generated by Personal Backstage Test Suite*
`;
}

runAllTests().catch(console.error);
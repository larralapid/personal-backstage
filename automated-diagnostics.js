#!/usr/bin/env node

const BackstageTestMonitor = require('./test-gui-automation');
const BrowserTestSuite = require('./test-browser-automation');
const fs = require('fs');
const path = require('path');

class AutomatedDiagnostics {
  constructor() {
    this.allResults = {
      timestamp: new Date().toISOString(),
      summary: {},
      gui: {},
      browser: {},
      recommendations: [],
      criticalIssues: [],
      status: 'unknown'
    };
  }

  async runCompleteDiagnostics() {
    console.log('🔬 Starting Complete Automated Diagnostics...\n');
    console.log('This will answer all your questions about GUI errors, API failures, and frontend issues.\n');
    
    try {
      // Run GUI monitoring
      console.log('🎯 Phase 1: GUI & API Monitoring...');
      const guiMonitor = new BackstageTestMonitor();
      this.allResults.gui = await guiMonitor.startMonitoring();
      
      // Run browser testing
      console.log('🎯 Phase 2: Browser & Frontend Testing...');
      const browserTest = new BrowserTestSuite();
      this.allResults.browser = await browserTest.runBrowserTests();
      
      // Analyze results
      console.log('🎯 Phase 3: Analysis & Recommendations...');
      this.analyzeResults();
      
      // Generate comprehensive report
      this.generateMasterReport();
      
      console.log('\n✅ Complete diagnostics finished!');
      return this.allResults;
      
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      this.allResults.status = 'failed';
      this.allResults.criticalIssues.push(`Diagnostics failure: ${error.message}`);
      return this.allResults;
    }
  }

  analyzeResults() {
    console.log('📊 Analyzing all test results...');
    
    // Analyze GUI results
    this.analyzeGUIResults();
    
    // Analyze browser results
    this.analyzeBrowserResults();
    
    // Determine overall status
    this.determineOverallStatus();
    
    // Generate actionable recommendations
    this.generateRecommendations();
    
    console.log('✅ Analysis complete');
  }

  analyzeGUIResults() {
    const gui = this.allResults.gui;
    
    // Frontend analysis
    if (gui.frontend?.status === 'healthy') {
      this.allResults.summary.frontend = '✅ Working';
    } else if (gui.frontend?.status === 'running') {
      this.allResults.summary.frontend = '⚠️ Running with issues';
    } else {
      this.allResults.summary.frontend = '❌ Not working';
      this.allResults.criticalIssues.push('Frontend is not accessible');
    }
    
    // Backend analysis
    if (gui.backend?.status === 'healthy') {
      this.allResults.summary.backend = '✅ Working';
    } else if (gui.backend?.status === 'native_deps_failed') {
      this.allResults.summary.backend = '🔧 Native deps failed';
    } else {
      this.allResults.summary.backend = '❌ Not working';
    }
    
    // Catalog analysis
    if (gui.catalog?.status === 'healthy') {
      this.allResults.summary.catalog = '✅ Working';
    } else {
      this.allResults.summary.catalog = '❌ Issues found';
      this.allResults.criticalIssues.push('Catalog has issues');
    }
    
    // API analysis
    if (gui.api?.status === 'healthy') {
      this.allResults.summary.api = '✅ Working';
    } else if (gui.api?.status === 'partial') {
      this.allResults.summary.api = '⚠️ Partial';
    } else {
      this.allResults.summary.api = '❌ Not working';
    }
  }

  analyzeBrowserResults() {
    const browser = this.allResults.browser;
    
    // Page loading analysis
    if (browser.pageErrors && browser.pageErrors.length > 0) {
      this.allResults.summary.pageLoading = '❌ Issues found';
      this.allResults.criticalIssues.push(`Page loading issues: ${browser.pageErrors.length} problems`);
    } else {
      this.allResults.summary.pageLoading = '✅ Working';
    }
    
    // Network analysis
    if (browser.networkErrors && browser.networkErrors.length > 0) {
      this.allResults.summary.networkCommunication = '❌ Issues found';
      this.allResults.criticalIssues.push(`Network issues: ${browser.networkErrors.length} problems`);
    } else {
      this.allResults.summary.networkCommunication = '✅ Working';
    }
  }

  determineOverallStatus() {
    const criticalCount = this.allResults.criticalIssues.length;
    
    if (criticalCount === 0) {
      this.allResults.status = 'healthy';
    } else if (criticalCount <= 2) {
      this.allResults.status = 'warning';
    } else {
      this.allResults.status = 'critical';
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Frontend recommendations
    if (this.allResults.summary.frontend === '❌ Not working') {
      recommendations.push({
        priority: 'high',
        category: 'Frontend',
        issue: 'Frontend is not accessible',
        solution: 'Run `yarn workspace app start` and check for compilation errors'
      });
    }
    
    // Backend recommendations
    if (this.allResults.summary.backend === '🔧 Native deps failed') {
      recommendations.push({
        priority: 'medium',
        category: 'Backend',
        issue: 'Native dependencies failed to build',
        solution: 'Install build tools: `npm install -g node-gyp` and Xcode command line tools'
      });
    }
    
    // Catalog recommendations
    if (this.allResults.summary.catalog === '❌ Issues found') {
      recommendations.push({
        priority: 'high',
        category: 'Catalog',
        issue: 'Catalog has loading issues',
        solution: 'Check YAML files in examples/ directory for syntax errors'
      });
    }
    
    // API recommendations
    if (this.allResults.summary.api === '❌ Not working') {
      recommendations.push({
        priority: 'high',
        category: 'API',
        issue: 'Backend API is not responding',
        solution: 'Start backend with `yarn workspace backend start` or use frontend-only mode'
      });
    }
    
    // Page loading recommendations
    if (this.allResults.summary.pageLoading === '❌ Issues found') {
      recommendations.push({
        priority: 'medium',
        category: 'Frontend',
        issue: 'Pages not loading properly',
        solution: 'Check browser console for JavaScript errors and verify build process'
      });
    }
    
    this.allResults.recommendations = recommendations;
  }

  generateMasterReport() {
    const report = `
# 🔬 Automated Backstage Diagnostics Report
Generated: ${this.allResults.timestamp}

## 📊 Executive Summary
Overall Status: ${this.getStatusIcon(this.allResults.status)} ${this.allResults.status.toUpperCase()}
Critical Issues: ${this.allResults.criticalIssues.length}
Recommendations: ${this.allResults.recommendations.length}

## 🎯 Component Status Overview
Frontend: ${this.allResults.summary.frontend}
Backend: ${this.allResults.summary.backend}
Catalog: ${this.allResults.summary.catalog}
API: ${this.allResults.summary.api}
Page Loading: ${this.allResults.summary.pageLoading}
Network: ${this.allResults.summary.networkCommunication}

## 🚨 Critical Issues Found
${this.allResults.criticalIssues.length > 0 ? 
  this.allResults.criticalIssues.map(issue => `❌ ${issue}`).join('\n') : 
  '✅ No critical issues detected'}

## 🛠️ Prioritized Recommendations
${this.formatRecommendations()}

## 🔍 Detailed Analysis

### Frontend Status
${this.analyzeFrontendDetails()}

### Backend Status
${this.analyzeBackendDetails()}

### User Experience Impact
${this.analyzeUserExperience()}

## 📋 Action Plan
${this.generateActionPlan()}

## 🎯 What This Means for You
${this.generateUserGuidance()}

---
*This report was generated automatically and covers all aspects of your Backstage GUI and API functionality.*
`;
    
    // Save comprehensive report
    fs.writeFileSync(path.join(__dirname, 'automated-diagnostics-report.md'), report);
    fs.writeFileSync(path.join(__dirname, 'automated-diagnostics-results.json'), JSON.stringify(this.allResults, null, 2));
    
    console.log('\n' + report);
    console.log(`\n📄 Comprehensive diagnostics reports saved:`);
    console.log(`   - automated-diagnostics-report.md`);
    console.log(`   - automated-diagnostics-results.json`);
  }

  getStatusIcon(status) {
    const icons = {
      healthy: '✅',
      warning: '⚠️',
      critical: '❌',
      unknown: '❓'
    };
    return icons[status] || '❓';
  }

  formatRecommendations() {
    if (this.allResults.recommendations.length === 0) {
      return '✅ No specific recommendations needed - system is working well';
    }
    
    const byPriority = {
      high: this.allResults.recommendations.filter(r => r.priority === 'high'),
      medium: this.allResults.recommendations.filter(r => r.priority === 'medium'),
      low: this.allResults.recommendations.filter(r => r.priority === 'low')
    };
    
    let output = [];
    
    if (byPriority.high.length > 0) {
      output.push('### 🔴 HIGH PRIORITY');
      byPriority.high.forEach((rec, index) => {
        output.push(`${index + 1}. **${rec.category}**: ${rec.issue}`);
        output.push(`   Solution: ${rec.solution}`);
      });
    }
    
    if (byPriority.medium.length > 0) {
      output.push('### 🟡 MEDIUM PRIORITY');
      byPriority.medium.forEach((rec, index) => {
        output.push(`${index + 1}. **${rec.category}**: ${rec.issue}`);
        output.push(`   Solution: ${rec.solution}`);
      });
    }
    
    if (byPriority.low.length > 0) {
      output.push('### 🟢 LOW PRIORITY');
      byPriority.low.forEach((rec, index) => {
        output.push(`${index + 1}. **${rec.category}**: ${rec.issue}`);
        output.push(`   Solution: ${rec.solution}`);
      });
    }
    
    return output.join('\n');
  }

  analyzeFrontendDetails() {
    const frontend = this.allResults.gui.frontend;
    
    if (frontend?.status === 'healthy') {
      return '✅ Frontend is fully functional and accessible at http://localhost:3000';
    } else if (frontend?.errors && frontend.errors.length > 0) {
      return `❌ Frontend has ${frontend.errors.length} errors preventing normal operation`;
    } else {
      return '❓ Frontend status could not be determined';
    }
  }

  analyzeBackendDetails() {
    const backend = this.allResults.gui.backend;
    
    if (backend?.status === 'healthy') {
      return '✅ Backend is fully operational with all plugins working';
    } else if (backend?.status === 'native_deps_failed') {
      return '🔧 Backend has native dependency issues but core functionality may work';
    } else {
      return '❌ Backend is not responding or has critical issues';
    }
  }

  analyzeUserExperience() {
    const impacts = [];
    
    if (this.allResults.summary.frontend === '✅ Working') {
      impacts.push('✅ You can browse the catalog and navigate the UI');
    }
    
    if (this.allResults.summary.catalog === '✅ Working') {
      impacts.push('✅ Your personal infrastructure data is visible');
    }
    
    if (this.allResults.summary.backend === '🔧 Native deps failed') {
      impacts.push('⚠️ Template creation and scaffolding may not work');
    }
    
    if (this.allResults.summary.api === '❌ Not working') {
      impacts.push('❌ Limited functionality - only static content available');
    }
    
    return impacts.length > 0 ? impacts.join('\n') : 'Impact assessment unavailable';
  }

  generateActionPlan() {
    const plan = [];
    
    if (this.allResults.status === 'critical') {
      plan.push('🚨 IMMEDIATE ACTION REQUIRED');
      plan.push('1. Address all HIGH PRIORITY recommendations first');
      plan.push('2. Restart application components as needed');
      plan.push('3. Re-run diagnostics to verify fixes');
    } else if (this.allResults.status === 'warning') {
      plan.push('⚠️ ATTENTION RECOMMENDED');
      plan.push('1. Review and address HIGH PRIORITY items');
      plan.push('2. Consider addressing MEDIUM PRIORITY items');
      plan.push('3. Monitor for any new issues');
    } else {
      plan.push('✅ SYSTEM IS HEALTHY');
      plan.push('1. Continue normal usage');
      plan.push('2. Run periodic diagnostics');
      plan.push('3. Address any MEDIUM/LOW priority items when convenient');
    }
    
    return plan.join('\n');
  }

  generateUserGuidance() {
    const guidance = [];
    
    if (this.allResults.summary.frontend === '✅ Working') {
      guidance.push('🎯 Your Backstage frontend is working - you can use it to browse your personal infrastructure');
    }
    
    if (this.allResults.summary.backend === '🔧 Native deps failed') {
      guidance.push('💡 While some backend features are limited, you can still use the catalog and basic functionality');
    }
    
    if (this.allResults.recommendations.length > 0) {
      guidance.push('🔧 Follow the recommendations above to improve functionality');
    }
    
    guidance.push('📊 Re-run this diagnostic anytime with: `node automated-diagnostics.js`');
    
    return guidance.join('\n');
  }
}

// Main execution
async function main() {
  const diagnostics = new AutomatedDiagnostics();
  
  try {
    await diagnostics.runCompleteDiagnostics();
    process.exit(0);
  } catch (error) {
    console.error('❌ Automated diagnostics failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutomatedDiagnostics;
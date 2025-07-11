#!/usr/bin/env node

// Sprint planning automation
const { execSync } = require('child_process');

function planSprint() {
  console.log('🎯 Sprint Planning');
  console.log('==================');
  
  // Get critical issues
  try {
    const issues = execSync('gh issue list --repo larralapid/personal-backstage --state open --json number,title,labels', { encoding: 'utf8' });
    const issueData = JSON.parse(issues);
    
    const criticalIssues = issueData.filter(issue => 
      issue.labels.some(label => label.name.includes('critical'))
    );
    
    console.log('🔴 Critical Issues for Sprint:');
    criticalIssues.forEach(issue => {
      console.log(`   #${issue.number}: ${issue.title}`);
    });
    
    console.log('');
    console.log('📊 Sprint Capacity:');
    console.log('   Estimated Story Points: 20-25');
    console.log('   Sprint Duration: 1-2 weeks');
    console.log('   Focus: Backend stability and core functionality');
    
  } catch (error) {
    console.log('Error planning sprint:', error.message);
  }
}

planSprint();

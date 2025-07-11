#!/usr/bin/env node

// Daily standup automation
const { execSync } = require('child_process');

function generateStandupReport() {
  console.log('📋 Daily Standup Report');
  console.log('========================');
  console.log('Date:', new Date().toDateString());
  console.log('');
  
  // Get issues in progress
  try {
    const issues = execSync('gh issue list --repo larralapid/personal-backstage --state open --json number,title,assignees,labels', { encoding: 'utf8' });
    const issueData = JSON.parse(issues);
    
    console.log('🔄 In Progress:');
    issueData.filter(issue => issue.assignees.length > 0).forEach(issue => {
      console.log(`   #${issue.number}: ${issue.title}`);
    });
    
    console.log('');
    console.log('📋 Next Up:');
    issueData.filter(issue => issue.assignees.length === 0).slice(0, 3).forEach(issue => {
      console.log(`   #${issue.number}: ${issue.title}`);
    });
    
    console.log('');
    console.log('🚧 Blockers:');
    issueData.filter(issue => issue.labels.some(label => label.name === 'blocked')).forEach(issue => {
      console.log(`   #${issue.number}: ${issue.title}`);
    });
    
  } catch (error) {
    console.log('Error generating report:', error.message);
  }
}

generateStandupReport();

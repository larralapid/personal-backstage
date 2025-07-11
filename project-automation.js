#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Project automation and workflow management
class ProjectAutomation {
  constructor() {
    this.projectId = 16;
    this.owner = "@me";
    this.repoName = "larralapid/personal-backstage";
  }

  async setupAutomation() {
    console.log('⚙️  Setting up project automation...\n');
    
    // Generate workflow templates
    this.generateWorkflowTemplates();
    
    // Create automation scripts
    this.createAutomationScripts();
    
    // Generate project insights
    this.generateProjectInsights();
    
    console.log('\n✅ Project automation setup complete!');
  }

  generateWorkflowTemplates() {
    console.log('📋 Generating workflow templates...');
    
    const workflowTemplate = `# GitHub Actions Workflow for Project Automation

name: Project Automation

on:
  issues:
    types: [opened, edited, closed, reopened]
  pull_request:
    types: [opened, closed, merged]
  project_card:
    types: [created, moved]

jobs:
  update-project:
    runs-on: ubuntu-latest
    steps:
      - name: Add to Project
        uses: actions/add-to-project@v0.4.0
        with:
          project-url: https://github.com/users/larralapid/projects/16
          github-token: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Auto-assign Priority
        run: echo "Auto-assigning priority based on labels"
      
      - name: Auto-assign Phase
        run: echo "Auto-assigning phase based on issue content"
`;

    fs.writeFileSync('.github/workflows/project-automation.yml', workflowTemplate);
    console.log('✅ Created GitHub Actions workflow template');
  }

  createAutomationScripts() {
    console.log('🔧 Creating automation scripts...');
    
    // Daily standup report
    const standupScript = `#!/usr/bin/env node

// Daily standup automation
const { execSync } = require('child_process');

function generateStandupReport() {
  console.log('📋 Daily Standup Report');
  console.log('========================');
  console.log('Date:', new Date().toDateString());
  console.log('');
  
  // Get issues in progress
  try {
    const issues = execSync('gh issue list --repo ${this.repoName} --state open --json number,title,assignees,labels', { encoding: 'utf8' });
    const issueData = JSON.parse(issues);
    
    console.log('🔄 In Progress:');
    issueData.filter(issue => issue.assignees.length > 0).forEach(issue => {
      console.log(\`   #\${issue.number}: \${issue.title}\`);
    });
    
    console.log('');
    console.log('📋 Next Up:');
    issueData.filter(issue => issue.assignees.length === 0).slice(0, 3).forEach(issue => {
      console.log(\`   #\${issue.number}: \${issue.title}\`);
    });
    
    console.log('');
    console.log('🚧 Blockers:');
    issueData.filter(issue => issue.labels.some(label => label.name === 'blocked')).forEach(issue => {
      console.log(\`   #\${issue.number}: \${issue.title}\`);
    });
    
  } catch (error) {
    console.log('Error generating report:', error.message);
  }
}

generateStandupReport();
`;

    fs.writeFileSync('scripts/daily-standup.js', standupScript);
    
    // Sprint planning script
    const sprintScript = `#!/usr/bin/env node

// Sprint planning automation
const { execSync } = require('child_process');

function planSprint() {
  console.log('🎯 Sprint Planning');
  console.log('==================');
  
  // Get critical issues
  try {
    const issues = execSync('gh issue list --repo ${this.repoName} --state open --json number,title,labels', { encoding: 'utf8' });
    const issueData = JSON.parse(issues);
    
    const criticalIssues = issueData.filter(issue => 
      issue.labels.some(label => label.name.includes('critical'))
    );
    
    console.log('🔴 Critical Issues for Sprint:');
    criticalIssues.forEach(issue => {
      console.log(\`   #\${issue.number}: \${issue.title}\`);
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
`;

    fs.writeFileSync('scripts/sprint-planning.js', sprintScript);
    
    // Create scripts directory if it doesn't exist
    if (!fs.existsSync('scripts')) {
      fs.mkdirSync('scripts');
    }
    
    console.log('✅ Created automation scripts in scripts/ directory');
  }

  generateProjectInsights() {
    console.log('📊 Generating project insights...');
    
    const insights = {
      totalIssues: 10,
      criticalIssues: 5,
      totalStoryPoints: 80,
      avgStoryPoints: 8,
      phaseDistribution: {
        'Phase 1': 7,
        'Phase 2': 1,
        'Phase 3': 1,
        'Phase 4': 1
      },
      priorityDistribution: {
        'Critical': 5,
        'High': 3,
        'Medium': 1,
        'Low': 1
      },
      estimatedDuration: '2-3 weeks',
      riskFactors: [
        'Native dependency build failures',
        'Backend API connectivity issues',
        'Frontend routing problems'
      ],
      recommendations: [
        'Focus on Phase 1 critical issues first',
        'Consider Docker alternative for dependency issues',
        'Set up automated testing for backend APIs',
        'Implement monitoring for frontend routing'
      ]
    };
    
    fs.writeFileSync('PROJECT_INSIGHTS.json', JSON.stringify(insights, null, 2));
    
    // Generate insights markdown
    const insightsMarkdown = `# Project Insights Dashboard

## 📊 Key Metrics
- **Total Issues**: ${insights.totalIssues}
- **Critical Issues**: ${insights.criticalIssues}
- **Total Story Points**: ${insights.totalStoryPoints}
- **Average Story Points**: ${insights.avgStoryPoints}
- **Estimated Duration**: ${insights.estimatedDuration}

## 📅 Phase Distribution
${Object.entries(insights.phaseDistribution).map(([phase, count]) => 
  `- **${phase}**: ${count} issues`
).join('\n')}

## 🎯 Priority Distribution
${Object.entries(insights.priorityDistribution).map(([priority, count]) => 
  `- **${priority}**: ${count} issues`
).join('\n')}

## ⚠️ Risk Factors
${insights.riskFactors.map(risk => `- ${risk}`).join('\n')}

## 🎯 Recommendations
${insights.recommendations.map(rec => `- ${rec}`).join('\n')}

## 📈 Progress Tracking
- [ ] Phase 1: Core Backend (0/7 complete)
- [ ] Phase 2: Frontend Polish (0/1 complete)  
- [ ] Phase 3: Advanced Features (0/1 complete)
- [ ] Phase 4: Production (0/1 complete)

## 🔄 Next Actions
1. Start with Issue #8 (Install build tools)
2. Then tackle Issue #2 (Fix native dependencies)
3. Move to Issue #1 (Backend API issues)
4. Address Issue #3 (Frontend routing)
5. Complete Issue #10 (Catalog validation)

---
*Generated: ${new Date().toISOString()}*
`;

    fs.writeFileSync('PROJECT_INSIGHTS.md', insightsMarkdown);
    console.log('✅ Generated project insights and dashboard');
  }
}

// Utility functions for project management
class ProjectUtils {
  static async getIssueStats() {
    try {
      const issues = execSync('gh issue list --repo larralapid/personal-backstage --state all --json number,title,state,labels', { encoding: 'utf8' });
      const issueData = JSON.parse(issues);
      
      return {
        total: issueData.length,
        open: issueData.filter(i => i.state === 'open').length,
        closed: issueData.filter(i => i.state === 'closed').length,
        bugs: issueData.filter(i => i.labels.some(l => l.name === 'bug')).length
      };
    } catch (error) {
      console.log('Error getting issue stats:', error.message);
      return null;
    }
  }
  
  static async createWeeklyReport() {
    console.log('📋 Weekly Project Report');
    console.log('========================');
    
    const stats = await this.getIssueStats();
    if (stats) {
      console.log('📊 Issue Statistics:');
      console.log('   Total: ' + stats.total);
      console.log('   Open: ' + stats.open);
      console.log('   Closed: ' + stats.closed);
      console.log('   Bugs: ' + stats.bugs);
    }
    
    console.log('');
    console.log('🎯 This Week Focus:');
    console.log('   - Resolve critical backend issues');
    console.log('   - Fix native dependency problems');
    console.log('   - Test catalog functionality');
    
    console.log('');
    console.log('📅 Next Week Goals:');
    console.log('   - Complete Phase 1 backend work');
    console.log('   - Begin frontend polish tasks');
    console.log('   - Set up monitoring and testing');
  }
}

// Main execution
async function main() {
  const automation = new ProjectAutomation();
  await automation.setupAutomation();
  
  console.log('');
  console.log('🎯 Available Commands:');
  console.log('   node scripts/daily-standup.js    - Generate daily standup report');
  console.log('   node scripts/sprint-planning.js  - Plan next sprint');
  console.log('   node project-automation.js       - Run full automation setup');
  
  console.log('');
  console.log('📋 Project Management URLs:');
  console.log('   Project Board: https://github.com/users/larralapid/projects/16');
  console.log('   Repository: https://github.com/larralapid/personal-backstage');
  console.log('   Issues: https://github.com/larralapid/personal-backstage/issues');
}

if (require.main === module) {
  main();
}

module.exports = { ProjectAutomation, ProjectUtils };
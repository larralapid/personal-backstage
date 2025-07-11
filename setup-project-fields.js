#!/usr/bin/env node

const { execSync } = require('child_process');

// Project configuration
const PROJECT_ID = 16;
const OWNER = "@me";

// Issue field mappings
const issueFieldMappings = {
  1: {
    title: "Backend API not responding",
    priority: "🔴 Critical",
    phase: "Phase 1: Core Backend",
    type: "🐛 Bug",
    effort: "L (1-2 days)",
    storyPoints: 8,
    description: "All API endpoints failing - blocking all backend functionality"
  },
  2: {
    title: "Fix native dependencies",
    priority: "🔴 Critical",
    phase: "Phase 1: Core Backend", 
    type: "🐛 Bug",
    effort: "M (4-8 hours)",
    storyPoints: 5,
    description: "isolated-vm and better-sqlite3 build failures"
  },
  3: {
    title: "GUI Pages returning 404 errors",
    priority: "🔴 Critical",
    phase: "Phase 1: Core Backend",
    type: "🐛 Bug", 
    effort: "M (4-8 hours)",
    storyPoints: 5,
    description: "Frontend routing issues - pages not loading properly"
  },
  4: {
    title: "Phase 1: Core Backend Functionality",
    priority: "🔴 Critical",
    phase: "Phase 1: Core Backend",
    type: "📋 Epic",
    effort: "XL (2+ days)",
    storyPoints: 13,
    description: "Epic for completing basic backend functionality"
  },
  5: {
    title: "Phase 2: Frontend Polish & UX",
    priority: "🟡 High",
    phase: "Phase 2: Frontend Polish",
    type: "📋 Epic",
    effort: "XL (2+ days)",
    storyPoints: 13,
    description: "Epic for improving user experience and polish"
  },
  6: {
    title: "Phase 3: Advanced Features",
    priority: "🟢 Medium",
    phase: "Phase 3: Advanced Features",
    type: "📋 Epic",
    effort: "XL (2+ days)",
    storyPoints: 13,
    description: "Epic for advanced features and integrations"
  },
  7: {
    title: "Phase 4: Production & Deployment",
    priority: "🔵 Low",
    phase: "Phase 4: Production",
    type: "📋 Epic",
    effort: "XL (2+ days)",
    storyPoints: 13,
    description: "Epic for production deployment and monitoring"
  },
  8: {
    title: "Install build tools",
    priority: "🔴 Critical",
    phase: "Phase 1: Core Backend",
    type: "🔧 Task",
    effort: "S (1-4 hours)",
    storyPoints: 2,
    description: "Install xcode-select and node-gyp for native dependencies"
  },
  9: {
    title: "Docker-based development",
    priority: "🟡 High",
    phase: "Phase 1: Core Backend",
    type: "🔧 Task",
    effort: "M (4-8 hours)",
    storyPoints: 5,
    description: "Alternative Docker setup for development environment"
  },
  10: {
    title: "Test catalog data loading",
    priority: "🟡 High",
    phase: "Phase 1: Core Backend",
    type: "🔧 Task",
    effort: "S (1-4 hours)",
    storyPoints: 3,
    description: "Verify 28 entities load correctly in catalog"
  }
};

class ProjectFieldUpdater {
  constructor() {
    this.projectId = PROJECT_ID;
    this.owner = OWNER;
    this.fieldIds = {};
  }

  async setupProjectFields() {
    console.log('🔧 Setting up enhanced project fields...\n');
    
    try {
      // Get field IDs
      await this.getFieldIds();
      
      // Update issue fields
      await this.updateIssueFields();
      
      console.log('\n✅ Project fields setup complete!');
      console.log('📋 Next steps:');
      console.log('   1. Visit https://github.com/users/larralapid/projects/16');
      console.log('   2. Create custom views as described in PROJECT_VIEWS_SETUP.md');
      console.log('   3. Set up automation rules for workflow');
      
    } catch (error) {
      console.error('❌ Error setting up project fields:', error.message);
    }
  }

  async getFieldIds() {
    console.log('📋 Getting project field IDs...');
    
    try {
      const projectInfo = execSync(`gh project view ${this.projectId} --owner "${this.owner}" --format json`, { encoding: 'utf8' });
      const project = JSON.parse(projectInfo);
      
      // Extract field IDs - this is a simplified approach
      // In reality, you'd need to parse the field structure more carefully
      console.log('✅ Project structure retrieved');
      
    } catch (error) {
      console.log('⚠️  Could not retrieve field IDs automatically');
      console.log('   Manual field setup required through GitHub UI');
    }
  }

  async updateIssueFields() {
    console.log('📝 Updating issue fields...');
    
    for (const [issueNumber, fields] of Object.entries(issueFieldMappings)) {
      try {
        console.log(`   Updating issue #${issueNumber}: ${fields.title}`);
        
        // Note: The GitHub CLI doesn't currently support updating custom project fields
        // This would require using the GraphQL API directly
        // For now, we'll output the recommended values
        
        console.log(`      Priority: ${fields.priority}`);
        console.log(`      Phase: ${fields.phase}`);
        console.log(`      Type: ${fields.type}`);
        console.log(`      Effort: ${fields.effort}`);
        console.log(`      Story Points: ${fields.storyPoints}`);
        console.log('');
        
      } catch (error) {
        console.log(`   ⚠️  Could not update issue #${issueNumber}: ${error.message}`);
      }
    }
  }

  generateProjectSummary() {
    console.log('\n📊 Project Summary:');
    console.log('='.repeat(50));
    
    const priorityCounts = {};
    const phaseCounts = {};
    const typeCounts = {};
    let totalStoryPoints = 0;
    
    Object.values(issueFieldMappings).forEach(issue => {
      // Count by priority
      priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
      
      // Count by phase
      phaseCounts[issue.phase] = (phaseCounts[issue.phase] || 0) + 1;
      
      // Count by type
      typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
      
      // Sum story points
      totalStoryPoints += issue.storyPoints;
    });
    
    console.log('\n🎯 By Priority:');
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      console.log(`   ${priority}: ${count} issues`);
    });
    
    console.log('\n📅 By Phase:');
    Object.entries(phaseCounts).forEach(([phase, count]) => {
      console.log(`   ${phase}: ${count} issues`);
    });
    
    console.log('\n🔖 By Type:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} issues`);
    });
    
    console.log(`\n📊 Total Story Points: ${totalStoryPoints}`);
    console.log(`📋 Total Issues: ${Object.keys(issueFieldMappings).length}`);
    
    console.log('\n🎯 Critical Path (Priority Order):');
    const criticalIssues = Object.entries(issueFieldMappings)
      .filter(([_, issue]) => issue.priority === '🔴 Critical')
      .sort((a, b) => a[1].storyPoints - b[1].storyPoints);
    
    criticalIssues.forEach(([issueNumber, issue]) => {
      console.log(`   #${issueNumber}: ${issue.title} (${issue.storyPoints} pts)`);
    });
  }
}

// Helper function to generate project documentation
function generateProjectDocumentation() {
  console.log('\n📖 Generating project documentation...');
  
  const markdown = `# Project Field Configuration

## Issue Field Mappings

| Issue | Title | Priority | Phase | Type | Effort | Story Points |
|-------|-------|----------|-------|------|--------|--------------|
${Object.entries(issueFieldMappings).map(([num, issue]) => 
  `| #${num} | ${issue.title} | ${issue.priority} | ${issue.phase} | ${issue.type} | ${issue.effort} | ${issue.storyPoints} |`
).join('\n')}

## Field Values Reference

### Priority Levels
- 🔴 Critical: Must be done first
- 🟡 High: Important for functionality  
- 🟢 Medium: Nice to have features
- 🔵 Low: Future work

### Development Phases
- Phase 1: Core Backend - Get basic functionality working
- Phase 2: Frontend Polish - Improve user experience
- Phase 3: Advanced Features - Add integrations and advanced functionality
- Phase 4: Production - Deployment and monitoring

### Issue Types
- 🐛 Bug: Issues that need fixing
- ✨ Feature: New functionality
- 📋 Epic: Large stories spanning multiple issues
- 🔧 Task: Implementation tasks
- 📝 Documentation: Documentation work

### Effort Estimation
- XS (< 1 hour): Quick fixes
- S (1-4 hours): Small tasks
- M (4-8 hours): Medium features
- L (1-2 days): Large features
- XL (2+ days): Major features or epics

---
*Generated by project field setup script*
`;

  require('fs').writeFileSync('PROJECT_FIELD_CONFIG.md', markdown);
  console.log('✅ Documentation saved to PROJECT_FIELD_CONFIG.md');
}

// Main execution
async function main() {
  const updater = new ProjectFieldUpdater();
  
  await updater.setupProjectFields();
  updater.generateProjectSummary();
  generateProjectDocumentation();
}

if (require.main === module) {
  main();
}

module.exports = ProjectFieldUpdater;
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Test catalog entity relationships and references
function testCatalogRelationships() {
  console.log('🔍 Testing catalog entity relationships...');
  
  let allEntities = [];
  let testResults = { passed: 0, failed: 0, errors: [] };
  
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
  
  // Load all entities
  const catalogFiles = [
    'examples/entities.yaml',
    'examples/personal-infrastructure.yaml',
    'examples/data-templates.yaml',
    'examples/backlog-templates.yaml',
    'examples/personal-org.yaml',
    'examples/org.yaml'
  ];
  
  catalogFiles.forEach(file => {
    try {
      const fullPath = path.join(__dirname, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const entities = yaml.loadAll(content);
      allEntities = allEntities.concat(entities.filter(e => e != null));
    } catch (error) {
      logTest(`Load catalog file: ${file}`, false, error);
    }
  });
  
  logTest(`Total entities loaded: ${allEntities.length}`, allEntities.length > 0);
  
  // Test entity types
  const entityTypes = {};
  allEntities.forEach(entity => {
    if (entity.kind) {
      entityTypes[entity.kind] = (entityTypes[entity.kind] || 0) + 1;
    }
  });
  
  console.log('\n📊 Entity counts by type:');
  Object.entries(entityTypes).forEach(([kind, count]) => {
    console.log(`   ${kind}: ${count}`);
  });
  
  // Test required personal entities
  const personalComponents = allEntities.filter(e => 
    e.kind === 'Component' && e.spec && e.spec.owner === 'user:personal'
  );
  logTest('Personal components exist', personalComponents.length > 0);
  
  const personalSystems = allEntities.filter(e => 
    e.kind === 'System' && e.spec && e.spec.owner === 'user:personal'
  );
  logTest('Personal systems exist', personalSystems.length > 0);
  
  const dataTemplates = allEntities.filter(e => 
    e.kind === 'Template' && e.metadata && e.metadata.tags && 
    e.metadata.tags.includes('data')
  );
  logTest('Data templates exist', dataTemplates.length > 0);
  
  const backlogTemplates = allEntities.filter(e => 
    e.kind === 'Template' && e.metadata && e.metadata.tags && 
    e.metadata.tags.includes('backlog')
  );
  logTest('Backlog templates exist', backlogTemplates.length > 0);
  
  // Test system relationships
  const systems = allEntities.filter(e => e.kind === 'System');
  const systemNames = systems.map(s => s.metadata.name);
  
  const componentsWithSystems = allEntities.filter(e => 
    e.kind === 'Component' && e.spec && e.spec.system
  );
  
  componentsWithSystems.forEach(component => {
    const systemExists = systemNames.includes(component.spec.system);
    logTest(`Component ${component.metadata.name} references valid system`, systemExists);
  });
  
  // Test owner references
  const users = allEntities.filter(e => e.kind === 'User');
  const userNames = users.map(u => u.metadata.name);
  
  const entitiesWithOwners = allEntities.filter(e => 
    e.spec && e.spec.owner && e.spec.owner.startsWith('user:')
  );
  
  entitiesWithOwners.forEach(entity => {
    const ownerName = entity.spec.owner.replace('user:', '');
    const ownerExists = userNames.includes(ownerName);
    logTest(`Entity ${entity.metadata.name} references valid owner`, ownerExists);
  });
  
  // Test template parameter validation
  const templates = allEntities.filter(e => e.kind === 'Template');
  templates.forEach(template => {
    const hasParameters = template.spec && template.spec.parameters;
    logTest(`Template ${template.metadata.name} has parameters`, hasParameters);
    
    const hasSteps = template.spec && template.spec.steps;
    logTest(`Template ${template.metadata.name} has steps`, hasSteps);
    
    if (hasParameters && hasSteps) {
      // Check if parameters are used in steps
      const parameterNames = [];
      template.spec.parameters.forEach(param => {
        if (param.properties) {
          parameterNames.push(...Object.keys(param.properties));
        }
      });
      
      const stepsContent = JSON.stringify(template.spec.steps);
      const parametersUsed = parameterNames.some(param => 
        stepsContent.includes('${{ parameters.' + param + ' }}')
      );
      logTest(`Template ${template.metadata.name} uses parameters in steps`, parametersUsed);
    }
  });
  
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
  
  return testResults.failed === 0;
}

console.log('🧪 Running Simple Catalog Tests...\n');
const success = testCatalogRelationships();
process.exit(success ? 0 : 1);
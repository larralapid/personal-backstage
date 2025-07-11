#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Test configuration
const testConfig = {
  catalogFiles: [
    'examples/entities.yaml',
    'examples/personal-infrastructure.yaml',
    'examples/data-templates.yaml',
    'examples/backlog-templates.yaml',
    'examples/personal-org.yaml',
    'examples/org.yaml',
    'examples/template/template.yaml'
  ],
  configFile: 'app-config.yaml',
  packageFile: 'package.json'
};

// Test results
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

function testFileExists(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    return fs.existsSync(fullPath);
  } catch (error) {
    return false;
  }
}

function testYamlValid(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    yaml.loadAll(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, error };
  }
}

function testBackstageEntityValid(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const entities = yaml.loadAll(content);
    
    for (const entity of entities) {
      if (!entity) continue;
      
      // Check required fields
      if (!entity.apiVersion) {
        throw new Error(`Missing apiVersion in ${filePath}`);
      }
      if (!entity.kind) {
        throw new Error(`Missing kind in ${filePath}`);
      }
      if (!entity.metadata || !entity.metadata.name) {
        throw new Error(`Missing metadata.name in ${filePath}`);
      }
      if (!entity.spec && entity.kind !== 'Location') {
        throw new Error(`Missing spec in ${filePath} for ${entity.kind}`);
      }
      
      // Validate specific kinds
      if (entity.kind === 'Component' && !entity.spec.type) {
        throw new Error(`Component missing type in ${filePath}`);
      }
      if (entity.kind === 'Component' && !entity.spec.owner) {
        throw new Error(`Component missing owner in ${filePath}`);
      }
      if (entity.kind === 'System' && !entity.spec.owner) {
        throw new Error(`System missing owner in ${filePath}`);
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error };
  }
}

function testTemplateValid(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    const entities = yaml.loadAll(content);
    
    for (const entity of entities) {
      if (!entity || entity.kind !== 'Template') continue;
      
      // Check template-specific fields
      if (!entity.spec.parameters) {
        throw new Error(`Template missing parameters in ${filePath}`);
      }
      if (!entity.spec.steps) {
        throw new Error(`Template missing steps in ${filePath}`);
      }
      
      // Validate parameters
      for (const param of entity.spec.parameters) {
        if (!param.properties) {
          throw new Error(`Template parameter missing properties in ${filePath}`);
        }
      }
      
      // Validate steps
      for (const step of entity.spec.steps) {
        if (!step.id || !step.name || !step.action) {
          throw new Error(`Template step missing required fields in ${filePath}`);
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error };
  }
}

function testConfigValid() {
  try {
    const fullPath = path.join(__dirname, testConfig.configFile);
    const content = fs.readFileSync(fullPath, 'utf8');
    const config = yaml.load(content);
    
    // Check required config sections
    if (!config.app) {
      throw new Error('Missing app configuration');
    }
    if (!config.backend) {
      throw new Error('Missing backend configuration');
    }
    if (!config.catalog) {
      throw new Error('Missing catalog configuration');
    }
    
    // Check catalog locations
    if (!config.catalog.locations || !Array.isArray(config.catalog.locations)) {
      throw new Error('Missing or invalid catalog locations');
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error };
  }
}

function testPackageJsonValid() {
  try {
    const fullPath = path.join(__dirname, testConfig.packageFile);
    const content = fs.readFileSync(fullPath, 'utf8');
    const pkg = JSON.parse(content);
    
    // Check required fields
    if (!pkg.name) {
      throw new Error('Missing package name');
    }
    if (!pkg.workspaces) {
      throw new Error('Missing workspaces configuration');
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error };
  }
}

console.log('🧪 Running Backstage Configuration Tests...\n');

// Test file existence
console.log('📁 Testing file existence:');
testConfig.catalogFiles.forEach(file => {
  logTest(`File exists: ${file}`, testFileExists(file));
});
logTest(`Config file exists: ${testConfig.configFile}`, testFileExists(testConfig.configFile));
logTest(`Package file exists: ${testConfig.packageFile}`, testFileExists(testConfig.packageFile));

console.log('\n📋 Testing YAML validity:');
testConfig.catalogFiles.forEach(file => {
  if (testFileExists(file)) {
    const result = testYamlValid(file);
    logTest(`YAML valid: ${file}`, result.valid, result.error);
  }
});

const configResult = testYamlValid(testConfig.configFile);
logTest(`YAML valid: ${testConfig.configFile}`, configResult.valid, configResult.error);

console.log('\n🏗️ Testing Backstage entity validity:');
testConfig.catalogFiles.forEach(file => {
  if (testFileExists(file) && file !== 'examples/template/template.yaml') {
    const result = testBackstageEntityValid(file);
    logTest(`Entity valid: ${file}`, result.valid, result.error);
  }
});

console.log('\n📝 Testing template validity:');
['examples/data-templates.yaml', 'examples/backlog-templates.yaml', 'examples/template/template.yaml'].forEach(file => {
  if (testFileExists(file)) {
    const result = testTemplateValid(file);
    logTest(`Template valid: ${file}`, result.valid, result.error);
  }
});

console.log('\n⚙️ Testing configuration validity:');
const configValidResult = testConfigValid();
logTest('App config valid', configValidResult.valid, configValidResult.error);

const packageValidResult = testPackageJsonValid();
logTest('Package.json valid', packageValidResult.valid, packageValidResult.error);

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
# Development Workflow

## Git Branching Strategy

### Branch Types
- `main` - Production-ready code
- `feature/issue-N-description` - Feature development
- `fix/issue-N-description` - Bug fixes
- `docs/description` - Documentation updates

### Workflow Process

1. **Start New Work**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/issue-N-description
   ```

2. **Development**
   - Make atomic commits with clear messages
   - Use conventional commit format: `type: description`
   - Update CHANGELOG.md for notable changes

3. **Before Committing**
   - Check `.claude-instances.json` for other active instances
   - Run tests: `node run-all-tests.js`
   - Update version if needed (patch/minor/major)

4. **Create Pull Request**
   ```bash
   git push -u origin feature/issue-N-description
   gh pr create --title "feat: description" --body "## Summary\n- Change 1\n- Change 2"
   ```

## Multi-Instance Coordination

When multiple Claude instances are active:

1. **Check Coordination File**
   ```bash
   cat .claude-instances.json
   ```

2. **Update Instance Info**
   - Update your `last_activity` timestamp
   - Reserve branches before creating
   - Announce major file changes

3. **Conflict Resolution**
   - Timestamp wins for simultaneous changes
   - Coordinate on shared files (package.json, README.md)
   - Use prefixed branch names if conflicts arise

## Versioning

### Semantic Versioning
- `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Version Bumping
- Update `package.json` version
- Add entry to `CHANGELOG.md`
- Commit with version tag

## Node.js Version Management

This project requires Node.js 20 or 22. If you have Node.js 24+:

```bash
# Install Node.js 20
brew install node@20

# Use Node.js 20 for this project
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

## Testing

Run the full test suite before commits:
```bash
node run-all-tests.js
```

Individual test suites:
```bash
node test-config.js          # Configuration validation
node test-catalog-simple.js  # Catalog relationships  
node test-runtime.js         # Application startup
```

## Development Environment

### Recommended Setup
```bash
# Frontend only (avoids native dependency issues)
yarn workspace app start

# Full application (requires native dependencies working)
yarn start
```

### Build Tools (Issue #8 Resolution)
- Xcode command line tools: `xcode-select --install`
- Global node-gyp: `npm install -g node-gyp`
- Use Node.js 20: Required for native dependencies
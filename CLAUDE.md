# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal Backstage implementation for solo infrastructure management. It tracks personal projects, data sources, workflows, and provides templates for backlog/changelog management.

## Key Commands

### Development
```bash
# Start frontend only (recommended - avoids native dependency issues)
yarn workspace app start

# Start full application (requires native dependencies)
yarn start

# Build components
yarn workspace app build
yarn workspace backend build
yarn build:all

# Testing
node test-runtime.js          # Application startup tests
node test-config.js          # Configuration validation
node test-catalog-simple.js  # Catalog relationships
node run-all-tests.js        # Complete test suite

# Linting
yarn lint                    # Lint changed files since origin/main
yarn lint:all               # Lint all files
```

### Known Issues
- Native dependencies (isolated-vm, better-sqlite3) may fail to build on some systems
- Backend scaffolder functionality requires these dependencies
- Use frontend-only mode as workaround: `yarn workspace app start`

## Architecture

### Catalog Structure
- **Systems**: 3 top-level systems (personal-infrastructure, data-management, workflow-management)
- **Components**: Personal projects (quartz-site, techplug-solutions, voter-recon-api, etc.)
- **Resources**: Data files and datasets
- **Templates**: For creating new backlog items, changelog entries, and data records

### Key Configuration Files
- `app-config.yaml`: Main Backstage configuration
- `examples/personal-infrastructure.yaml`: Project catalog definitions
- `examples/data-templates.yaml`: Templates for active/passive data tracking
- `examples/backlog-templates.yaml`: Workflow management templates

### Data Types
- **Active Data**: User-created content (blog posts, code, designs)
- **Passive Data**: Automatically logged data (music, location, usage stats)

### Package Structure
- `packages/app/`: React frontend (Material-UI based)
- `packages/backend/`: Node.js backend with Backstage plugins
- Uses Yarn workspaces for monorepo management

## Testing Strategy
Custom test suite validates:
- Configuration file syntax and relationships
- Catalog entity loading and dependencies
- Application startup and basic functionality
- No standard test framework - uses custom Node.js scripts
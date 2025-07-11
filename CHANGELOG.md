# Changelog

All notable changes to Self Catalog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-11

### Added
- Multi-instance Claude coordination system (.claude-instances.json, .claude-coordination.md)
- Node.js 20 compatibility for native dependencies
- Build tools setup (xcode-select, node-gyp)

### Changed
- Project rebranded from "Personal Backstage" to "Self Catalog"
- Package name updated to "self-catalog"
- Node.js version constraint updated to "20 || 22"

### Fixed
- Issue #8: Native dependencies (isolated-vm, better-sqlite3) now build successfully
- Build tool installation and configuration

## [1.0.0] - 2025-07-10

### Added
- Initial Self Catalog implementation
- Personal infrastructure catalog
- Data management templates
- Workflow and backlog management
- Comprehensive test suite
- GitHub project integration
# Personal Backstage

> A personalized infrastructure management hub built with Backstage for tracking projects, data, workflows, and changelog as a solo developer.

![Personal Backstage Dashboard](https://raw.githubusercontent.com/backstage/backstage/master/docs/assets/header.png)

## 🎯 Overview

This is a custom Backstage implementation designed for personal use, providing a centralized hub to manage your entire development ecosystem. Unlike traditional Backstage setups focused on large organizations, this configuration is optimized for solo developers who want to track their personal infrastructure, projects, and data in one place.

## ✨ Features

### 🏗️ **Infrastructure Management**
- **Project Tracking**: Monitor all your personal projects and their status
- **System Organization**: Categorize projects by type (websites, APIs, tools, etc.)
- **Dependency Mapping**: Track relationships between your projects
- **Lifecycle Management**: Monitor project stages from experimental to production

### 📊 **Data Index System**
- **Active Data Tracking**: Monitor content you actively create
  - Blog posts, articles, documentation
  - Code repositories and projects
  - Design assets and media
  - Notes and knowledge base
- **Passive Data Logging**: Track automatically generated data
  - Music listening history (Spotify, Apple Music)
  - Location and travel data
  - App usage statistics
  - System metrics and logs

### 📝 **Workflow Management**
- **Backlog System**: Prioritized task management with time estimation
- **Changelog Tracking**: Version history and release notes
- **Template System**: Standardized workflows for common tasks
- **Progress Monitoring**: Track completion rates and productivity

### 🔧 **Personal Infrastructure Catalog**
Current projects being tracked:
- **Quartz Site**: Personal static site generator
- **TechPlug Solutions**: Portfolio and tech blog
- **Voter Recon API**: Civic technology project
- **Resume Generator**: Automated PDF resume creation
- **Daily Logging**: Personal notes and tracking system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Active LTS recommended)
- Yarn 4.4.1+
- Docker (optional, for full backend features)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/larralapid/personal-backstage.git
   cd personal-backstage
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the application**
   ```bash
   # Frontend only (recommended for personal use)
   yarn workspace app start
   
   # Full application (requires all dependencies)
   yarn start
   ```

4. **Access your hub**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7007 (if running full stack)

## 📋 Usage

### Managing Your Projects
1. Navigate to the **Catalog** section
2. Browse your **Systems** (Infrastructure, Data Management, Workflows)
3. Explore **Components** to see all your tracked projects
4. Use **Templates** to add new projects or data records

### Creating Data Records
- **Active Data**: Use the "Active Data Record" template for content you create
- **Passive Data**: Use the "Passive Data Record" template for automatically logged data
- **Backlog Items**: Track tasks and priorities using the backlog template
- **Changelog Entries**: Document changes and releases

### Customizing Your Setup
- Edit `examples/personal-infrastructure.yaml` to add new projects
- Modify templates in `examples/data-templates.yaml` for your data types
- Update `app-config.yaml` to configure integrations and settings

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
node run-all-tests.js

# Run specific test suites
node test-config.js           # Configuration validation
node test-catalog-simple.js   # Catalog relationships
node test-runtime.js         # Application startup
```

## 📊 Current Status

![Test Results](https://img.shields.io/badge/Tests-97.5%25_Pass-brightgreen)
![Configuration](https://img.shields.io/badge/Config-Valid-brightgreen)
![Catalog](https://img.shields.io/badge/Catalog-80_Entities-blue)

- **80 Total Tests** with **97.5% Pass Rate**
- **28 Configuration Tests** - All passing
- **48 Catalog Tests** - All passing
- **Full Frontend** - Working perfectly
- **Backend** - Partial (native dependency issues)

## 🐛 Known Issues

### Native Dependencies
Some backend features require native compilation:
- `isolated-vm` - Used for secure templating
- `better-sqlite3` - Database operations

**Workaround**: Use frontend-only mode for full functionality without these dependencies.

### Current Limitations
- Scaffolder plugin unavailable (requires native deps)
- In-memory database only (production needs external DB)
- No authentication configured (suitable for personal use)

## 🛠️ Development

### Project Structure
```
personal-backstage/
├── packages/
│   ├── app/           # Frontend React application
│   └── backend/       # Backend Node.js services
├── examples/          # Catalog configuration files
│   ├── personal-infrastructure.yaml
│   ├── data-templates.yaml
│   └── backlog-templates.yaml
├── test-*.js          # Test suite files
└── docs/              # Documentation
```

### Contributing to Your Setup
1. **Add New Projects**: Edit `examples/personal-infrastructure.yaml`
2. **Create Templates**: Add to `examples/data-templates.yaml`
3. **Update Config**: Modify `app-config.yaml`
4. **Test Changes**: Run `node test-config.js`

## 📚 Documentation

- [Personal Setup Guide](PERSONAL_README.md) - Detailed usage instructions
- [Test Results](test-report.md) - Comprehensive test report
- [Bug Fixes](BUG_FIXES.md) - Issues resolved and workarounds
- [Backstage Documentation](https://backstage.io/docs) - Official Backstage docs

## 🎨 Customization

### Adding New Data Types
Create new templates in `examples/data-templates.yaml`:
```yaml
apiVersion: backstage.io/v1alpha1
kind: Template
metadata:
  name: my-custom-data
  title: My Custom Data Type
spec:
  # Template configuration
```

### Integrating External Services
Update `app-config.yaml` to add integrations:
```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

## 🔮 Roadmap

### Phase 1: Core Functionality ✅
- [x] Basic catalog setup
- [x] Personal infrastructure tracking
- [x] Data management templates
- [x] Test suite implementation

### Phase 2: Enhanced Features 🚧
- [ ] Resolve native dependency issues
- [ ] Full backend functionality
- [ ] Authentication setup
- [ ] External database configuration

### Phase 3: Advanced Integration 📋
- [ ] GitHub integration for automatic project discovery
- [ ] CI/CD pipeline templates
- [ ] Analytics and reporting
- [ ] Mobile-responsive improvements

## 🤝 Contributing

This is a personal project, but contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Run the test suite
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Backstage](https://backstage.io/) - The amazing open-source platform
- [Spotify](https://spotify.com/) - For creating and open-sourcing Backstage
- The Backstage community for plugins and contributions

---

**Built with ❤️ for personal productivity and infrastructure management**
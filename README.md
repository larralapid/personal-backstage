# Self Catalog

> A personalized infrastructure management hub built with Backstage for tracking projects, data, workflows, and changelog as a solo developer.

## 🎯 Overview

This is a custom Backstage implementation designed for personal use, providing a centralized hub to manage your entire development ecosystem. Unlike traditional Backstage setups focused on large organizations, this configuration is optimized for solo developers who want to track their personal infrastructure, projects, and data in one place.

## ✨ Key Features

- **Project Tracking**: Monitor all your personal projects and their status
- **Data Management**: Track both active content creation and passive data logging
- **Workflow Management**: Backlog system with task prioritization and changelog tracking
- **Template System**: Standardized workflows for common development tasks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Active LTS recommended)
- Yarn 4.4.1+
- Docker (optional, for full backend features)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/larralapid/self-catalog.git
   cd self-catalog
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

## 📋 Basic Usage

1. **Start the application**: `yarn workspace app start`
2. **Access your hub**: Navigate to http://localhost:3000
3. **Browse the catalog**: Explore your tracked projects and systems
4. **Use templates**: Add new projects or data records through the UI

For detailed usage instructions, development guides, and troubleshooting, see the [project wiki](../../wiki).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Backstage](https://backstage.io/) - The amazing open-source platform
- [Spotify](https://spotify.com/) - For creating and open-sourcing Backstage
- The Backstage community for plugins and contributions

---

**Built with ❤️ for personal productivity and infrastructure management**
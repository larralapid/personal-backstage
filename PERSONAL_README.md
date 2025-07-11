# Personal Infrastructure Hub

This is your personal Backstage instance configured for managing your solo infrastructure, workflows, and data tracking.

## Features

### 🏗️ Infrastructure Management
- Track all your personal projects and components
- Monitor project status and dependencies
- Centralized view of your development ecosystem

### 📊 Data Index
- **Active Data**: Content you actively create (blog posts, code, designs)
- **Passive Data**: Data automatically logged about your activities (music, location, usage)
- Templates for categorizing and tracking both data types

### 📝 Workflow Management
- Backlog item tracking with priority levels
- Changelog management for your projects
- Task dependencies and time estimation

### 🗂️ Current Projects Tracked
- **Quartz Site**: Personal static site generator
- **TechPlug Solutions**: Portfolio website
- **Voter Recon API**: Civic tech API service
- **Resume Generator**: Python PDF generation tool
- **Daily Logging**: Notes and daily tracking system

## Getting Started

### Running the Application

1. **Start the frontend only** (recommended for solo use):
   ```bash
   yarn workspace app start
   ```
   Access at: http://localhost:3000

2. **Start full application** (if backend dependencies are resolved):
   ```bash
   yarn start
   ```

### Adding New Items

#### Data Records
1. Navigate to "Create Component" in the UI
2. Choose "Active Data Record" or "Passive Data Record" template
3. Fill in the details about your data source

#### Backlog Items
1. Use the "Backlog Item" template
2. Set priority and estimated hours
3. Link to related projects

#### Changelog Entries
1. Use the "Changelog Entry" template
2. Document changes with version and type
3. Keep historical record of improvements

## Configuration Files

- `app-config.yaml`: Main configuration
- `examples/personal-infrastructure.yaml`: Your project catalog
- `examples/data-templates.yaml`: Data tracking templates
- `examples/backlog-templates.yaml`: Task management templates

## Data Types Supported

### Active Data
- Blog posts, articles, documentation
- Code projects and repositories
- Videos, images, designs
- Presentations and notes

### Passive Data
- Music listening history
- Location visits
- App usage statistics
- Fitness activities
- Purchase records

## Customization

You can extend this setup by:
1. Adding more project components to `personal-infrastructure.yaml`
2. Creating new templates for specific workflows
3. Adding integration with external services
4. Customizing the UI components

## Troubleshooting

### Backend Issues
If you encounter native dependency issues (like `isolated-vm` or `better-sqlite3`):
- Use frontend-only mode: `yarn workspace app start`
- These are mainly needed for the scaffolder plugin
- Your catalog and basic functionality will work without them

### Adding New Projects
When you start new projects, add them to the catalog by:
1. Editing `examples/personal-infrastructure.yaml`
2. Adding the new component entry
3. Restarting the application

## Next Steps

1. **Set up authentication** for production use
2. **Add GitHub integration** for automatic project discovery
3. **Configure external databases** for persistence
4. **Add custom plugins** for specific needs (time tracking, analytics, etc.)
5. **Set up notifications** for important events

---

This setup gives you a comprehensive view of your personal infrastructure while maintaining the flexibility to grow and adapt as your needs change.
# Run:AI VSCode Extension

Manage Run:AI workloads, projects, and clusters directly from VSCode. Built for AI Engineers, Platform Engineers, and ML Researchers.

![Run:AI Extension](https://img.shields.io/badge/VSCode-Extension-blue) ![Version](https://img.shields.io/badge/version-0.0.1-green) ![License](https://img.shields.io/badge/license-MIT-orange)

> [!NOTE]
> This extension is currently a work in progress. The Run:AI Azure Marketplace offer will launch soon!

## 🚀 Features

- ✅ **View & Manage Workloads** - Browse, submit, and delete workspaces and training jobs
- 🎯 **Project Browser** - View all projects and departments
- 🖥️ **Cluster Monitor** - Track connected clusters
- 📊 **Real-time Status** - Color-coded workload indicators (🟢 Running, 🟡 Pending, 🔴 Failed, ✅ Completed)
- 🔄 **Quick Refresh** - One-click updates for all views
- 📝 **Detailed Views** - Comprehensive workload information with resource allocation
- 🚀 **GPU Support** - Specify GPU requirements for workloads

![Run AI Overview](resources/runai.png)

## 📦 Installation

**From Source:**
```bash
git clone https://github.com/Azure/nvidia-runai-vscode-extension.git
cd runai-vscode-extension
npm install
npm run compile
code .  # Open in VSCode, then press F5 to test
```

**From VSIX:** Extensions view (Ctrl+Shift+X) → "..." menu → "Install from VSIX..."

## ⚙️ Configuration

**Quick Setup:**
1. Ctrl+Shift+P → `Run:AI: Configure API Settings`
2. Enter API URL: `https://app.run.ai`
3. Enter API Token

**Or via Settings:**
```json
{
  "runai.apiUrl": "https://app.run.ai",
  "runai.token": "your-api-token-here"
}
```

## 📖 Usage

**Quick Start:**
1. Click Run:AI icon in Activity Bar
2. See three views: **Workloads**, **Projects**, **Clusters**
3. Click ➕ to submit a workspace or training job

**Submit Workspace:**
- Click ➕ in Workloads view
- Or Ctrl+Shift+P → `Run:AI: Submit Workspace`
- Select project, enter name, image, GPU count

**View Details:** Click any workload to see status, resources, and metadata

**Delete:** Right-click workload → "Delete Workload"

**Refresh:** Click 🔄 in any view toolbar

## 🎯 Commands

Access all commands via Command Palette (Ctrl+Shift+P):

| Command | Description |
|---------|-------------|
| `Run:AI: Configure API Settings` | Set up API URL and authentication token |
| `Run:AI: Submit Workspace` | Create a new interactive workspace |
| `Run:AI: Submit Training Job` | Launch a new training workload |
| `Run:AI: Delete Workload` | Remove a workload (requires confirmation) |
| `Run:AI: List All Workloads` | View all workloads in a quick pick menu |
| `Run:AI: Refresh Workloads` | Reload the workloads view |
| `Run:AI: Refresh Projects` | Reload the projects view |
| `Run:AI: Refresh Clusters` | Reload the clusters view |

## 🏗️ Architecture

### User Flow

```mermaid
flowchart TD
    Start([User Opens VSCode]) --> Check{Configured?}
    Check -->|No| Wizard[Getting Started Wizard]
    Check -->|Yes| Load[Load Extension]
    
    Wizard --> Configure[Enter API URL & Token]
    Configure --> Load
    
    Load --> Show[Show Tree Views]
    Show --> Trees[Workloads, Projects, Clusters]
    
    Trees --> Action{User Action}
    
    Action -->|Click +| CheckAPI{API Configured?}
    CheckAPI -->|No| Configure
    CheckAPI -->|Yes| Submit[Submit Workspace/Training]
    
    Action -->|Click Item| Details[Show Details Panel]
    Action -->|Right-click| Menu[Context Menu]
    Action -->|Refresh| Fetch[Fetch from API]
    
    Submit --> API[Run:AI REST API]
    Details --> Display[Display in Webview]
    Menu --> Delete[Delete Workload]
    Delete --> API
    Fetch --> API
    
    API --> Update[Update Tree Views]
    Update --> Trees
    
    style Start fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
    style API fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    style Load fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style Configure fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
```

### Component Architecture

```mermaid
graph TB
    subgraph "VSCode Extension Host"
        subgraph "Extension Core"
            EXT[Extension.ts<br/>Entry Point]
            CONFIG[Configuration<br/>Management]
            COMMANDS[Command<br/>Registry]
        end
        
        subgraph "API Layer"
            CLIENT[RunAI Client<br/>Axios HTTP]
            AUTH[Authentication<br/>Bearer Token]
        end
        
        subgraph "UI Providers"
            WP[Workloads<br/>TreeProvider]
            PP[Projects<br/>TreeProvider]
            CP[Clusters<br/>TreeProvider]
        end
        
        subgraph "VSCode UI"
            ACTBAR[Activity Bar<br/>Run:AI Icon]
            TREE[Tree Views]
            WEBVIEW[Webview Panels]
            CMDPAL[Command Palette]
        end
    end
    
    subgraph "Run:AI Platform"
        API[Run:AI REST API]
        WORKLOADS[Workloads Service]
        PROJECTS[Projects Service]
        CLUSTERS[Clusters Service]
    end
    
    USER[User] -->|Clicks/Commands| ACTBAR
    USER -->|Opens| CMDPAL
    
    ACTBAR --> TREE
    TREE --> WP
    TREE --> PP
    TREE --> CP
    
    CMDPAL --> COMMANDS
    COMMANDS --> EXT
    
    WP -->|Fetch Data| CLIENT
    PP -->|Fetch Data| CLIENT
    CP -->|Fetch Data| CLIENT
    
    COMMANDS -->|Submit/Delete| CLIENT
    
    EXT --> CONFIG
    CONFIG -->|API URL & Token| AUTH
    
    CLIENT --> AUTH
    AUTH -->|HTTPS| API
    
    API --> WORKLOADS
    API --> PROJECTS
    API --> CLUSTERS
    
    WP -->|Display Details| WEBVIEW
    
    style EXT fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    style CLIENT fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    style API fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    style USER fill:#9C27B0,stroke:#333,stroke-width:2px,color:#fff
```

### Workspace Submission Flow

```mermaid
sequenceDiagram
    participant User
    participant VSCode
    participant Extension
    participant APIClient
    participant RunAI

    User->>VSCode: Click "Submit Workspace"
    VSCode->>Extension: Trigger command
    Extension->>User: Prompt for project
    User->>Extension: Select project
    Extension->>User: Prompt for name/image/GPU
    User->>Extension: Enter details
    Extension->>APIClient: submitWorkspace()
    APIClient->>RunAI: POST /api/v1/workloads/workspaces
    RunAI-->>APIClient: 200 OK
    APIClient-->>Extension: Workload created
    Extension->>VSCode: Refresh tree view
    Extension->>User: Show success message
```

### Security & Authentication

```mermaid
graph LR
    USER[User] -->|Configure| CONFIG[VSCode Settings]
    CONFIG -->|Store Encrypted| TOKEN[API Token]
    TOKEN -->|Load| CLIENT[API Client]
    CLIENT -->|Bearer Auth| HTTPS[HTTPS Request]
    HTTPS -->|TLS| API[Run:AI API]
    
    style TOKEN fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style HTTPS fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
```

## 🔧 Development

**Prerequisites:** Node.js 16+, npm 8+, VSCode 1.104+

**Setup:**
```bash
git clone https://github.com/Azure/nvidia-runai-vscode-extension.git
cd runai-vscode-extension
npm install
npm run compile    # or `npm run watch` for auto-compile
```

**Test:** Press F5 in VSCode to launch Extension Development Host

**Package:** 
```bash
npm install -g @vscode/vsce
vsce package
```

## 📚 API Integration

**Endpoints Used:**
- `GET /api/v1/workloads` - List workloads
- `POST /api/v1/workloads/workspaces` - Submit workspace
- `POST /api/v1/workloads/trainings` - Submit training
- `DELETE /api/v1/workloads/{id}` - Delete workload
- `GET /api/v1/projects` - List projects
- `GET /api/v1/clusters` - List clusters

**Docs:** [Run:AI API Documentation](https://api-docs.run.ai/latest/)

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

**Code Style:** TypeScript best practices, ESLint (`npm run lint`)

## 🐛 Troubleshooting

**Extension not visible:** Reload VSCode (Ctrl+Shift+P → "Developer: Reload Window")

**"Run:AI client not initialized":** Run `Run:AI: Configure API Settings` and enter API URL + token

**Workloads not loading:** Click refresh (🔄) or check network connectivity to Run:AI API

**API connection issues:** Verify `runai.apiUrl` in settings and check firewall/proxy settings

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 📞 Support

- [GitHub Issues](https://github.com/Azure/nvidia-runai-vscode-extension/issues)
- [Run:AI Documentation](https://docs.run.ai/)
- Run:AI support for API issues

## 🗺️ Roadmap

- [ ] Real-time status updates & polling
- [ ] Workload logs viewer
- [ ] Port forwarding for workspaces
- [ ] GPU utilization metrics
- [ ] Workload templates
- [ ] Multi-cluster switching
- [ ] SSH & Jupyter integration
- [ ] TensorBoard integration

## 📸 Screenshots

### Extension Views

![Screenshot](<./resources/extension-screenshot.png>)
The Run:AI icon appears in the Activity Bar, providing three main views:

**Workloads View:**
```
Run:AI
  └─ Workloads
      ├─ 🟢 my-training-job (Running - team-ml)
      ├─ 🟡 data-processing (Pending - team-data)
      └─ ✅ model-evaluation (Completed - team-ml)
```

**Projects View:**
```
  └─ Projects  
      ├─ 📁 team-ml (ML Department)
      ├─ 📁 team-data (Data Science)
      └─ 📁 team-research (Research)
```

**Clusters View:**
```
  └─ Clusters
      ├─ 🖥️  production-cluster (https://prod.run.ai)
      └─ 🖥️  staging-cluster (https://staging.run.ai)
```

### Workload Details Panel
When clicking a workload, a detailed webview displays:

```
┌──────────────────────────────────────┐
│ my-training-job                      │
│                                      │
│ Status:    🟢 Running                │
│ Type:      Training                  │
│ Project:   team-ml                   │
│ Created:   2025-10-06 10:30:00      │
│                                      │
│ Resources                            │
│ GPU:       2                         │
│ CPU:       4 cores                   │
│ GPU Memory: 16Gi                     │
│ CPU Memory: 32Gi                     │
└──────────────────────────────────────┘
```

---

**Made with ❤️ for AI Engineers, Platform Engineers, and ML Researchers**

---
name: dokploy-mcp-server
description: Provides a standardized interface for AI assistants and applications to interact with the Dokploy platform for managing deployments, databases, and infrastructure.
---

# Dokploy MCP Server

**A powerful MCP server for managing Dokploy deployments**

This document serves as the core skill reference for interacting with the Dokploy platform via its Model Context Protocol (MCP) server.

## 🚀 Overview
**Dokploy MCP Server** is a comprehensive Model Context Protocol (MCP) server that provides seamless integration with [Dokploy](https://dokploy.com/) - the open-source alternative to Netlify, Vercel, and Heroku. This server enables AI assistants and applications to interact with Dokploy's powerful deployment platform through a standardized interface.

### What is Dokploy?
Dokploy is a free, self-hostable Platform as a Service (PaaS) that simplifies application deployment and management. It provides:
- Docker-based deployments
- Support for multiple frameworks and languages
- Automatic SSL certificates
- Database management
- Domain configuration

## ✨ Features

### 🗂️ Project Management
- Create, list, and delete projects
- Organize applications by project
- Manage project-level configurations

### 📦 Application Deployment
- Deploy applications from Git repositories (GitHub, GitLab, etc.)
- Support for Docker and Docker Compose
- Start, stop, and restart applications
- Real-time deployment status
- Update environment variables
- Application monitoring and health checks

### 🗄️ Database Management
- Support for multiple database types: PostgreSQL, MySQL, MongoDB, Redis, MariaDB
- Create and manage databases
- Connection string management

### 🌐 Domain & SSL Management
- Add custom domains to applications
- Automatic SSL certificate provisioning via Let's Encrypt
- Domain verification and configuration

### 💾 Backup & Restore
- Create manual and scheduled backups
- List available backups
- Restore databases from backups
- Disaster recovery support

### 📊 Monitoring & Logs
- Real-time application logs
- Application status monitoring
- Performance metrics
- Error tracking

## 📋 Prerequisites
- **Dokploy Instance**: A running Dokploy instance (self-hosted or cloud)
- **API Token**: Authentication token from your Dokploy dashboard
- **Node.js**: Version 18 or higher

## 🔧 Installation & Configuration

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/huuthangntk/dokploy-mcp.git
cd dokploy-mcp

# Install dependencies
bun install # or npm install
```

### Configuration (smithery.yaml)
```yaml
dokployUrl: "https://dok.bish.one"  # Your Dokploy instance URL
apiToken: "your-api-token-here"     # Your Dokploy API token
debug: false                         # Enable debug logging
```

## 📖 API Reference (Tools)

### Project Management
| Tool | Description | Parameters |
| --- | --- | --- |
| `list-projects` | List all projects | None |
| `create-project` | Create a new project | `name`, `description` |
| `delete-project` | Delete a project | `projectId` |

### Application Management
| Tool | Description | Parameters |
| --- | --- | --- |
| `list-applications` | List all applications | `projectId` |
| `create-application` | Create a new application | `projectId`, `name`, `appType`, `repository`, etc. |
| `deploy-application` | Deploy an application | `applicationId` |
| `start-application` | Start an application | `applicationId` |
| `stop-application` | Stop an application | `applicationId` |
| `restart-application` | Restart an application | `applicationId` |
| `delete-application` | Delete an application | `applicationId` |
| `get-logs` | Get application logs | `applicationId`, `lines` |
| `get-application-status` | Get application status | `applicationId` |
| `update-env-vars` | Update environment variables | `applicationId`, `env` |

### Database Management
| Tool | Description | Parameters |
| --- | --- | --- |
| `create-database` | Create a new database | `projectId`, `name`, `type`, etc. |
| `list-databases` | List all databases | `projectId` |

### Domain Management
| Tool | Description | Parameters |
| --- | --- | --- |
| `add-domain` | Add a custom domain | `applicationId`, `domain`, `enableSSL` |
| `list-domains` | List all domains | `applicationId` |

### Backup & Restore
| Tool | Description | Parameters |
| --- | --- | --- |
| `create-backup` | Create a database backup | `databaseId` |
| `list-backups` | List all backups | `databaseId` |
| `restore-backup` | Restore from backup | `backupId` |

## 💡 Preguntas Frecuentes y Casos de Uso
**Casos de Uso Principales:**
1. Automating application deployments and updates on Dokploy via AI assistants.
2. Programmatically managing database creation, backups, and restorations for Dokploy applications.
3. Integrating Dokploy's infrastructure capabilities into AI-driven development and operations workflows.

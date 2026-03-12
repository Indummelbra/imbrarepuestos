---
name: dokploy-mcp-ahdev
description: Exposes Dokploy functionalities as tools consumable via the Model Context Protocol (MCP) through the @ahdev/dokploy-mcp package. Offers 43 specific tools for application, postgres, and project management.
---

# Dokploy MCP Server (@ahdev/dokploy-mcp)

Dokploy MCP Server exposes Dokploy functionalities as tools consumable via the Model Context Protocol (MCP). It allows MCP-compatible clients (e.g., AI models, other applications) to interact with your Dokploy server programmatically.

This server focuses exclusively on **tools** for direct Dokploy API operations, providing a clean and efficient interface for project and application management. 

## 🛠️ Getting Started

### Requirements
- Node.js >= v18.0.0 (or Docker)
- A running Dokploy server instance
- Cursor, VS Code, Claude Desktop, or another MCP Client

### Environment Variables
- `DOKPLOY_URL`: Your Dokploy server API URL (required)
- `DOKPLOY_AUTH_TOKEN`: Your Dokploy API authentication token (required)

### Installation Examples

**Cursor (`~/.cursor/mcp.json`):**
```json
{
  "mcpServers": {
    "dokploy-mcp": {
      "command": "npx",
      "args": ["-y", "@ahdev/dokploy-mcp"],
      "env": {
        "DOKPLOY_URL": "https://your-dokploy-server.com/api",
        "DOKPLOY_AUTH_TOKEN": "your-dokploy-api-token"
      }
    }
  }
}
```

**VS Code:**
```json
{
  "servers": {
    "dokploy-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@ahdev/dokploy-mcp"],
      "env": {
        "DOKPLOY_URL": "https://your-dokploy-server.com/api",
        "DOKPLOY_AUTH_TOKEN": "your-dokploy-api-token"
      }
    }
  }
}
```

## 📚 Herramientas Disponibles (43 Tools)

Este servidor MCP proporciona 43 herramientas organizadas en tres categorías principales para la gestión completa en Dokploy:

### 🗂️ Project Management (6 herramientas)
Gestión del ciclo de vida completo de los proyectos:
1. **`project-all`**: Lists all projects in Dokploy with optimized response size suitable for LLM consumption.
2. **`project-create`**: Creates a new project in Dokploy.
3. **`project-duplicate`**: Duplicates an existing project in Dokploy with optional service selection.
4. **`project-one`**: Gets a specific project by its ID in Dokploy.
5. **`project-remove`**: Removes/deletes an existing project in Dokploy.
6. **`project-update`**: Updates an existing project in Dokploy.

### 🚀 Application Management (24 herramientas)
Operaciones para el ciclo de vida y la configuración de aplicaciones:
1. **`application-clean-queues`**: Cleans the queues for an application.
2. **`application-create`**: Creates a new application.
3. **`application-delete`**: Deletes an application.
4. **`application-deploy`**: Deploys an application.
5. **`application-mark-running`**: Marks an application as running.
6. **`application-move`**: Moves an application to a different project.
7. **`application-one`**: Gets a specific application by its ID.
8. **`application-read-app-monitoring`**: Reads monitoring data for an application.
9. **`application-read-traefik-config`**: Reads Traefik configuration.
10. **`application-redeploy`**: Redeploys an application.
11. **`application-refresh-token`**: Refreshes the token for an application.
12. **`application-reload`**: Reloads an application.
13. **`application-save-bitbucket-provider`**: Saves Bitbucket provider config.
14. **`application-save-build-type`**: Saves build type configuration.
15. **`application-save-docker-provider`**: Saves Docker provider config.
16. **`application-save-environment`**: Saves environment variables.
17. **`application-save-git-provider`**: Saves general Git provider config.
18. **`application-save-gitea-provider`**: Saves Gitea provider config.
19. **`application-save-github-provider`**: Saves GitHub provider config.
20. **`application-save-gitlab-provider`**: Saves GitLab provider config.
21. **`application-start`**: Starts an application.
22. **`application-stop`**: Stops an application.
23. **`application-update`**: Updates an existing application.
24. **`application-update-traefik-config`**: Updates Traefik configuration.

### 🐘 PostgreSQL Database Management (13 herramientas)
Gestión completa de bases de datos PostgreSQL:
1. **`postgres-change-status`**: Changes the status of a PostgreSQL database.
2. **`postgres-create`**: Creates a new PostgreSQL database.
3. **`postgres-deploy`**: Deploys a PostgreSQL database.
4. **`postgres-move`**: Moves a PostgreSQL database to a different project.
5. **`postgres-one`**: Gets a specific PostgreSQL database by its ID.
6. **`postgres-rebuild`**: Rebuilds a PostgreSQL database.
7. **`postgres-reload`**: Reloads a PostgreSQL database.
8. **`postgres-remove`**: Removes/deletes a PostgreSQL database.
9. **`postgres-save-environment`**: Saves environment variables.
10. **`postgres-save-external-port`**: Saves external port configuration.
11. **`postgres-start`**: Starts a PostgreSQL database.
12. **`postgres-stop`**: Stops a PostgreSQL database.
13. **`postgres-update`**: Updates an existing PostgreSQL database.

## 💡 Información Adicional y Arquitectura
- Todas las herramientas interactúan directamente con la API REST de Dokploy (`openWorldHint: true`).
- Incluyen anotaciones semánticas (`readOnlyHint`, `destructiveHint`, `idempotentHint`) para que los clientes MCP comprendan la naturaleza de cada operación.
- Validaciones completas con Zod para asegurar la correcta entrada de datos según las especificaciones OpenAPI de Dokploy.

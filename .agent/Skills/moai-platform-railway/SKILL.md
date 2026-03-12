---
name: moai-platform-railway
description: Railway container deployment specialist covering Docker, multi-service architectures, persistent volumes, and auto-scaling. Use when deploying containerized full-stack applications, configuring multi-region deployments, or setting up persistent storage.
---

# moai-platform-railway: Container Deployment Specialist

The moai-platform-railway skill empowers the agent to act as a specialized DevOps engineer for the Railway ecosystem, providing expert guidance on container-first deployment strategies. It covers the full lifecycle of application hosting, from optimizing multi-stage Dockerfiles and Railpack builds to orchestrating complex multi-service meshes with private networking and auto-scaling.

## ✨ Características Principales
1. Automated infrastructure management via `railway.toml` configuration
2. Multi-region deployment and auto-scaling policy implementation
3. Multi-service orchestration with secure private networking
4. Persistent volume configuration for stateful container workloads
5. Optimized Docker and Railpack build strategies for various runtimes

## 💡 Casos de Uso
1. Deploying full-stack containerized applications with managed databases
2. Configuring secure inter-service communication in a microservices architecture
3. Setting up stateful applications requiring persistent storage and volume mounts

## 📘 Quick Reference
**Railway Platform Core:** Container-first deployment platform with Docker and Railpack builds, multi-service architectures, persistent volumes, private networking, and auto-scaling capabilities.

### Railway Optimal Use Cases
* **Container Workloads:**
  - Full-stack containerized applications with custom runtimes
  - Multi-service architectures with inter-service communication
  - Backend services requiring persistent connections (WebSocket, gRPC)
  - Database-backed applications with managed PostgreSQL, MySQL, Redis
* **Infrastructure Requirements:**
  - Persistent volume storage for stateful workloads
  - Private networking for secure service mesh
  - Multi-region deployment for global availability
  - Auto-scaling based on CPU, memory, or request metrics

### Build Strategy Selection
* **Docker Build:** Custom system dependencies, multi-stage builds, specific base images
* **Railpack Build:** Standard runtimes (Node.js, Python, Go), zero-config, faster builds. *(Note: Nixpacks is deprecated. New services default to Railpack.)*

### Key CLI Commands
```bash
railway login && railway init && railway link
railway up                    # Deploy current directory
railway up --detach          # Deploy without logs
railway variables --set KEY=value
railway logs --service api
railway rollback --previous
```

## 🏗️ Implementation Guide

### Phase 1: Project Setup
```bash
railway login && railway init && railway link
```

**`railway.toml` Example:**
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "./Dockerfile"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
numReplicas = 2

[deploy.resources]
memory = "512Mi"
cpu = "0.5"
```

### Phase 2: Container Configuration
**Quick Start Dockerfile (Node.js):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER appuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Phase 3: Multi-Service Setup
**Service Variable References:**
```
${{Postgres.DATABASE_URL}}
${{Redis.REDIS_URL}}
${{api.RAILWAY_PRIVATE_DOMAIN}}
```

**Private Networking (Node.js Example):**
```typescript
const getInternalUrl = (service: string, port = 3000): string => {
  const domain = process.env[`${service.toUpperCase()}_RAILWAY_PRIVATE_DOMAIN`]
  return domain ? `http://${domain}:${port}` : `http://localhost:${port}`
}
```

### Phase 4: Storage and Scaling

**Volume Configuration:**
```toml
[[volumes]]
mountPath = "/app/data"
name = "app-data"
size = "10Gi"
```

**Auto-Scaling:**
```toml
[deploy.scaling]
minReplicas = 2
maxReplicas = 10
targetCPUUtilization = 70
```

**Multi-Region:**
```toml
[[deploy.regions]]
name = "us-west1"
replicas = 3

[[deploy.regions]]
name = "europe-west4"
replicas = 2
```

## 🔄 CI/CD Integration
**GitHub Actions (`.github/workflows/railway.yml`):**
```yaml
name: Railway Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm i -g @railway/cli
      - run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## ❓ Preguntas Frecuentes

**What is the moai-platform-railway skill?**
It is a specialized capability that provides domain-specific guidance on deploying, managing, and scaling containerized applications on the Railway platform.

**Can I use this skill to configure persistent storage?**
Absolutely. It provides implementation guides for mounting persistent volumes and managing stateful workloads like SQLite or custom file storage systems.

**How does it handle different build types?**
The skill helps you choose between custom Docker builds for complex dependencies and zero-config Railpack builds for standard runtimes like Node.js, Python, and Go.

**Does this skill support multi-service architectures?**
Yes, it includes patterns for monorepo deployments, service variable references, and private networking for secure communication between services.

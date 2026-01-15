# Helm Charts for Todo Chatbot

This directory contains Helm charts for deploying the Todo Chatbot application to Kubernetes.

## Quick Start

```bash
# Install the application
helm install todo-app ./todo-app --create-namespace --namespace todo-app

# Access the application
minikube service todo-app-frontend -n todo-app
```

## Chart Structure

```
todo-app/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration values
├── .helmignore            # Files to ignore
└── templates/             # Kubernetes manifest templates
    ├── _helpers.tpl       # Template helpers
    ├── NOTES.txt          # Post-install instructions
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── configmap.yaml
    ├── secrets.yaml
    └── serviceaccount.yaml
```

## Configuration

### Required Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `secrets.data.groq-api-key` | Groq API key for chatbot | `""` (required!) |
| `secrets.data.jwt-secret` | JWT secret for authentication | `"local-development..."` |

### Important Values

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend pods | `2` |
| `frontend.replicaCount` | Number of frontend pods | `2` |
| `postgresql.enabled` | Enable PostgreSQL subchart | `true` |
| `postgresql.auth.password` | Database password | `"todopassword"` |

## Installation Examples

### Basic Installation

```bash
helm install todo-app ./todo-app \
  --create-namespace \
  --namespace todo-app
```

### With Custom Values

```bash
helm install todo-app ./todo-app \
  --set secrets.data.groq-api-key="gsk_your_api_key" \
  --set backend.replicaCount=3 \
  --create-namespace \
  --namespace todo-app
```

### With Values File

```bash
# Create custom-values.yaml
cat > custom-values.yaml <<EOF
secrets:
  data:
    groq-api-key: "gsk_your_groq_api_key"
    jwt-secret: "your-secure-random-secret"

backend:
  replicaCount: 3
  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"

postgresql:
  auth:
    password: "change-me-in-production"
EOF

# Install with custom values
helm install todo-app ./todo-app -f custom-values.yaml -n todo-app
```

## Upgrading

```bash
# Upgrade with new values
helm upgrade todo-app ./todo-app \
  --set backend.replicaCount=5 \
  -n todo-app

# View upgrade history
helm history todo-app -n todo-app

# Rollback to previous version
helm rollback todo-app -n todo-app
```

## Uninstalling

```bash
# Uninstall the release
helm uninstall todo-app -n todo-app

# Delete the namespace (removes all resources)
kubectl delete namespace todo-app
```

## Useful Commands

```bash
# List installed releases
helm list -n todo-app

# Get computed values
helm get values todo-app -n todo-app --all

# Render templates locally (dry-run)
helm template todo-app ./todo-app

# Validate chart
helm lint ./todo-app

# Package chart
helm package ./todo-app
```

## See Also

- **Deployment Guide**: `../MINIKUBE_DEPLOYMENT.md`
- **Phase 4 Spec**: `../specs/001-competition-todo-app/pahse4.md`
- **Main README**: `../README.md`

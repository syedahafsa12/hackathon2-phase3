# 🚀 Phase 4: Minikube Kubernetes Deployment Guide

**Cloud-Native Todo Chatbot with AI Capabilities**

This guide walks you through deploying the Todo Chatbot application on a local Kubernetes cluster using **Minikube** and **Helm Charts**, with AI-assisted operations using **kubectl-ai** and **Kagent**.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [AI-Powered Operations](#ai-powered-operations)
5. [Deployment Verification](#deployment-verification)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose | Installation Link |
|------|---------|---------|------------------|
| **Docker Desktop** | 4.53+ | Container runtime + Gordon AI | [Download](https://www.docker.com/products/docker-desktop/) |
| **Minikube** | 1.32+ | Local Kubernetes cluster | [Install](https://minikube.sigs.k8s.io/docs/start/) |
| **kubectl** | 1.28+ | Kubernetes CLI | [Install](https://kubernetes.io/docs/tasks/tools/) |
| **Helm** | 3.12+ | Kubernetes package manager | [Install](https://helm.sh/docs/intro/install/) |
| **kubectl-ai** | Latest | AI-assisted K8s operations | [Install](https://github.com/sozercan/kubectl-ai) |
| **Kagent** | Latest | Advanced K8s AI agent | [Install](https://github.com/k8sgpt-ai/k8sgpt) |

### Optional (Recommended)

- **Gordon (Docker AI)**: Enable in Docker Desktop Settings → Beta Features → Docker AI Agent
- **GROQ API Key**: Free tier available at [console.groq.com](https://console.groq.com)

---

## Quick Start

**For experienced users - get running in 5 minutes:**

```bash
# 1. Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. Build Docker images in Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t todo-backend:latest -f backend/Dockerfile.k8s backend/
docker build -t todo-frontend:latest frontend/

# 3. Add Bitnami Helm repository (for PostgreSQL)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 4. Install the application with Helm
helm install todo-app ./helm/todo-app \
  --set secrets.data.groq-api-key="YOUR_GROQ_API_KEY_HERE" \
  --create-namespace \
  --namespace todo-app

# 5. Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=todo-app -n todo-app --timeout=300s

# 6. Access the frontend
minikube service todo-app-frontend -n todo-app
```

**Done!** The application should open in your browser automatically.

---

## Detailed Setup

### Step 1: Start Minikube

Start Minikube with sufficient resources for running the full stack:

```bash
# Recommended configuration
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=20g \
  --driver=docker

# Verify Minikube is running
minikube status

# Enable required addons
minikube addons enable metrics-server
minikube addons enable dashboard
```

**Resource Recommendations:**
- **Minimum**: 2 CPUs, 4GB RAM
- **Recommended**: 4 CPUs, 8GB RAM (for smooth chatbot performance)
- **Optimal**: 6 CPUs, 12GB RAM (for development with hot-reload)

### Step 2: Build Docker Images

Build images inside Minikube's Docker daemon to avoid pushing to a registry:

```bash
# Point your shell to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker ps  # Should show Minikube containers

# Build backend image
cd backend
docker build -t todo-backend:latest -f Dockerfile.k8s .

# Build frontend image
cd ../frontend
docker build -t todo-frontend:latest .

# Verify images
docker images | grep todo
```

**Using Gordon (Docker AI) - Optional:**

```bash
# Ask Gordon to build images
docker ai "build the backend image from backend/Dockerfile.k8s and tag it as todo-backend:latest"
docker ai "build the frontend image from frontend/Dockerfile and tag it as todo-frontend:latest"
```

### Step 3: Configure Helm Values

Create a custom values file with your secrets:

```bash
# Create a values file
cat > custom-values.yaml <<EOF
# Custom configuration for Todo Chatbot

# Backend Configuration
backend:
  env:
    # IMPORTANT: Change this in production!
    JWT_SECRET: "$(openssl rand -base64 32)"
    CORS_ORIGINS: "http://localhost:3000,http://localhost:30000"

# Secrets (sensitive data)
secrets:
  data:
    # Get your free API key at https://console.groq.com
    groq-api-key: "YOUR_GROQ_API_KEY_HERE"

# PostgreSQL Configuration
postgresql:
  auth:
    username: todouser
    password: "$(openssl rand -base64 16)"
    database: tododb
EOF

echo "✅ Created custom-values.yaml - IMPORTANT: Add your GROQ_API_KEY!"
```

### Step 4: Add Helm Repositories

Add the Bitnami repository for PostgreSQL:

```bash
# Add Bitnami repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Update repositories
helm repo update

# Verify repository
helm search repo bitnami/postgresql
```

### Step 5: Install the Application

Deploy the Todo Chatbot using Helm:

```bash
# Install the chart
helm install todo-app ./helm/todo-app \
  --values custom-values.yaml \
  --create-namespace \
  --namespace todo-app \
  --timeout 10m \
  --wait

# Or install with inline values
helm install todo-app ./helm/todo-app \
  --set secrets.data.groq-api-key="gsk_your_api_key_here" \
  --set backend.env.JWT_SECRET="your-secure-random-secret" \
  --create-namespace \
  --namespace todo-app
```

**What This Deploys:**
- ✅ PostgreSQL database (1 StatefulSet pod)
- ✅ Backend API (2 Deployment pods)
- ✅ Frontend app (2 Deployment pods)
- ✅ Services (ClusterIP + NodePort)
- ✅ ConfigMaps and Secrets

### Step 6: Verify Deployment

Check that all resources are running:

```bash
# Check all pods
kubectl get pods -n todo-app

# Expected output:
# NAME                                    READY   STATUS    RESTARTS   AGE
# todo-app-backend-xxxxxxxxxx-xxxxx      1/1     Running   0          2m
# todo-app-backend-xxxxxxxxxx-xxxxx      1/1     Running   0          2m
# todo-app-frontend-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
# todo-app-frontend-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
# todo-app-postgresql-0                  1/1     Running   0          2m

# Check services
kubectl get services -n todo-app

# Check helm release
helm list -n todo-app
```

### Step 7: Access the Application

**Method 1: Using Minikube Service (Recommended)**

```bash
# Open frontend in browser automatically
minikube service todo-app-frontend -n todo-app

# This will output the URL and open your browser
# Example: http://192.168.49.2:30000
```

**Method 2: Using Port Forwarding**

```bash
# Port-forward frontend to localhost
kubectl port-forward -n todo-app svc/todo-app-frontend 3000:3000

# Access at: http://localhost:3000

# Port-forward backend (for API testing)
kubectl port-forward -n todo-app svc/todo-app-backend 8001:8001

# Access Swagger docs at: http://localhost:8001/docs
```

**Method 3: Get Minikube IP + NodePort**

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Frontend is exposed on NodePort 30000 (see values.yaml)
echo "Frontend: http://$MINIKUBE_IP:30000"

# Open in browser
open "http://$MINIKUBE_IP:30000"  # macOS
xdg-open "http://$MINIKUBE_IP:30000"  # Linux
start "http://$MINIKUBE_IP:30000"  # Windows
```

---

## AI-Powered Operations

### Using kubectl-ai

**Installation:**

```bash
# Install kubectl-ai (requires OpenAI API key)
brew install kubectl-ai  # macOS
# Or download from: https://github.com/sozercan/kubectl-ai/releases

# Configure OpenAI API key
export OPENAI_API_KEY="your-openai-api-key"
```

**Example Commands:**

```bash
# Deploy operations
kubectl-ai "deploy the todo frontend with 2 replicas"
kubectl-ai "scale the backend to handle more load"

# Debugging
kubectl-ai "check why the pods are failing"
kubectl-ai "show me logs for the backend pods"
kubectl-ai "what's wrong with the database connection"

# Resource management
kubectl-ai "increase memory for the frontend pods"
kubectl-ai "show me resource usage for todo-app"

# Network operations
kubectl-ai "expose the backend service externally"
kubectl-ai "create an ingress for todo-app"
```

### Using Kagent (K8sGPT)

**Installation:**

```bash
# Install K8sGPT
brew install k8sgpt  # macOS

# Or via binary download
curl -LO https://github.com/k8sgpt-ai/k8sgpt/releases/download/v0.3.20/k8sgpt_amd64.tar.gz
tar -xvf k8sgpt_amd64.tar.gz
sudo mv k8sgpt /usr/local/bin/

# Authenticate (supports multiple backends)
k8sgpt auth add --backend openai --model gpt-4
# Or use free backends:
k8sgpt auth add --backend localai
```

**Example Commands:**

```bash
# Analyze cluster health
k8sgpt analyze --namespace todo-app

# Get explanations for errors
k8sgpt analyze --explain --namespace todo-app

# Filter by specific issues
k8sgpt analyze --filter=Pod --namespace todo-app

# Generate reports
k8sgpt analyze --output=json --namespace todo-app > report.json

# Interactive mode
k8sgpt serve  # Starts web UI at http://localhost:8080
```

### Using Gordon (Docker AI)

**Enable Gordon in Docker Desktop:**

1. Open Docker Desktop
2. Go to **Settings** → **Beta features**
3. Toggle **Docker AI Agent (Gordon)** ON
4. Restart Docker Desktop

**Example Commands:**

```bash
# Build images with Gordon
docker ai "build the backend image from backend/Dockerfile.k8s"
docker ai "optimize the frontend Dockerfile for smaller image size"

# Container operations
docker ai "list all containers for todo app"
docker ai "show me logs for the backend container"

# Image management
docker ai "clean up unused images to free space"
docker ai "what's the size of todo-backend image"

# Troubleshooting
docker ai "why is the backend container restarting"
docker ai "check health of all todo containers"
```

---

## Deployment Verification

### 1. Check Pod Health

```bash
# All pods should be Running
kubectl get pods -n todo-app

# Check pod details
kubectl describe pod -n todo-app -l app.kubernetes.io/component=backend

# Check pod logs
kubectl logs -n todo-app -l app.kubernetes.io/component=backend --tail=50
kubectl logs -n todo-app -l app.kubernetes.io/component=frontend --tail=50
```

### 2. Test Backend API

```bash
# Port-forward backend
kubectl port-forward -n todo-app svc/todo-app-backend 8001:8001 &

# Test health endpoint
curl http://localhost:8001/health

# Expected: {"status":"ok"}

# Access Swagger docs
open http://localhost:8001/docs
```

### 3. Test Frontend

```bash
# Get frontend URL
minikube service todo-app-frontend -n todo-app --url

# Test in browser or with curl
curl -I $(minikube service todo-app-frontend -n todo-app --url)

# Should return HTTP 200
```

### 4. Test Database Connection

```bash
# Connect to PostgreSQL pod
kubectl exec -it -n todo-app todo-app-postgresql-0 -- psql -U todouser -d tododb

# Run SQL query
tododb=# \dt  # List tables
tododb=# SELECT COUNT(*) FROM users;
tododb=# \q  # Quit
```

### 5. End-to-End Test

```bash
# 1. Open frontend
minikube service todo-app-frontend -n todo-app

# 2. Sign up with test user
# 3. Create a task via chatbot: "Add a task to buy groceries"
# 4. Verify task appears in dashboard
# 5. Check backend logs
kubectl logs -n todo-app -l app.kubernetes.io/component=backend | grep "POST /tasks"
```

---

## Troubleshooting

### Issue: Pods stuck in "Pending" state

**Diagnosis:**

```bash
kubectl describe pod -n todo-app <pod-name>
```

**Common Causes:**
- Insufficient resources (increase Minikube memory/CPU)
- Image pull errors (ensure images are built in Minikube's Docker)
- Volume mount issues

**Solution:**

```bash
# Increase Minikube resources
minikube stop
minikube start --cpus=6 --memory=12288

# Rebuild images
eval $(minikube docker-env)
docker build -t todo-backend:latest -f backend/Dockerfile.k8s backend/
docker build -t todo-frontend:latest frontend/
```

### Issue: Pods stuck in "CrashLoopBackOff"

**Diagnosis:**

```bash
kubectl logs -n todo-app <pod-name> --previous
kubectl describe pod -n todo-app <pod-name>
```

**Common Causes:**
- Missing environment variables (GROQ_API_KEY, DATABASE_URL)
- Database not ready (backend tries to connect before PostgreSQL is up)
- Application errors

**Solution:**

```bash
# Check secrets are set
kubectl get secrets -n todo-app todo-app-secrets -o yaml

# Check environment variables
kubectl exec -n todo-app <backend-pod> -- env | grep GROQ

# Fix: Update secrets and restart
helm upgrade todo-app ./helm/todo-app \
  --set secrets.data.groq-api-key="your-key" \
  -n todo-app

kubectl rollout restart deployment -n todo-app
```

### Issue: "ImagePullBackOff" error

**Diagnosis:**

```bash
kubectl describe pod -n todo-app <pod-name>
```

**Cause:** Kubernetes trying to pull images from a registry, but they're local.

**Solution:**

```bash
# Ensure you built images in Minikube's Docker
eval $(minikube docker-env)
docker images | grep todo  # Should show your images

# Rebuild if missing
cd backend && docker build -t todo-backend:latest -f Dockerfile.k8s .
cd ../frontend && docker build -t todo-frontend:latest .

# Verify imagePullPolicy is "IfNotPresent" or "Never" in values.yaml
```

### Issue: Database connection errors

**Diagnosis:**

```bash
kubectl logs -n todo-app -l app.kubernetes.io/component=backend | grep -i "database\|connection"
```

**Common Causes:**
- PostgreSQL not ready
- Wrong DATABASE_URL
- Network policies blocking connection

**Solution:**

```bash
# Check PostgreSQL is running
kubectl get pods -n todo-app -l app.kubernetes.io/name=postgresql

# Test database connection from backend pod
kubectl exec -n todo-app <backend-pod> -- nc -zv todo-app-postgresql 5432

# Verify DATABASE_URL environment variable
kubectl exec -n todo-app <backend-pod> -- env | grep DATABASE_URL
```

### Issue: CORS errors in browser

**Diagnosis:** Browser console shows:
```
Access to fetch at 'http://...' from origin 'http://...' has been blocked by CORS policy
```

**Solution:**

```bash
# Update CORS_ORIGINS to include your frontend URL
helm upgrade todo-app ./helm/todo-app \
  --set backend.env.CORS_ORIGINS="http://localhost:3000,http://$(minikube ip):30000" \
  -n todo-app

# Restart backend
kubectl rollout restart deployment/todo-app-backend -n todo-app
```

### Issue: "No space left on device"

**Diagnosis:**

```bash
minikube ssh -- df -h
```

**Solution:**

```bash
# Clean up unused Docker images
eval $(minikube docker-env)
docker system prune -a -f

# Or increase disk size
minikube stop
minikube delete
minikube start --cpus=4 --memory=8192 --disk-size=30g
```

### Debug with AI Assistance

```bash
# Use kubectl-ai to diagnose
kubectl-ai "why are my todo-app pods failing"
kubectl-ai "fix the CrashLoopBackOff error in backend"

# Use K8sGPT for detailed analysis
k8sgpt analyze --explain --namespace todo-app
```

---

## Advanced Usage

### Scaling the Application

```bash
# Scale manually
kubectl scale deployment todo-app-backend -n todo-app --replicas=5

# Or update Helm values
helm upgrade todo-app ./helm/todo-app \
  --set backend.replicaCount=5 \
  --set frontend.replicaCount=3 \
  -n todo-app

# Enable Horizontal Pod Autoscaler (HPA)
helm upgrade todo-app ./helm/todo-app \
  --set autoscaling.backend.enabled=true \
  --set autoscaling.backend.minReplicas=2 \
  --set autoscaling.backend.maxReplicas=10 \
  -n todo-app

# Verify HPA
kubectl get hpa -n todo-app
```

### Viewing Logs

```bash
# Stream logs from all backend pods
kubectl logs -n todo-app -l app.kubernetes.io/component=backend -f

# Stream logs from all frontend pods
kubectl logs -n todo-app -l app.kubernetes.io/component=frontend -f

# Stream logs from database
kubectl logs -n todo-app -l app.kubernetes.io/name=postgresql -f

# View logs from previous container (if crashed)
kubectl logs -n todo-app <pod-name> --previous

# Save logs to file
kubectl logs -n todo-app -l app.kubernetes.io/component=backend > backend-logs.txt
```

### Monitoring with Kubernetes Dashboard

```bash
# Start Kubernetes Dashboard
minikube dashboard

# Or access dashboard URL
minikube dashboard --url

# This opens a web UI to view:
# - Pod status and logs
# - Resource usage (CPU, memory)
# - Events and errors
# - Configuration (ConfigMaps, Secrets)
```

### Updating the Application

```bash
# Rebuild images after code changes
eval $(minikube docker-env)
docker build -t todo-backend:latest -f backend/Dockerfile.k8s backend/
docker build -t todo-frontend:latest frontend/

# Restart deployments to use new images
kubectl rollout restart deployment -n todo-app

# Or use Helm upgrade
helm upgrade todo-app ./helm/todo-app -n todo-app

# Check rollout status
kubectl rollout status deployment/todo-app-backend -n todo-app
kubectl rollout status deployment/todo-app-frontend -n todo-app
```

### Database Backup

```bash
# Backup database to local file
kubectl exec -n todo-app todo-app-postgresql-0 -- \
  pg_dump -U todouser tododb > backup-$(date +%Y%m%d).sql

# Restore from backup
kubectl exec -i -n todo-app todo-app-postgresql-0 -- \
  psql -U todouser tododb < backup-20260114.sql
```

### Viewing Helm Release

```bash
# List all releases
helm list -n todo-app

# Get release values
helm get values todo-app -n todo-app

# Get all computed values (including defaults)
helm get values todo-app -n todo-app --all

# View release manifest
helm get manifest todo-app -n todo-app

# View release history
helm history todo-app -n todo-app

# Rollback to previous version
helm rollback todo-app -n todo-app
```

### Uninstalling the Application

```bash
# Uninstall Helm release
helm uninstall todo-app -n todo-app

# Delete namespace (removes all resources)
kubectl delete namespace todo-app

# Verify everything is removed
kubectl get all -n todo-app  # Should return "No resources found"
```

---

## Performance Optimization

### 1. Resource Tuning

```yaml
# custom-values.yaml
backend:
  resources:
    requests:
      memory: "512Mi"  # Increased for chatbot
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"

frontend:
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"
```

### 2. Enable Caching

```bash
# Add Redis cache (future enhancement)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis -n todo-app
```

### 3. Database Connection Pooling

The backend already uses SQLModel connection pooling:
- `pool_size=10` (persistent connections)
- `max_overflow=20` (additional connections)

---

## Production Considerations

**⚠️ This setup is for LOCAL DEVELOPMENT ONLY**

For production deployment, consider:

1. **Secrets Management**
   - Use external secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager)
   - Enable Sealed Secrets or External Secrets Operator

2. **Ingress Controller**
   - Install NGINX Ingress or Traefik
   - Configure TLS/SSL with cert-manager
   - Set up proper domain routing

3. **Persistent Storage**
   - Use cloud-managed databases (AWS RDS, Google Cloud SQL)
   - Enable backup strategies (automated snapshots)

4. **Monitoring & Logging**
   - Install Prometheus + Grafana for metrics
   - Set up ELK/EFK stack for centralized logging
   - Configure alerts for critical errors

5. **Security Hardening**
   - Enable Pod Security Policies
   - Use Network Policies for isolation
   - Scan images for vulnerabilities
   - Enable RBAC with least privilege

6. **High Availability**
   - Deploy to managed Kubernetes (EKS, GKE, AKS)
   - Use multi-zone deployments
   - Configure pod disruption budgets
   - Enable cluster autoscaling

---

## Useful Resources

- **Minikube Docs**: https://minikube.sigs.k8s.io/docs/
- **Helm Docs**: https://helm.sh/docs/
- **kubectl Cheat Sheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- **kubectl-ai**: https://github.com/sozercan/kubectl-ai
- **K8sGPT**: https://github.com/k8sgpt-ai/k8sgpt
- **Docker AI (Gordon)**: https://docs.docker.com/ai/

---

## Next Steps

After successful deployment:

1. **Explore the App**: Create tasks via chatbot, test filtering, dark mode
2. **Experiment with Scaling**: Scale up/down deployments, observe behavior
3. **Try AI Tools**: Use kubectl-ai and kagent for cluster operations
4. **Monitor Resources**: Check CPU/memory usage in Minikube dashboard
5. **Learn Helm**: Modify values.yaml, create custom configurations
6. **Contribute**: Add features, improve performance, enhance security

---

## 🎉 Congratulations!

You've successfully deployed a cloud-native Todo Chatbot application on Kubernetes using modern DevOps practices:

✅ Containerization with Docker
✅ Orchestration with Kubernetes
✅ Package Management with Helm
✅ AI-Assisted Operations with kubectl-ai and Kagent
✅ Local Development with Minikube

**Happy Cloud-Native Development!** 🚀

---

**Need Help?**

- Check [Troubleshooting](#troubleshooting) section
- Review pod logs: `kubectl logs -n todo-app <pod-name>`
- Use AI assistance: `kubectl-ai "help me debug todo-app"`
- Open an issue on GitHub


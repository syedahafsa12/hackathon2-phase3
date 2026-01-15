# 🚀 Phase 4: Quick Start Guide

**5-Minute Kubernetes Deployment**

---

## Prerequisites Check

Before starting, ensure you have:

- [ ] Docker Desktop 4.53+ installed and running
- [ ] Minikube 1.32+ installed
- [ ] kubectl 1.28+ installed
- [ ] Helm 3.12+ installed
- [ ] GROQ API Key (free from https://console.groq.com)

**Verify installations:**

```bash
docker --version
minikube version
kubectl version --client
helm version
```

---

## Option 1: Automated Deployment (Recommended)

**Single command deployment:**

```bash
./deploy-to-minikube.sh YOUR_GROQ_API_KEY
```

**What this does:**
1. ✅ Checks prerequisites
2. ✅ Starts Minikube (4 CPUs, 8GB RAM)
3. ✅ Builds Docker images
4. ✅ Installs Helm chart
5. ✅ Waits for pods to be ready
6. ✅ Shows access instructions

**Access the app:**

```bash
minikube service todo-app-frontend -n todo-app
```

**Test deployment:**

```bash
./test-deployment.sh
```

---

## Option 2: Manual Deployment

### Step 1: Start Minikube

```bash
minikube start --cpus=4 --memory=8192 --driver=docker
```

### Step 2: Build Images

```bash
# Switch to Minikube's Docker
eval $(minikube docker-env)

# Build backend
docker build -t todo-backend:latest -f backend/Dockerfile.k8s backend/

# Build frontend
docker build -t todo-frontend:latest frontend/
```

### Step 3: Deploy with Helm

```bash
# Add Helm repo
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install chart
helm install todo-app ./helm/todo-app \
  --set secrets.data.groq-api-key="YOUR_GROQ_API_KEY" \
  --create-namespace \
  --namespace todo-app
```

### Step 4: Wait for Ready

```bash
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=todo-app \
  -n todo-app \
  --timeout=300s
```

### Step 5: Access Application

```bash
minikube service todo-app-frontend -n todo-app
```

---

## Option 3: Docker Compose (Simpler Alternative)

**For quick local testing without Kubernetes:**

```bash
# Set API key
export GROQ_API_KEY="your-key"

# Start all services
docker-compose up -d

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8001/docs
```

---

## Common Commands

### View Status

```bash
# All pods
kubectl get pods -n todo-app

# All services
kubectl get services -n todo-app

# Helm releases
helm list -n todo-app
```

### View Logs

```bash
# Backend logs
kubectl logs -n todo-app -l app.kubernetes.io/component=backend -f

# Frontend logs
kubectl logs -n todo-app -l app.kubernetes.io/component=frontend -f

# Database logs
kubectl logs -n todo-app -l app.kubernetes.io/name=postgresql -f
```

### Scale Application

```bash
# Scale backend to 5 replicas
kubectl scale deployment todo-app-backend -n todo-app --replicas=5

# Or using kubectl-ai (if installed)
kubectl-ai "scale the backend to 5 replicas"
```

### Update Configuration

```bash
# Update with new API key
helm upgrade todo-app ./helm/todo-app \
  --set secrets.data.groq-api-key="new-key" \
  -n todo-app

# Restart pods
kubectl rollout restart deployment -n todo-app
```

### Access Backend API

```bash
# Port-forward
kubectl port-forward -n todo-app svc/todo-app-backend 8001:8001

# Then open: http://localhost:8001/docs
```

### Open Dashboard

```bash
minikube dashboard
```

---

## Troubleshooting

### Pods not starting?

```bash
# Check pod status
kubectl describe pod -n todo-app <pod-name>

# Check logs
kubectl logs -n todo-app <pod-name> --previous
```

### ImagePullBackOff error?

```bash
# Ensure images are built in Minikube
eval $(minikube docker-env)
docker images | grep todo

# Rebuild if needed
docker build -t todo-backend:latest -f backend/Dockerfile.k8s backend/
docker build -t todo-frontend:latest frontend/
```

### Can't access frontend?

```bash
# Get Minikube IP
minikube ip

# Frontend is at: http://<minikube-ip>:30000

# Or use service command
minikube service todo-app-frontend -n todo-app
```

### Database connection errors?

```bash
# Check PostgreSQL is running
kubectl get pods -n todo-app -l app.kubernetes.io/name=postgresql

# Check backend can reach database
kubectl exec -n todo-app <backend-pod> -- nc -zv todo-app-postgresql 5432
```

---

## Cleanup

### Uninstall Application

```bash
# Remove Helm release
helm uninstall todo-app -n todo-app

# Delete namespace
kubectl delete namespace todo-app
```

### Stop Minikube

```bash
minikube stop
```

### Delete Minikube Cluster

```bash
minikube delete
```

---

## Getting Help

**Detailed Documentation:**
- `MINIKUBE_DEPLOYMENT.md` - Complete deployment guide (500+ lines)
- `helm/README.md` - Helm chart documentation
- `PHASE4_SUMMARY.md` - Implementation summary

**AI-Assisted Debugging:**

```bash
# Using kubectl-ai
kubectl-ai "why are my todo-app pods failing"

# Using K8sGPT
k8sgpt analyze --explain --namespace todo-app

# Using Docker AI
docker ai "what's wrong with my backend container"
```

**View Deployment Notes:**

```bash
helm get notes todo-app -n todo-app
```

---

## Next Steps

After deployment:

1. ✅ Create an account at http://\<minikube-ip\>:30000
2. ✅ Add tasks via UI
3. ✅ Try the chatbot: "Add a task to buy groceries"
4. ✅ Test filtering and search
5. ✅ Enable dark mode
6. ✅ Try scaling: `kubectl scale deployment todo-app-backend -n todo-app --replicas=3`
7. ✅ View metrics in dashboard: `minikube dashboard`

---

## 🎉 That's It!

You now have a production-grade, cloud-native Todo Chatbot running on Kubernetes!

**Questions?** Check the detailed guides:
- `MINIKUBE_DEPLOYMENT.md` for in-depth instructions
- `helm/README.md` for chart configuration
- `PHASE4_SUMMARY.md` for technical details

**Happy Cloud-Native Development!** 🚀

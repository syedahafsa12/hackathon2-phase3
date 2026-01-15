# Phase 4: Complete Kubernetes Deployment Script for Windows
# This script completes the deployment after images are built

$GROQ_API_KEY = "your_groq_api_key_here"
$NAMESPACE = "todo-app"

Write-Host "=================================================="  -ForegroundColor Cyan
Write-Host "  Phase 4: Completing Kubernetes Deployment"  -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Helm chart structure
Write-Host "Step 1: Creating Helm charts..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "helm/todo-app/templates" | Out-Null

# Create Chart.yaml
@"
apiVersion: v2
name: todo-app
description: Cloud-Native Todo Chatbot with AI Capabilities
type: application
version: 1.0.0
appVersion: "1.0.0"
dependencies:
  - name: postgresql
    version: "15.x.x"
    repository: "https://charts.bitnami.com/bitnami"
"@ | Out-File -FilePath "helm/todo-app/Chart.yaml" -Encoding UTF8

# Create values.yaml
@"
backend:
  replicaCount: 2
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 8001
  env:
    JWT_SECRET: "phase4-super-secret-jwt-key-for-demo-purposes-only"
    JWT_ALGORITHM: "HS256"
    JWT_EXPIRATION_DAYS: "7"
    CORS_ORIGINS: "http://localhost:3000,http://localhost:30000"
    ENVIRONMENT: "production"

frontend:
  replicaCount: 2
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: IfNotPresent
  service:
    type: NodePort
    port: 3000
    nodePort: 30000

postgresql:
  enabled: true
  auth:
    username: todouser
    password: todopass123
    database: tododb
  primary:
    persistence:
      enabled: true
      size: 1Gi

secrets:
  data:
    groq-api-key: "your_groq_api_key_here"
"@ | Out-File -FilePath "helm/todo-app/values.yaml" -Encoding UTF8

Write-Host "Helm charts structure created" -ForegroundColor Green
Write-Host ""

# Step 2: Add Helm repositories
Write-Host "Step 2: Adding Helm repositories..." -ForegroundColor Yellow
helm repo add bitnami https://charts.bitnami.com/bitnami 2>$null
helm repo update
Write-Host "Helm repositories updated" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy the application
Write-Host "Step 3: Deploying application to Kubernetes..." -ForegroundColor Yellow
helm install $NAMESPACE ./helm/todo-app `
  --create-namespace `
  --namespace $NAMESPACE `
  --wait `
  --timeout 10m

Write-Host "Application deployed" -ForegroundColor Green
Write-Host ""

# Step 4: Wait for pods
Write-Host "Step 4: Waiting for all pods to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod `
  -l app.kubernetes.io/instance=$NAMESPACE `
  -n $NAMESPACE `
  --timeout=300s

Write-Host "All pods are ready" -ForegroundColor Green
Write-Host ""

# Step 5: Display deployment information
Write-Host "=================================================="  -ForegroundColor Cyan
Write-Host "  Deployment Complete!"  -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deployment Status:" -ForegroundColor Yellow
kubectl get pods -n $NAMESPACE

Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
kubectl get services -n $NAMESPACE

Write-Host ""
$MINIKUBE_IP = minikube ip
Write-Host "Access Your Application:" -ForegroundColor Green
Write-Host "   Frontend URL: http://$($MINIKUBE_IP):30000" -ForegroundColor Cyan
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Yellow
Write-Host "   View backend logs:  kubectl logs -n $NAMESPACE -l app.kubernetes.io/component=backend -f"
Write-Host "   View frontend logs: kubectl logs -n $NAMESPACE -l app.kubernetes.io/component=frontend -f"
Write-Host "   Open in browser:    minikube service $NAMESPACE-frontend -n $NAMESPACE"
Write-Host "   Kubernetes dashboard: minikube dashboard"
Write-Host ""

Write-Host "Phase 4 deployment successful!" -ForegroundColor Green

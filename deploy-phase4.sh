#!/bin/bash

# Phase 4: Complete Kubernetes Deployment Script
# This script automates the entire deployment process for the Todo Chatbot

set -e  # Exit on error

echo "=================================================="
echo "  Phase 4: Kubernetes Deployment Starting"
echo "=================================================="
echo ""

# Configuration
GROQ_API_KEY="$1"
NAMESPACE="todo-app"

if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ Error: GROQ API key is required"
    echo "Usage: ./deploy-phase4.sh YOUR_GROQ_API_KEY"
    exit 1
fi

echo "✅ GROQ API Key configured"
echo ""

# Step 1: Wait for Minikube to be ready
echo "📦 Step 1: Checking Minikube status..."
while ! minikube status > /dev/null 2>&1; do
    echo "⏳ Waiting for Minikube to start..."
    sleep 5
done
echo "✅ Minikube is running"
echo ""

# Step 2: Configure Docker to use Minikube's daemon
echo "🐳 Step 2: Configuring Docker environment..."
eval $(minikube docker-env)
echo "✅ Docker configured to use Minikube's daemon"
echo ""

# Step 3: Build Docker images
echo "🔨 Step 3: Building Docker images..."

# Build backend image
echo "  Building backend image..."
docker build -t todo-backend:latest -f backend/Dockerfile.k8s backend/
echo "  ✅ Backend image built"

# Build frontend image
echo "  Building frontend image..."
docker build -t todo-frontend:latest frontend/
echo "  ✅ Frontend image built"

# Verify images
echo "  Verifying images..."
docker images | grep todo
echo "✅ All images built successfully"
echo ""

# Step 4: Create Helm chart structure
echo "📋 Step 4: Creating Helm charts..."
mkdir -p helm/todo-app/templates

# Create Chart.yaml
cat > helm/todo-app/Chart.yaml <<EOF
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
EOF

# Create values.yaml
cat > helm/todo-app/values.yaml <<EOF
# Default values for todo-app

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
    groq-api-key: "${GROQ_API_KEY}"
EOF

# Create backend deployment
cat > helm/todo-app/templates/backend-deployment.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-backend
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/component: backend
spec:
  replicas: {{ .Values.backend.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: {{ .Chart.Name }}
      app.kubernetes.io/instance: {{ .Release.Name }}
      app.kubernetes.io/component: backend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: {{ .Chart.Name }}
        app.kubernetes.io/instance: {{ .Release.Name }}
        app.kubernetes.io/component: backend
    spec:
      containers:
      - name: backend
        image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
        ports:
        - name: http
          containerPort: 8001
          protocol: TCP
        env:
        - name: DATABASE_URL
          value: "postgresql://{{ .Values.postgresql.auth.username }}:{{ .Values.postgresql.auth.password }}@{{ .Release.Name }}-postgresql:5432/{{ .Values.postgresql.auth.database }}"
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: {{ .Release.Name }}-secrets
              key: groq-api-key
        - name: JWT_SECRET
          value: "{{ .Values.backend.env.JWT_SECRET }}"
        - name: JWT_ALGORITHM
          value: "{{ .Values.backend.env.JWT_ALGORITHM }}"
        - name: JWT_EXPIRATION_DAYS
          value: "{{ .Values.backend.env.JWT_EXPIRATION_DAYS }}"
        - name: CORS_ORIGINS
          value: "{{ .Values.backend.env.CORS_ORIGINS }}"
        - name: ENVIRONMENT
          value: "{{ .Values.backend.env.ENVIRONMENT }}"
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
EOF

# Create backend service
cat > helm/todo-app/templates/backend-service.yaml <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-backend
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/component: backend
spec:
  type: {{ .Values.backend.service.type }}
  ports:
  - port: {{ .Values.backend.service.port }}
    targetPort: http
    protocol: TCP
    name: http
  selector:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/component: backend
EOF

# Create frontend deployment
cat > helm/todo-app/templates/frontend-deployment.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-frontend
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/component: frontend
spec:
  replicas: {{ .Values.frontend.replicaCount }}
  selector:
    matchLabels:
      app.kubernetes.io/name: {{ .Chart.Name }}
      app.kubernetes.io/instance: {{ .Release.Name }}
      app.kubernetes.io/component: frontend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: {{ .Chart.Name }}
        app.kubernetes.io/instance: {{ .Release.Name }}
        app.kubernetes.io/component: frontend
    spec:
      containers:
      - name: frontend
        image: "{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}"
        imagePullPolicy: {{ .Values.frontend.image.pullPolicy }}
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://{{ .Release.Name }}-backend:{{ .Values.backend.service.port }}"
EOF

# Create frontend service
cat > helm/todo-app/templates/frontend-service.yaml <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-frontend
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/component: frontend
spec:
  type: {{ .Values.frontend.service.type }}
  ports:
  - port: {{ .Values.frontend.service.port }}
    targetPort: http
    protocol: TCP
    name: http
    {{- if eq .Values.frontend.service.type "NodePort" }}
    nodePort: {{ .Values.frontend.service.nodePort }}
    {{- end }}
  selector:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/component: frontend
EOF

# Create secrets
cat > helm/todo-app/templates/secrets.yaml <<'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-secrets
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
type: Opaque
stringData:
  groq-api-key: "{{ .Values.secrets.data.groq-api-key }}"
EOF

echo "✅ Helm charts created"
echo ""

# Step 5: Add Helm repositories
echo "📚 Step 5: Adding Helm repositories..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
echo "✅ Helm repositories updated"
echo ""

# Step 6: Install the application
echo "🚀 Step 6: Deploying application to Kubernetes..."
helm install $NAMESPACE ./helm/todo-app \
  --create-namespace \
  --namespace $NAMESPACE \
  --wait \
  --timeout 10m

echo "✅ Application deployed"
echo ""

# Step 7: Wait for pods to be ready
echo "⏳ Step 7: Waiting for all pods to be ready..."
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=$NAMESPACE \
  -n $NAMESPACE \
  --timeout=300s
echo "✅ All pods are ready"
echo ""

# Step 8: Display deployment information
echo "=================================================="
echo "  🎉 Deployment Complete!"
echo "=================================================="
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE
echo ""
echo "🌐 Services:"
kubectl get services -n $NAMESPACE
echo ""
echo "🔗 Access Your Application:"
echo "   Frontend URL: http://$(minikube ip):30000"
echo ""
echo "📝 Useful Commands:"
echo "   View logs (backend):  kubectl logs -n $NAMESPACE -l app.kubernetes.io/component=backend -f"
echo "   View logs (frontend): kubectl logs -n $NAMESPACE -l app.kubernetes.io/component=frontend -f"
echo "   Open in browser:      minikube service $NAMESPACE-frontend -n $NAMESPACE"
echo "   Kubernetes dashboard: minikube dashboard"
echo ""
echo "✅ Phase 4 deployment successful!"

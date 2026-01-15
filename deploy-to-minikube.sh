#!/bin/bash

# ============================================================================
# Automated Deployment Script for Minikube
# Phase 4: Kubernetes Deployment
#
# Usage: ./deploy-to-minikube.sh [GROQ_API_KEY]
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="todo-app"
RELEASE_NAME="todo-app"
CHART_PATH="./helm/todo-app"

# Functions
print_header() {
    echo -e "${CYAN}"
    echo "════════════════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "════════════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
    print_success "$1 is installed"
}

# Start
print_header "Todo Chatbot - Minikube Deployment Script"

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

check_command "minikube"
check_command "kubectl"
check_command "helm"
check_command "docker"

# Get GROQ_API_KEY from argument or prompt
if [ -z "$1" ]; then
    print_warning "GROQ_API_KEY not provided as argument"
    echo -ne "${YELLOW}Enter your Groq API Key (or press Enter to skip): ${NC}"
    read GROQ_API_KEY
else
    GROQ_API_KEY="$1"
    print_success "Using GROQ_API_KEY from argument"
fi

# Step 2: Start Minikube
print_header "Step 2: Starting Minikube"

if minikube status | grep -q "Running"; then
    print_success "Minikube is already running"
else
    print_info "Starting Minikube with 4 CPUs and 8GB RAM..."
    minikube start --cpus=4 --memory=8192 --driver=docker
    print_success "Minikube started successfully"
fi

# Enable addons
print_info "Enabling Minikube addons..."
minikube addons enable metrics-server
minikube addons enable dashboard
print_success "Addons enabled"

# Step 3: Build Docker images
print_header "Step 3: Building Docker Images"

print_info "Switching to Minikube's Docker daemon..."
eval $(minikube docker-env)

print_info "Building backend image..."
docker build -t todo-backend:latest -f backend/Dockerfile.k8s backend/
print_success "Backend image built"

print_info "Building frontend image..."
docker build -t todo-frontend:latest frontend/
print_success "Frontend image built"

print_info "Verifying images..."
docker images | grep "todo-"
print_success "Images verified"

# Step 4: Add Helm repositories
print_header "Step 4: Setting up Helm"

print_info "Adding Bitnami repository..."
helm repo add bitnami https://charts.bitnami.com/bitnami 2>/dev/null || true
helm repo update
print_success "Helm repositories updated"

# Step 5: Install application
print_header "Step 5: Deploying Application"

print_info "Creating namespace: $NAMESPACE"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

print_info "Installing Helm chart..."

if [ -n "$GROQ_API_KEY" ]; then
    helm upgrade --install $RELEASE_NAME $CHART_PATH \
        --namespace $NAMESPACE \
        --set secrets.data.groq-api-key="$GROQ_API_KEY" \
        --set backend.env.JWT_SECRET="$(openssl rand -base64 32)" \
        --timeout 10m \
        --wait
    print_success "Application deployed with GROQ_API_KEY"
else
    print_warning "Deploying without GROQ_API_KEY (chatbot will not work)"
    helm upgrade --install $RELEASE_NAME $CHART_PATH \
        --namespace $NAMESPACE \
        --set backend.env.JWT_SECRET="$(openssl rand -base64 32)" \
        --timeout 10m \
        --wait
fi

# Step 6: Verify deployment
print_header "Step 6: Verifying Deployment"

print_info "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/instance=$RELEASE_NAME \
    -n $NAMESPACE \
    --timeout=300s

print_success "All pods are ready!"

# Show deployment status
echo ""
print_info "Deployment Status:"
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE

# Step 7: Access instructions
print_header "Step 7: Access the Application"

MINIKUBE_IP=$(minikube ip)
NODEPORT=30000

echo ""
print_success "✨ Deployment Complete! ✨"
echo ""
echo -e "${GREEN}Access the application:${NC}"
echo ""
echo -e "  ${CYAN}Method 1 (Recommended):${NC}"
echo -e "    minikube service ${RELEASE_NAME}-frontend -n ${NAMESPACE}"
echo ""
echo -e "  ${CYAN}Method 2 (Direct URL):${NC}"
echo -e "    http://${MINIKUBE_IP}:${NODEPORT}"
echo ""
echo -e "  ${CYAN}Backend API Docs:${NC}"
echo -e "    kubectl port-forward -n ${NAMESPACE} svc/${RELEASE_NAME}-backend 8001:8001"
echo -e "    Then open: http://localhost:8001/docs"
echo ""

print_info "View logs:"
echo "  kubectl logs -n ${NAMESPACE} -l app.kubernetes.io/component=backend -f"
echo "  kubectl logs -n ${NAMESPACE} -l app.kubernetes.io/component=frontend -f"
echo ""

print_info "Kubernetes Dashboard:"
echo "  minikube dashboard"
echo ""

if [ -z "$GROQ_API_KEY" ]; then
    echo ""
    print_warning "IMPORTANT: Chatbot will not work without GROQ_API_KEY!"
    echo ""
    echo "To add it later, run:"
    echo "  helm upgrade ${RELEASE_NAME} ${CHART_PATH} \\"
    echo "    --set secrets.data.groq-api-key=\"your-key\" \\"
    echo "    -n ${NAMESPACE}"
    echo ""
fi

print_header "Deployment Complete! 🚀"

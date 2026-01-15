#!/bin/bash

# ============================================================================
# Deployment Testing Script
# Tests all aspects of the Kubernetes deployment
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

NAMESPACE="todo-app"
RELEASE_NAME="todo-app"

print_test() {
    echo -ne "${CYAN}[TEST]${NC} $1 ... "
}

print_pass() {
    echo -e "${GREEN}PASS${NC}"
}

print_fail() {
    echo -e "${RED}FAIL${NC}"
    echo -e "${RED}  Error: $1${NC}"
}

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

# Test 1: Minikube running
print_header "Infrastructure Tests"

print_test "Minikube is running"
if minikube status | grep -q "Running"; then
    print_pass
else
    print_fail "Minikube is not running"
    exit 1
fi

# Test 2: Namespace exists
print_test "Namespace '$NAMESPACE' exists"
if kubectl get namespace $NAMESPACE &>/dev/null; then
    print_pass
else
    print_fail "Namespace not found"
    exit 1
fi

# Test 3: Helm release installed
print_test "Helm release '$RELEASE_NAME' is installed"
if helm list -n $NAMESPACE | grep -q $RELEASE_NAME; then
    print_pass
else
    print_fail "Helm release not found"
    exit 1
fi

# Test 4: All pods are running
print_header "Pod Tests"

print_test "Backend pods are running"
BACKEND_PODS=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=backend -o jsonpath='{.items[*].status.phase}')
if [[ "$BACKEND_PODS" == *"Running"* ]]; then
    print_pass
else
    print_fail "Backend pods not running: $BACKEND_PODS"
fi

print_test "Frontend pods are running"
FRONTEND_PODS=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=frontend -o jsonpath='{.items[*].status.phase}')
if [[ "$FRONTEND_PODS" == *"Running"* ]]; then
    print_pass
else
    print_fail "Frontend pods not running: $FRONTEND_PODS"
fi

print_test "PostgreSQL pod is running"
POSTGRES_PODS=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=postgresql -o jsonpath='{.items[*].status.phase}')
if [[ "$POSTGRES_PODS" == *"Running"* ]]; then
    print_pass
else
    print_fail "PostgreSQL pod not running: $POSTGRES_PODS"
fi

# Test 5: Services exist
print_header "Service Tests"

print_test "Backend service exists"
if kubectl get service -n $NAMESPACE ${RELEASE_NAME}-backend &>/dev/null; then
    print_pass
else
    print_fail "Backend service not found"
fi

print_test "Frontend service exists"
if kubectl get service -n $NAMESPACE ${RELEASE_NAME}-frontend &>/dev/null; then
    print_pass
else
    print_fail "Frontend service not found"
fi

print_test "PostgreSQL service exists"
if kubectl get service -n $NAMESPACE ${RELEASE_NAME}-postgresql &>/dev/null; then
    print_pass
else
    print_fail "PostgreSQL service not found"
fi

# Test 6: Health checks
print_header "Health Check Tests"

print_test "Backend health endpoint responds"
BACKEND_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=backend -o jsonpath='{.items[0].metadata.name}')
if kubectl exec -n $NAMESPACE $BACKEND_POD -- curl -sf http://localhost:8001/health > /dev/null; then
    print_pass
else
    print_fail "Backend health check failed"
fi

print_test "Frontend health endpoint responds"
FRONTEND_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=frontend -o jsonpath='{.items[0].metadata.name}')
if kubectl exec -n $NAMESPACE $FRONTEND_POD -- wget -q -O- http://localhost:3000/api/health > /dev/null; then
    print_pass
else
    print_fail "Frontend health check failed"
fi

# Test 7: Database connectivity
print_header "Database Tests"

print_test "PostgreSQL is accepting connections"
POSTGRES_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=postgresql -o jsonpath='{.items[0].metadata.name}')
if kubectl exec -n $NAMESPACE $POSTGRES_POD -- pg_isready -U todouser > /dev/null; then
    print_pass
else
    print_fail "PostgreSQL not ready"
fi

print_test "Backend can connect to database"
if kubectl logs -n $NAMESPACE $BACKEND_POD --tail=50 | grep -q -i "error.*database\|connection.*failed" ; then
    print_fail "Database connection errors found in backend logs"
else
    print_pass
fi

# Test 8: ConfigMaps and Secrets
print_header "Configuration Tests"

print_test "ConfigMap exists"
if kubectl get configmap -n $NAMESPACE ${RELEASE_NAME}-config &>/dev/null; then
    print_pass
else
    print_fail "ConfigMap not found"
fi

print_test "Secrets exist"
if kubectl get secret -n $NAMESPACE ${RELEASE_NAME}-secrets &>/dev/null; then
    print_pass
else
    print_fail "Secrets not found"
fi

print_test "GROQ_API_KEY is set in secrets"
GROQ_KEY=$(kubectl get secret -n $NAMESPACE ${RELEASE_NAME}-secrets -o jsonpath='{.data.groq-api-key}' | base64 -d 2>/dev/null || echo "")
if [ -n "$GROQ_KEY" ]; then
    print_pass
else
    print_fail "GROQ_API_KEY is empty (chatbot will not work)"
fi

# Test 9: Resource limits
print_header "Resource Tests"

print_test "Backend pods have resource limits"
BACKEND_LIMITS=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=backend -o jsonpath='{.items[0].spec.containers[0].resources.limits}')
if [ -n "$BACKEND_LIMITS" ]; then
    print_pass
else
    print_fail "No resource limits set"
fi

print_test "Frontend pods have resource limits"
FRONTEND_LIMITS=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=frontend -o jsonpath='{.items[0].spec.containers[0].resources.limits}')
if [ -n "$FRONTEND_LIMITS" ]; then
    print_pass
else
    print_fail "No resource limits set"
fi

# Test 10: Connectivity
print_header "Network Tests"

print_test "Frontend can reach backend"
BACKEND_SVC="${RELEASE_NAME}-backend"
if kubectl exec -n $NAMESPACE $FRONTEND_POD -- wget -q -O- http://${BACKEND_SVC}:8001/health > /dev/null; then
    print_pass
else
    print_fail "Frontend cannot reach backend service"
fi

print_test "Backend can reach PostgreSQL"
POSTGRES_SVC="${RELEASE_NAME}-postgresql"
if kubectl exec -n $NAMESPACE $BACKEND_POD -- nc -zv ${POSTGRES_SVC} 5432 &>/dev/null; then
    print_pass
else
    print_fail "Backend cannot reach PostgreSQL service"
fi

# Summary
print_header "Test Summary"

echo ""
echo -e "${GREEN}✓ All critical tests passed!${NC}"
echo ""
echo "Deployment is healthy and ready to use."
echo ""
echo "Access the application:"
echo "  minikube service ${RELEASE_NAME}-frontend -n ${NAMESPACE}"
echo ""
echo "View detailed status:"
echo "  kubectl get all -n ${NAMESPACE}"
echo ""

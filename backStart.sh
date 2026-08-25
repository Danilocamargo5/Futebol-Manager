#!/bin/bash

# Backend Start - API Server na porta 8000

PROJECT_ROOT="$(dirname "$0")"

echo "🚀 Iniciando API Server (Backend)..."

# Verificar se precisa instalar
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "📦 Instalando dependências (primeira vez)..."
    cd "$PROJECT_ROOT"
    pnpm install
fi

cd "$PROJECT_ROOT/artifacts/api-server"

echo "📡 Acesse: http://localhost:8000"
echo ""
echo "Para parar: Ctrl+C ou execute ./backStop.sh"
echo ""

PORT=8000 pnpm dev

#!/bin/bash

# Frontend Start - Pelada Pro na porta 5173

PROJECT_ROOT="$(dirname "$0")"

echo "🚀 Iniciando Pelada Pro (Frontend)..."

# Verificar se precisa instalar
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "📦 Instalando dependências (primeira vez)..."
    cd "$PROJECT_ROOT"
    pnpm install
fi

cd "$PROJECT_ROOT/artifacts/pelada-pro"

echo "📱 Acesse: http://localhost:5173"
echo ""
echo "Para parar: Ctrl+C ou execute ./frontStop.sh"
echo ""

PORT=5173 pnpm dev

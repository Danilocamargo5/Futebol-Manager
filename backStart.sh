#!/bin/bash

# Backend Start - API Server na porta 8000

cd "$(dirname "$0")/artifacts/api-server"

echo "🚀 Iniciando API Server (Backend)..."
echo "📡 Acesse: http://localhost:8000"
echo ""
echo "Para parar: Ctrl+C ou execute ./backStop.sh"
echo ""

PORT=8000 pnpm dev

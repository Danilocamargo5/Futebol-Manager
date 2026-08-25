#!/bin/bash

# Frontend Start - Pelada Pro na porta 5173

cd "$(dirname "$0")/artifacts/pelada-pro"

echo "🚀 Iniciando Pelada Pro (Frontend)..."
echo "📱 Acesse: http://localhost:5173"
echo ""
echo "Para parar: Ctrl+C ou execute ./frontStop.sh"
echo ""

PORT=5173 pnpm dev

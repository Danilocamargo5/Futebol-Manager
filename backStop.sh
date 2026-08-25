#!/bin/bash

# Backend Stop - Para API Server

echo "🛑 Parando API Server (Backend)..."

# Matar processo na porta 8000
lsof -ti :8000 | xargs kill -9 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ API Server parado!"
else
    echo "⚠️  Nenhum processo rodando na porta 8000"
fi

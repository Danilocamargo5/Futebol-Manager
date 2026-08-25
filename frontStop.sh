#!/bin/bash

# Frontend Stop - Para Pelada Pro

echo "🛑 Parando Pelada Pro (Frontend)..."

# Matar processo na porta 5173
lsof -ti :5173 | xargs kill -9 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Pelada Pro parado!"
else
    echo "⚠️  Nenhum processo rodando na porta 5173"
fi

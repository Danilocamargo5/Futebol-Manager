#!/bin/bash

# Setup - Instalar todas as dependências

echo "📦 Instalando dependências do Futebol-Manager..."
echo ""

cd "$(dirname "$0")"

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm não encontrado. Instalando..."
    npm install -g pnpm
fi

# Instalar
pnpm install

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "Agora você pode rodar:"
echo "  ./frontStart.sh  - Subir Frontend"
echo "  ./backStart.sh   - Subir Backend"

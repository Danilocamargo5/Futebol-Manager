#!/bin/bash

# Script para validar e instalar todas as dependências
# Funciona em qualquer ambiente (Codespaces, local, etc)

set -e

echo "🚀 Inicializando Futebol-Manager..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funções de validação
check_command() {
    if command -v $1 &> /dev/null; then
        VERSION=$($1 --version 2>/dev/null | head -n1)
        echo -e "${GREEN}✅ $1${NC}: $VERSION"
        return 0
    else
        echo -e "${RED}❌ $1${NC}: Não encontrado"
        return 1
    fi
}

install_apt() {
    if command -v apt &> /dev/null; then
        echo -e "${YELLOW}📦 Instalando $1 via apt...${NC}"
        sudo apt update > /dev/null
        sudo apt install -y $1 > /dev/null
        echo -e "${GREEN}✅ $1 instalado!${NC}"
    else
        echo -e "${RED}❌ apt não disponível${NC}"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Verificando dependências..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Validar Node.js
if ! check_command node; then
    echo -e "${YELLOW}📥 Instalando Node.js...${NC}"
    install_apt nodejs
fi

# Validar npm
if ! check_command npm; then
    echo -e "${YELLOW}📥 Instalando npm...${NC}"
    install_apt npm
fi

# Validar git
if ! check_command git; then
    echo -e "${YELLOW}📥 Instalando git...${NC}"
    install_apt git
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Instalando pnpm globalmente..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm install -g pnpm > /dev/null 2>&1 || true
pnpm --version

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Instalando dependências do projeto..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

pnpm install

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Tudo pronto!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Próximos passos:"
echo ""
echo "Terminal 1 (Backend):"
echo "  ./backStart.sh"
echo ""
echo "Terminal 2 (Frontend):"
echo "  ./frontStart.sh"
echo ""
echo "🌐 Acesse: http://localhost:5173"
echo ""

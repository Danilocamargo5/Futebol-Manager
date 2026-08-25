#!/bin/bash

# Script para iniciar/parar o Futebol-Manager com um comando simples
# Uso: ./dev.sh start  ou  ./dev.sh stop

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_ROOT/.dev.pid"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

start_servers() {
    echo -e "${YELLOW}🚀 Iniciando Futebol-Manager...${NC}"
    
    # Verificar se já está rodando
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${RED}❌ Servidor já está rodando (PID: $PID)${NC}"
            echo "Use: $0 stop"
            return 1
        else
            rm "$PID_FILE"
        fi
    fi
    
    cd "$PROJECT_ROOT"
    
    # Instalar se precisar
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependências...${NC}"
        pnpm install
    fi
    
    # Iniciar com concurrently em background
    pnpm start > /tmp/futebol-manager.log 2>&1 &
    echo $! > "$PID_FILE"
    
    echo -e "${GREEN}✅ Servidores iniciados!${NC}"
    echo ""
    echo "📡 API Server: http://localhost:8000"
    echo "🎮 Pelada Pro: http://localhost:5173"
    echo ""
    echo "Para parar: $0 stop"
    echo "Logs: tail -f /tmp/futebol-manager.log"
}

stop_servers() {
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${RED}❌ Nenhum servidor em execução${NC}"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}🛑 Parando servidores (PID: $PID)...${NC}"
        kill "$PID" 2>/dev/null || true
        rm "$PID_FILE"
        echo -e "${GREEN}✅ Servidores parados!${NC}"
    else
        echo -e "${RED}❌ Processo não encontrado${NC}"
        rm "$PID_FILE"
    fi
}

status_servers() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo -e "${GREEN}✅ Servidores rodando (PID: $PID)${NC}"
            return 0
        else
            echo -e "${RED}❌ Processo parado (PID antigo no arquivo)${NC}"
            rm "$PID_FILE"
            return 1
        fi
    else
        echo -e "${RED}❌ Nenhum servidor em execução${NC}"
        return 1
    fi
}

case "${1:-start}" in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    status)
        status_servers
        ;;
    restart)
        stop_servers
        sleep 1
        start_servers
        ;;
    logs)
        tail -f /tmp/futebol-manager.log
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Exemplos:"
        echo "  $0 start      - Iniciar servidores"
        echo "  $0 stop       - Parar servidores"
        echo "  $0 restart    - Reiniciar servidores"
        echo "  $0 status     - Ver status"
        echo "  $0 logs       - Ver logs em tempo real"
        exit 1
        ;;
esac

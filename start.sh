#!/bin/bash


GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'


echo -e "${CYAN} Starting G-RANK...${NC}"
echo ""

ROOT_DIR=$(pwd)

CLEANUP_DONE=0

cleanup() {
    if [ $CLEANUP_DONE -eq 0 ]; then
        CLEANUP_DONE=1
        echo ""
        echo -e "${RED} Stopping services...${NC}"
        kill 0 2>/dev/null
        exit
    fi
}

trap cleanup SIGINT SIGTERM

if [ ! -d "$ROOT_DIR/backend" ]; then
    echo -e "${YELLOW}  Warning:${NC} Backend folder not found"
    exit 1
fi

if [ ! -d "$ROOT_DIR/frontend" ]; then
    echo -e "${YELLOW}  Warning:${NC} Frontend folder not found"
    exit 1
fi

echo -e "${BLUE}[BACKEND]${NC} Starting backend server with nodemon..."
(cd "$ROOT_DIR/backend" && npm run dev) &
BACKEND_PID=$!

sleep 3

echo -e "${GREEN}[FRONTEND]${NC} Starting frontend server with Vite..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN} Services started successfully:${NC}"
echo -e "   ${BLUE}Backend:${NC}  http://localhost:5000 (Node.js + Express)"
echo -e "   ${GREEN}Frontend:${NC} http://localhost:5173 (Vite + React)"
echo ""
echo -e "${YELLOW} Tip:${NC} Make sure you have configured the .env file in the backend folder"
echo ""
echo -e "${CYAN}Press Ctrl+C to stop both services${NC}"

wait $BACKEND_PID $FRONTEND_PID

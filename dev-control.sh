#!/bin/bash

PROJECT_NAME="tgp-agent"
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Function to kill all project-related processes
stop_dev() {
    echo "STOPPING Stopping TGP Agent development servers..."
    
    # Kill processes by port
    if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
        echo "  Killing backend on port $BACKEND_PORT"
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    fi
    
    if lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "  Killing frontend on port $FRONTEND_PORT"
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill by process name patterns
    pkill -f "$PROJECT_NAME.*tsx" 2>/dev/null || true
    pkill -f "$PROJECT_NAME.*vite" 2>/dev/null || true
    pkill -f "$PROJECT_NAME.*esbuild" 2>/dev/null || true
    pkill -f "$PROJECT_NAME.*node" 2>/dev/null || true
    
    # Wait a moment for cleanup
    sleep 2
    
    echo "DONE All processes stopped"
}

# Function to start development servers
start_dev() {
    echo "STARTING Starting TGP Agent development servers..."
    
    # Check if ports are free
    if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
        echo "❌ Port $BACKEND_PORT is already in use"
        exit 1
    fi
    
    if lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "❌ Port $FRONTEND_PORT is already in use"
        exit 1
    fi
    
    # Start backend in background
    echo "  Starting backend on port $BACKEND_PORT..."
    npm run dev:backend > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 3
    
    # Check if backend started successfully
    if ! lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
        echo "❌ Backend failed to start. Check backend.log"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    # Start frontend in background
    echo "  Starting frontend on port $FRONTEND_PORT..."
    npm run dev:frontend > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    sleep 3
    
    # Check if frontend started successfully
    if ! lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "❌ Frontend failed to start. Check frontend.log"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    
    echo "DONE Development servers started successfully!"
    echo "  Web: Frontend: http://localhost:$FRONTEND_PORT"
    echo "  API: Backend:  http://localhost:$BACKEND_PORT"
    echo "  Logs: Logs: backend.log, frontend.log"
    echo ""
    echo "  To stop: ./dev-control.sh stop"
    echo "  To restart: ./dev-control.sh restart"
}

# Function to check status
status_dev() {
    echo "Status: TGP Agent Development Status:"
    
    if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
        echo "  DONE Backend running on port $BACKEND_PORT"
    else
        echo "  ❌ Backend not running"
    fi
    
    if lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "  DONE Frontend running on port $FRONTEND_PORT"
    else
        echo "  ❌ Frontend not running"
    fi
}

# Function to restart
restart_dev() {
    stop_dev
    sleep 1
    start_dev
}

# Main script logic
case "$1" in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        restart_dev
        ;;
    status)
        status_dev
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start both frontend and backend servers"
        echo "  stop    - Stop all development servers"
        echo "  restart - Stop and start servers"
        echo "  status  - Check if servers are running"
        exit 1
        ;;
esac

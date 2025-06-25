#!/bin/bash

# TGP Agent - Single run script
# Usage: ./run.sh [dev|build|prod|stop|logs|status]

set -e

COMMAND=${1:-dev}
BACKEND_PORT=3001
FRONTEND_PORT=3000
LOG_FILE="/tmp/tgp-agent.log"

case $COMMAND in
  dev)
    echo "🚀 Starting development mode..."
    # Stop any existing processes
    pkill -f "vite.*--port $FRONTEND_PORT" 2>/dev/null || true
    pkill -f "tsx.*web-server" 2>/dev/null || true
    
    # Start both frontend and backend
    echo "  Starting backend on port $BACKEND_PORT..."
    nohup npx tsx src/web-server.ts > backend-dev.log 2>&1 &
    
    echo "  Starting frontend on port $FRONTEND_PORT..."
    npx vite --host 127.0.0.1 --port $FRONTEND_PORT
    ;;
    
  build)
    echo "🏗️  Building production assets..."
    rm -rf dist/
    npx vite build
    echo "✅ Build complete! Files in dist/"
    ;;
    
  prod)
    echo "🚀 Starting production server..."
    # Stop existing server
    pkill -f "tsx.*web-server" 2>/dev/null || true
    sleep 1
    
    # Build if needed
    if [ ! -f "dist/index.html" ]; then
      echo "  Building frontend first..."
      npx vite build
    fi
    
    # Start production server
    nohup npx tsx src/web-server.ts > $LOG_FILE 2>&1 &
    sleep 2
    
    if ps aux | grep -E "tsx.*web-server" | grep -v grep > /dev/null; then
      echo "✅ Server running on http://localhost:$BACKEND_PORT"
      echo "📝 Logs: $LOG_FILE"
    else
      echo "❌ Failed to start server!"
      tail -20 $LOG_FILE
      exit 1
    fi
    ;;
    
  stop)
    echo "🛑 Stopping all processes..."
    pkill -f "vite" 2>/dev/null || true
    pkill -f "tsx.*web-server" 2>/dev/null || true
    pkill -f "npm.*vite" 2>/dev/null || true
    echo "✅ All processes stopped"
    ;;
    
  logs)
    echo "📝 Production logs:"
    tail -f $LOG_FILE
    ;;
    
  status)
    echo "📊 Status check:"
    if ps aux | grep -E "tsx.*web-server" | grep -v grep > /dev/null; then
      echo "✅ Backend: Running"
    else
      echo "❌ Backend: Not running"
    fi
    
    if ps aux | grep -E "vite.*--port $FRONTEND_PORT" | grep -v grep > /dev/null; then
      echo "✅ Frontend dev: Running"
    else
      echo "❌ Frontend dev: Not running"
    fi
    
    # Check if server responds
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/simple | grep -q "200"; then
      echo "✅ Server responding on port $BACKEND_PORT"
    else
      echo "❌ Server not responding"
    fi
    ;;
    
  *)
    echo "TGP Agent Runner"
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev    - Start development mode (frontend + backend)"
    echo "  build  - Build production assets"
    echo "  prod   - Start production server"
    echo "  stop   - Stop all processes"
    echo "  logs   - View production logs"
    echo "  status - Check process status"
    ;;
esac
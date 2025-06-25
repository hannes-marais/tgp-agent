#!/bin/bash

echo "🚀 Deploying TGP Agent to production..."

# Build frontend
echo "  🏗️  Building frontend..."
npx vite build

# Check if built files exist
if [ ! -f "dist/index.html" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"

# Stop existing production server
echo "  🛑 Stopping existing production server..."
pkill -f 'node.*web-server' || true
pkill -f 'tsx.*web-server' || true

# Wait a moment for cleanup
sleep 2

# Start production server
echo "  🚀 Starting production server..."
nohup npm run web > /tmp/tgp-agent.log 2>&1 &

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if ps aux | grep -E "(node|tsx).*web-server" | grep -v grep > /dev/null; then
    echo "✅ Production server started successfully!"
    echo "📊 Server running on http://localhost:3001"
    echo "🌐 Live site: https://tgp.mxnxp.com"
    echo "📝 Logs: tail -f /tmp/tgp-agent.log"
else
    echo "❌ Failed to start production server!"
    echo "📝 Check logs: cat /tmp/tgp-agent.log"
    exit 1
fi

echo ""
echo "📁 Built files:"
ls -la dist/

echo ""
echo "✅ Deployment completed successfully!"

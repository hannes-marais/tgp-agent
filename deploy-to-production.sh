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

# The backend web-server.ts will serve the built frontend files from dist/
# and handle API endpoints - this matches your OpenResty config

echo ""
echo "📁 Built files:"
ls -la dist/

echo ""
echo "🔄 Your current OpenResty config proxies:"
echo "  https://tgp.mxnxp.com/ → http://localhost:3001/"
echo "  https://tgp.mxnxp.com/api/ → http://localhost:3001/api/"
echo ""
echo "🚀 To deploy to production:"
echo "  1. Stop any existing backend: pkill -f 'node.*web-server'"
echo "  2. Start the backend: nohup npm run web > /tmp/tgp-agent.log 2>&1 &"
echo "  3. Check logs: tail -f /tmp/tgp-agent.log"
echo ""
echo "✅ Ready for deployment!"

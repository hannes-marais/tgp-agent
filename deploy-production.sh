#!/bin/bash

echo "🚀 Building TGP Agent for production deployment..."

# Stop development servers
./dev-control.sh stop 2>/dev/null || true

# Clean previous build
echo "  🧹 Cleaning previous build..."
rm -rf dist/

# Install production dependencies
echo "  📦 Installing dependencies..."
npm ci --only=production

# Build frontend with Vite
echo "  🏗️  Building frontend..."
npx vite build

# Build backend TypeScript
echo "  🔧 Building backend..."
npx tsc

echo "✅ Production build completed!"
echo ""
echo "📁 Files ready in:"
echo "  - Frontend: dist/ (static files)"
echo "  - Backend: dist/web-server.js"
echo ""
echo "🔧 OpenResty/Nginx configuration suggestion:"
echo ""
cat << 'NGINX_CONFIG'
# Add to your OpenResty/Nginx server block:

location / {
    # Serve static files from dist directory
    try_files $uri $uri/ /index.html;
    root /path/to/tgp-agent/dist;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Proxy API requests to Node.js backend
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Important for streaming responses
    proxy_buffering off;
    proxy_cache off;
}

NGINX_CONFIG

echo ""
echo "🚀 To start the production backend:"
echo "  node dist/web-server.js"
echo ""
echo "💡 The backend will run on http://127.0.0.1:3001"
echo "   Configure your web proxy to forward /api/ requests to this address"

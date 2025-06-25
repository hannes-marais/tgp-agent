#!/bin/bash

PRODUCTION_URL="https://tgp.mxnxp.com"

echo "🏥 Health Check for TGP Agent"
echo "================================"

# Test main page
echo -n "📄 Main page: "
if curl -s -f "$PRODUCTION_URL" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test API endpoints
echo -n "🔧 OpenAI API: "
if curl -s -f -X POST "$PRODUCTION_URL/api/chat/openai" \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"health check"}]}' \
    --max-time 10 > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo -n "🤖 Anthropic API: "
if curl -s -f -X POST "$PRODUCTION_URL/api/chat/anthropic" \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"health check"}]}' \
    --max-time 10 > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test simple chat page
echo -n "💬 Simple chat: "
if curl -s -f "$PRODUCTION_URL/simple" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo ""
echo "🌐 Site: $PRODUCTION_URL"
echo "📊 Full status check completed"

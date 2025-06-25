# Hardcoded Configuration Values Report

This report identifies all hardcoded configuration values found in the TypeScript/JavaScript codebase that should be moved to environment variables.

## Summary of Findings

### 1. **Model Names**
- **Location**: Multiple files
- **Values**:
  - `'gpt-3.5-turbo'` (src/index.ts:14, src/server.ts:74, src/server.ts:113, api/chat.ts:15)
  - `'claude-3-haiku-20240307'` (src/index.ts:24, src/server.ts:76, src/server.ts:115, api/chat.ts:17)
  - `'bruce-cleveland'` (src/web-server.ts:43)
  - `'emma'` (src/web-server.ts:45)
- **Recommendation**: Use environment variables like `OPENAI_MODEL`, `ANTHROPIC_MODEL`, etc.

### 2. **EMRouter Configuration**
- **Location**: src/emrouter-provider.ts
- **Values**:
  - Endpoint: `'http://localhost:8123'` (line 177)
  - API Key: `'emr-prod-2024-xa7k9m3n5p'` (line 178)
- **Location**: src/web-server.ts
  - Base URL: `"http://localhost:8123/v1"` (line 12)
  - API Key: `"emr-prod-2024-xa7k9m3n5p"` (line 13)
- **Recommendation**: Use `EMROUTER_ENDPOINT` and `EMROUTER_API_KEY` environment variables

### 3. **Port Numbers**
- **Location**: Multiple files
- **Values**:
  - Backend port: `3001` (src/web-server.ts:162 fallback)
  - Frontend port: `3000` (vite.config.ts:9)
  - Backend port in run.sh: `3001` (line 9)
  - Frontend port in run.sh: `3000` (line 10)
  - Server bind address: `'127.0.0.1'` (src/server.ts:153, src/web-server.ts:163)
- **Already using**: `process.env.PORT` as fallback in some places
- **Recommendation**: Consistently use `PORT` and `VITE_PORT` environment variables

### 4. **API Endpoints**
- **Location**: web/src/App.tsx
- **Value**: `/api/chat/openai` (line 14)
- **Location**: vite.config.ts
- **Value**: Proxy target `'http://localhost:3001'` (line 12)
- **Recommendation**: Use environment variable for backend URL

### 5. **Authentication PIN**
- **Location**: web/src/App.tsx
- **Value**: `'7893'` (line 77)
- **Security Risk**: This is a hardcoded authentication PIN
- **Recommendation**: Use `APP_PIN_CODE` environment variable

### 6. **Log File Path**
- **Location**: run.sh
- **Value**: `"/tmp/tgp-agent.log"` (line 11)
- **Recommendation**: Use `LOG_FILE` environment variable

### 7. **Server Host Configuration**
- **Location**: vite.config.ts
- **Value**: `host: '0.0.0.0'` (line 8)
- **Recommendation**: Use `VITE_HOST` environment variable

## Security Concerns

1. **Exposed API Keys**: The EMRouter API key is hardcoded in the source code
2. **Hardcoded PIN**: The authentication PIN (7893) is visible in the source code
3. **API Keys in .env**: The current .env file contains actual API keys that should not be committed

## Recommended Actions

1. **Update all files** to use environment variables instead of hardcoded values
2. **Add .env to .gitignore** if not already present
3. **Update .env.example** with all required environment variables (already done)
4. **Implement validation** to ensure required environment variables are set
5. **Consider using a configuration module** to centralize environment variable access

## Files That Need Updates

1. `/home/oumy/work/tgp-agent/src/index.ts` - Model names
2. `/home/oumy/work/tgp-agent/src/server.ts` - Model names, port, host
3. `/home/oumy/work/tgp-agent/src/web-server.ts` - EMRouter config, model names, port, host
4. `/home/oumy/work/tgp-agent/src/emrouter-provider.ts` - EMRouter endpoint and API key
5. `/home/oumy/work/tgp-agent/web/src/App.tsx` - PIN code, API endpoint
6. `/home/oumy/work/tgp-agent/api/chat.ts` - Model names
7. `/home/oumy/work/tgp-agent/vite.config.ts` - Port, host, proxy target
8. `/home/oumy/work/tgp-agent/run.sh` - Port numbers, log file path
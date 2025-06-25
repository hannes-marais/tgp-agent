# tgp-agent

An AI agent built with the Vercel AI SDK, supporting multiple AI providers including OpenAI and Anthropic.

## Features

- 🤖 Multi-provider AI support (OpenAI, Anthropic)
- 🔄 Streaming responses
- 📝 Text generation
- 🛠️ TypeScript support
- 🔐 Environment-based configuration

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for AI providers (OpenAI and/or Anthropic)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hannes-marais/tgp-agent.git
cd tgp-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Usage

Run in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## API Keys

### OpenAI
Get your API key from: https://platform.openai.com/api-keys

### Anthropic
Get your API key from: https://console.anthropic.com/

## Project Structure

```
src/
├── index.ts          # Main application entry point
├── ...               # Additional source files
dist/                 # Compiled TypeScript output
.env.example          # Environment variables template
tsconfig.json         # TypeScript configuration
package.json          # Project dependencies and scripts
```

## Scripts

- `npm run dev` - Run in development mode with tsx
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run compiled JavaScript
- `npm run clean` - Clean build output

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Development Scripts

Use these scripts to manage the development environment cleanly:

### Quick Start
```bash
# Start both frontend and backend
npm run dev:start

# Check if servers are running
npm run dev:status

# Stop all servers
npm run dev:stop

# Restart servers
npm run dev:restart
```

### Manual Control
```bash
# Using the script directly
./dev-control.sh start    # Start both servers
./dev-control.sh stop     # Stop all servers  
./dev-control.sh restart  # Restart servers
./dev-control.sh status   # Check status
```

### URLs
- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Simple Chat**: http://localhost:3001/simple

### Troubleshooting
If you encounter port conflicts or zombie processes:
```bash
npm run dev:stop  # This will clean up all related processes
npm run dev:start # Start fresh
```

The script automatically:
- Kills any existing processes on ports 3000/3001
- Cleans up zombie esbuild processes
- Starts backend and frontend in correct order
- Verifies both servers started successfully
- Provides clear status feedback

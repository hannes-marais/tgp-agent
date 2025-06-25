import { serve } from "@std/http";
import { join, extname } from "@std/path";
import { contentType } from "@std/mime";

const PORT = parseInt(Deno.env.get("PORT") || "3001");

// Serve the pre-built React app and handle API routes
serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Enable CORS
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  
  // Handle OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }
  
  // API endpoint for chat
  if (path.startsWith("/api/chat/") && req.method === "POST") {
    try {
      const provider = path.split("/").pop();
      const { messages } = await req.json();
      
      // For now, we'll use a mock response
      // In production, this would call the actual AI service
      const mockResponse = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `This is a mock response from the ${provider} provider. In production, this would connect to the actual AI service.

For Market Engineering insights, Bruce Cleveland would discuss:
- Building category-defining companies
- The Traction Gap framework
- Go-to-market strategies vs market engineering
- Scaling B2B SaaS companies

[This is a mock response. Real AI integration pending.]`
      };
      
      headers.set("Content-Type", "application/json");
      return new Response(
        JSON.stringify(mockResponse),
        { status: 200, headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers }
      );
    }
  }
  
  // Serve static files from dist/
  try {
    let filePath = path;
    
    // Default to index.html for root
    if (path === "/" || path === "/simple") {
      filePath = "/index.html";
    }
    
    // Construct full file path
    const fullPath = join(Deno.cwd(), "dist", filePath);
    
    // Try to read the file
    const file = await Deno.readFile(fullPath);
    
    // Determine content type
    const ext = extname(filePath);
    const mimeType = contentType(ext) || "application/octet-stream";
    
    headers.set("Content-Type", mimeType);
    
    // Cache static assets
    if (ext && [".js", ".css", ".png", ".jpg", ".ico", ".webp"].includes(ext)) {
      headers.set("Cache-Control", "public, max-age=3600");
    }
    
    return new Response(file, { status: 200, headers });
  } catch {
    // If file not found, serve index.html for client-side routing
    try {
      const indexPath = join(Deno.cwd(), "dist", "index.html");
      const indexFile = await Deno.readFile(indexPath);
      headers.set("Content-Type", "text/html");
      return new Response(indexFile, { status: 200, headers });
    } catch {
      return new Response("Not Found", { status: 404, headers });
    }
  }
}, { port: PORT });

console.log(`🚀 Bruce Cleveland EM server (React version) running on http://localhost:${PORT}`);
console.log(`📦 Serving pre-built React app from dist/`);
console.log(`🔧 Make sure to run 'npm run build' first to build the React app`);
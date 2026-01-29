#!/usr/bin/env node

import { server } from "./server";

async function main() {
  try {
    await server.listen();
    console.log("🚀 Hocuspocus server started successfully!");
    console.log(`📡 WebSocket server listening on ws://localhost:1234`);
    console.log(`💾 Documents stored in memory (development mode)`);
    console.log(`🏠 Room name: vibe-canvas-room`);
  } catch (error) {
    console.error("❌ Failed to start Hocuspocus server:", error);
    process.exit(1);
  }
}

// Start the server
main();

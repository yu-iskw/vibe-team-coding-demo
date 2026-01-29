import { Server } from "@hocuspocus/server";
import { Doc, encodeStateAsUpdate, applyUpdate } from "yjs";

// Simple in-memory document store for development
class DocumentStore {
  private documents = new Map<string, Uint8Array>();

  // Load document from memory
  load(name: string): Uint8Array | null {
    return this.documents.get(name) || null;
  }

  // Save document to memory
  save(name: string, data: Uint8Array): void {
    this.documents.set(name, data);
  }

  // Close (no-op for in-memory store)
  close(): void {
    // Nothing to close
  }
}

// Create document store instance
const documentStore = new DocumentStore();

// Configure Hocuspocus server
export const server = new Server({
  name: "vibe-canvas-server",
  port: 1234,
  debounce: 2000, // Debounce document saves by 2 seconds
  maxDebounce: 10000, // Save at least every 10 seconds

  // Document persistence hooks
  async onLoadDocument(data) {
    console.log(`Loading document: ${data.documentName}`);

    const storedData = documentStore.load(data.documentName);
    if (storedData) {
      // Create a new Yjs document and apply the stored state
      const doc = new Doc();
      try {
        // Apply the stored binary data to the document
        const update = new Uint8Array(storedData);
        doc.transact(() => {
          applyUpdate(doc, update);
        });
        return doc;
      } catch (error) {
        console.error("Error loading document", data.documentName, error);
        // Return a new empty document if loading fails
        return new Doc();
      }
    }

    // Return a new empty document if none exists
    return new Doc();
  },

  async onStoreDocument(data) {
    console.log(`Storing document: ${data.documentName}`);

    try {
      // Encode the document state
      const state = encodeStateAsUpdate(data.document);
      documentStore.save(data.documentName, state);
    } catch (error) {
      console.error("Error storing document", data.documentName, error);
    }
  },

  // Connection and awareness logging
  async onConnect(data) {
    console.log(`Client connected: ${data.socketId}`);
  },

  async onDisconnect(data) {
    console.log(`Client disconnected: ${data.socketId}`);
  },

  async onListen(data) {
    console.log(`🚀 Hocuspocus server listening on port ${data.port}`);
  },
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down Hocuspocus server...");
  documentStore.close();
  server.destroy();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Shutting down Hocuspocus server...");
  documentStore.close();
  server.destroy();
  process.exit(0);
});

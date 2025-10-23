import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from 'langchain/document';

export interface SessionData {
  id: string;
  documentIds: string[];
  vectorStore: MemoryVectorStore;
  documents: Document[];
  createdAt: Date;
  lastAccessed: Date;
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old sessions every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldSessions();
    }, 10 * 60 * 1000);
  }

  /**
   * Create a new session
   */
  createSession(documentIds: string[], vectorStore: MemoryVectorStore, documents: Document[]): string {
    const sessionId = this.generateSessionId();
    const now = new Date();

    this.sessions.set(sessionId, {
      id: sessionId,
      documentIds,
      vectorStore,
      documents,
      createdAt: now,
      lastAccessed: now
    });

    return sessionId;
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessed = new Date();
      return session;
    }
    return null;
  }

  /**
   * Check if session exists
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get all active session IDs
   */
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  /**
   * Clean up sessions older than 1 hour
   */
  private cleanupOldSessions(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastAccessed < oneHourAgo) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} old sessions. Active sessions: ${this.sessions.size}`);
    }
  }

  /**
   * Generate a random session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Global singleton instance
export const sessionManager = new SessionManager();

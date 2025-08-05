import { PGlite } from '@electric-sql/pglite';

export interface ChatMessage {
  id?: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  chat_id?: string;
  is_verified?: boolean | null;
  is_verifying?: boolean;
  provider_address?: string;
}

export interface ChatSession {
  id?: number;
  session_id: string;
  provider_address: string;
  created_at: number;
  updated_at: number;
  title?: string;
}

class DatabaseManager {
  private db: PGlite | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._init();
    return this.initPromise;
  }

  private async _init(): Promise<void> {
    try {
      // Initialize PGlite with IndexedDB persistence
      this.db = new PGlite({
        dataDir: 'idb://chat-history-db',
      });

      // Create tables
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id SERIAL PRIMARY KEY,
          session_id TEXT UNIQUE NOT NULL,
          provider_address TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          updated_at BIGINT NOT NULL,
          title TEXT
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
          content TEXT NOT NULL,
          timestamp BIGINT NOT NULL,
          chat_id TEXT,
          is_verified BOOLEAN,
          is_verifying BOOLEAN DEFAULT FALSE,
          provider_address TEXT,
          FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_provider ON chat_sessions(provider_address);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at);
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async ensureInit(): Promise<PGlite> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Chat session methods
  async createChatSession(providerAddress: string, title?: string): Promise<string> {
    const db = await this.ensureInit();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const now = Date.now();

    await db.query(`
      INSERT INTO chat_sessions (session_id, provider_address, created_at, updated_at, title)
      VALUES ($1, $2, $3, $4, $5)
    `, [sessionId, providerAddress, now, now, title || null]);

    return sessionId;
  }

  async getChatSessions(providerAddress?: string): Promise<ChatSession[]> {
    const db = await this.ensureInit();
    
    let query = 'SELECT * FROM chat_sessions';
    let params: any[] = [];
    
    if (providerAddress) {
      query += ' WHERE provider_address = $1';
      params = [providerAddress];
    }
    
    query += ' ORDER BY updated_at DESC';

    const result = await db.query(query, params);
    return result.rows as ChatSession[];
  }

  async updateChatSessionTitle(sessionId: string, title: string): Promise<void> {
    const db = await this.ensureInit();
    await db.query('UPDATE chat_sessions SET title = $1, updated_at = $2 WHERE session_id = $3', 
      [title, Date.now(), sessionId]);
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    const db = await this.ensureInit();
    await db.query('DELETE FROM chat_sessions WHERE session_id = $1', [sessionId]);
  }

  // Chat message methods
  async saveMessage(sessionId: string, message: Omit<ChatMessage, 'id'>): Promise<number> {
    const db = await this.ensureInit();
    
    const result = await db.query(`
      INSERT INTO chat_messages (
        session_id, role, content, timestamp, chat_id, 
        is_verified, is_verifying, provider_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      sessionId,
      message.role,
      message.content,
      message.timestamp,
      message.chat_id || null,
      message.is_verified ?? null,
      message.is_verifying ?? false,
      message.provider_address || null,
    ]);

    // Update session updated_at timestamp
    await db.query('UPDATE chat_sessions SET updated_at = $1 WHERE session_id = $2', 
      [Date.now(), sessionId]);

    return (result.rows[0] as any).id;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const db = await this.ensureInit();
    
    const result = await db.query('SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC', 
      [sessionId]);

    return result.rows as ChatMessage[];
  }

  async updateMessageVerification(messageId: number, isVerified: boolean, isVerifying: boolean = false): Promise<void> {
    const db = await this.ensureInit();
    
    await db.query('UPDATE chat_messages SET is_verified = $1, is_verifying = $2 WHERE id = $3', 
      [isVerified, isVerifying, messageId]);
  }

  async clearMessages(sessionId: string): Promise<void> {
    const db = await this.ensureInit();
    await db.query('DELETE FROM chat_messages WHERE session_id = $1', [sessionId]);
  }

  // Search messages
  async searchMessages(query: string, providerAddress?: string): Promise<ChatMessage[]> {
    const db = await this.ensureInit();
    
    let sqlQuery = `
      SELECT cm.* FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.session_id
      WHERE cm.content ILIKE $1
    `;
    const params: (string | number)[] = [`%${query}%`];
    
    if (providerAddress) {
      sqlQuery += ' AND cs.provider_address = $2';
      params.push(providerAddress);
    }
    
    sqlQuery += ' ORDER BY cm.timestamp DESC LIMIT 100';

    const result = await db.query(sqlQuery, params);
    return result.rows as ChatMessage[];
  }

  // Get recent sessions for provider
  async getRecentSessions(providerAddress: string, limit: number = 10): Promise<ChatSession[]> {
    const db = await this.ensureInit();
    
    const result = await db.query(`
      SELECT * FROM chat_sessions 
      WHERE provider_address = $1 
      ORDER BY updated_at DESC 
      LIMIT $2
    `, [providerAddress, limit]);

    return result.rows as ChatSession[];
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const dbManager = new DatabaseManager();
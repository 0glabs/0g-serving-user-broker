import { useState, useEffect, useCallback } from 'react';
import { dbManager, type ChatMessage, type ChatSession } from '../lib/database';

export interface UseChatHistoryOptions {
  providerAddress: string;
  autoSave?: boolean;
}

export interface UseChatHistoryReturn {
  // Current session
  currentSessionId: string | null;
  messages: ChatMessage[];
  
  // Session management
  sessions: ChatSession[];
  createNewSession: (title?: string) => Promise<string>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  
  // Message management
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  updateMessage: (index: number, updates: Partial<ChatMessage>) => void;
  clearCurrentSession: () => Promise<void>;
  
  // Search and history
  searchMessages: (query: string) => Promise<ChatMessage[]>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

export function useChatHistory({ providerAddress, autoSave = true }: UseChatHistoryOptions): UseChatHistoryReturn {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load sessions
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setIsLoading(true);
        await dbManager.init();
        await loadSessions();
      } catch (err) {
        console.error('Failed to initialize chat history:', err);
        setError(err instanceof Error ? err.message : 'Database initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, [providerAddress]);

  // Load sessions for current provider
  const loadSessions = useCallback(async () => {
    try {
      const providerSessions = await dbManager.getChatSessions(providerAddress);
      setSessions(providerSessions);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    }
  }, [providerAddress]);

  // Create new session
  const createNewSession = useCallback(async (title?: string): Promise<string> => {
    try {
      const sessionId = await dbManager.createChatSession(providerAddress, title);
      setCurrentSessionId(sessionId);
      setMessages([]);
      await loadSessions(); // Refresh sessions list
      return sessionId;
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    }
  }, [providerAddress, loadSessions]);

  // Load existing session
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const sessionMessages = await dbManager.getMessages(sessionId);
      setCurrentSessionId(sessionId);
      setMessages(sessionMessages);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await dbManager.deleteChatSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      await loadSessions(); // Refresh sessions list
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  }, [currentSessionId, loadSessions]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      await dbManager.updateChatSessionTitle(sessionId, title);
      await loadSessions(); // Refresh sessions list
    } catch (err) {
      console.error('Failed to update session title:', err);
      setError(err instanceof Error ? err.message : 'Failed to update session title');
    }
  }, [loadSessions]);

  // Add message to current session
  const addMessage = useCallback(async (messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    try {
      // If no current session, create one
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createNewSession();
      }

      const message: Omit<ChatMessage, 'id'> = {
        ...messageData,
        timestamp: Date.now(),
        provider_address: providerAddress,
      };

      // Save to database if autoSave is enabled
      let messageId: number | undefined;
      if (autoSave) {
        messageId = await dbManager.saveMessage(sessionId, message);
      }

      // Update local state
      const fullMessage: ChatMessage = {
        ...message,
        id: messageId,
      };
      
      setMessages(prev => [...prev, fullMessage]);
    } catch (err) {
      console.error('Failed to add message:', err);
      setError(err instanceof Error ? err.message : 'Failed to add message');
    }
  }, [currentSessionId, providerAddress, autoSave, createNewSession]);

  // Update message in current session
  const updateMessage = useCallback((index: number, updates: Partial<ChatMessage>) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (index >= 0 && index < newMessages.length) {
        newMessages[index] = { ...newMessages[index], ...updates };
        
        // Update in database if message has ID and verification status changed
        const message = newMessages[index];
        if (message.id && (updates.is_verified !== undefined || updates.is_verifying !== undefined)) {
          dbManager.updateMessageVerification(
            message.id,
            message.is_verified ?? false,
            message.is_verifying ?? false
          ).catch(err => {
            console.error('Failed to update message verification:', err);
          });
        }
      }
      return newMessages;
    });
  }, []);

  // Clear current session messages
  const clearCurrentSession = useCallback(async () => {
    if (currentSessionId) {
      try {
        await dbManager.clearMessages(currentSessionId);
        setMessages([]);
      } catch (err) {
        console.error('Failed to clear session:', err);
        setError(err instanceof Error ? err.message : 'Failed to clear session');
      }
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Search messages
  const searchMessages = useCallback(async (query: string): Promise<ChatMessage[]> => {
    try {
      return await dbManager.searchMessages(query, providerAddress);
    } catch (err) {
      console.error('Failed to search messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to search messages');
      return [];
    }
  }, [providerAddress]);

  return {
    // Current session
    currentSessionId,
    messages,
    
    // Session management
    sessions,
    createNewSession,
    loadSession,
    deleteSession,
    updateSessionTitle,
    
    // Message management
    addMessage,
    updateMessage,
    clearCurrentSession,
    
    // Search and history
    searchMessages,
    
    // State
    isLoading,
    error,
  };
}
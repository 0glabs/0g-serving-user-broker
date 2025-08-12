"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const crypto_1 = require("crypto");
class SessionManager {
    sessions = new Map();
    requestToSession = new Map();
    sessionTimeout;
    constructor(sessionTimeout = 30 * 60 * 1000) {
        this.sessionTimeout = sessionTimeout;
        this.startCleanupInterval();
    }
    assignProvider(requestId, providerAddress, sessionId) {
        if (sessionId && this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            session.lastActivity = Date.now();
            session.requestIds.push(requestId);
            this.requestToSession.set(requestId, sessionId);
            return { sessionId, providerAddress: session.providerAddress };
        }
        const newSessionId = sessionId || (0, crypto_1.randomUUID)();
        const session = {
            sessionId: newSessionId,
            providerAddress,
            requestIds: [requestId],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        this.sessions.set(newSessionId, session);
        this.requestToSession.set(requestId, newSessionId);
        return { sessionId: newSessionId, providerAddress };
    }
    getProviderForRequest(requestId) {
        const sessionId = this.requestToSession.get(requestId);
        if (!sessionId) {
            return null;
        }
        const session = this.sessions.get(sessionId);
        return session ? session.providerAddress : null;
    }
    getSessionForRequest(requestId) {
        const sessionId = this.requestToSession.get(requestId);
        if (!sessionId) {
            return null;
        }
        return this.sessions.get(sessionId) || null;
    }
    updateSessionActivity(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = Date.now();
        }
    }
    cleanupExpiredSessions() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity > this.sessionTimeout) {
                this.sessions.delete(sessionId);
                session.requestIds.forEach(requestId => {
                    this.requestToSession.delete(requestId);
                });
                cleanedCount++;
            }
        }
        return cleanedCount;
    }
    startCleanupInterval() {
        setInterval(() => {
            const cleaned = this.cleanupExpiredSessions();
            if (cleaned > 0) {
                console.log(`Cleaned up ${cleaned} expired sessions`);
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
    }
    getSessionCount() {
        return this.sessions.size;
    }
    getActiveSessionsForProvider(providerAddress) {
        return Array.from(this.sessions.values())
            .filter(session => session.providerAddress === providerAddress);
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=session-manager.js.map
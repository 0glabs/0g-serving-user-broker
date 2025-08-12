import type { SessionInfo } from './types';
export declare class SessionManager {
    private sessions;
    private requestToSession;
    private sessionTimeout;
    constructor(sessionTimeout?: number);
    assignProvider(requestId: string, providerAddress: string, sessionId?: string): {
        sessionId: string;
        providerAddress: string;
    };
    getProviderForRequest(requestId: string): string | null;
    getSessionForRequest(requestId: string): SessionInfo | null;
    updateSessionActivity(sessionId: string): void;
    cleanupExpiredSessions(): number;
    private startCleanupInterval;
    getSessionCount(): number;
    getActiveSessionsForProvider(providerAddress: string): SessionInfo[];
}
//# sourceMappingURL=session-manager.d.ts.map
import type { SessionInfo } from './types'
import { randomUUID } from 'crypto'

export class SessionManager {
    private sessions: Map<string, SessionInfo> = new Map()
    private requestToSession: Map<string, string> = new Map()
    private sessionTimeout: number

    constructor(sessionTimeout: number = 30 * 60 * 1000) { // 30 minutes default
        this.sessionTimeout = sessionTimeout
        this.startCleanupInterval()
    }

    assignProvider(requestId: string, providerAddress: string, sessionId?: string): { sessionId: string, providerAddress: string } {
        if (sessionId && this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId)!
            session.lastActivity = Date.now()
            session.requestIds.push(requestId)
            this.requestToSession.set(requestId, sessionId)
            return { sessionId, providerAddress: session.providerAddress }
        }

        const newSessionId = sessionId || randomUUID()
        const session: SessionInfo = {
            sessionId: newSessionId,
            providerAddress,
            requestIds: [requestId],
            createdAt: Date.now(),
            lastActivity: Date.now()
        }

        this.sessions.set(newSessionId, session)
        this.requestToSession.set(requestId, newSessionId)

        return { sessionId: newSessionId, providerAddress }
    }

    getProviderForRequest(requestId: string): string | null {
        const sessionId = this.requestToSession.get(requestId)
        if (!sessionId) {
            return null
        }

        const session = this.sessions.get(sessionId)
        return session ? session.providerAddress : null
    }

    getSessionForRequest(requestId: string): SessionInfo | null {
        const sessionId = this.requestToSession.get(requestId)
        if (!sessionId) {
            return null
        }
        return this.sessions.get(sessionId) || null
    }

    updateSessionActivity(sessionId: string): void {
        const session = this.sessions.get(sessionId)
        if (session) {
            session.lastActivity = Date.now()
        }
    }

    cleanupExpiredSessions(): number {
        const now = Date.now()
        let cleanedCount = 0

        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity > this.sessionTimeout) {
                this.sessions.delete(sessionId)
                
                session.requestIds.forEach(requestId => {
                    this.requestToSession.delete(requestId)
                })
                
                cleanedCount++
            }
        }

        return cleanedCount
    }

    private startCleanupInterval(): void {
        setInterval(() => {
            const cleaned = this.cleanupExpiredSessions()
            if (cleaned > 0) {
                console.log(`Cleaned up ${cleaned} expired sessions`)
            }
        }, 5 * 60 * 1000) // Check every 5 minutes
    }

    getSessionCount(): number {
        return this.sessions.size
    }

    getActiveSessionsForProvider(providerAddress: string): SessionInfo[] {
        return Array.from(this.sessions.values())
            .filter(session => session.providerAddress === providerAddress)
    }
}
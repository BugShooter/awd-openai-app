import db, { createSession } from '../db/database';
import { randomUUID } from 'crypto';

const mapSession = (r: any): Session => ({
    id: r.id as string,
    user_id: r.user_id as string,
    created_at: new Date(r.created_at as string),
});

export default {
    getAll: async (): Promise<Session[]> => {
        const sessions = await db.prepare('SELECT * FROM sessions').all();
        return sessions.map(mapSession);
    },
    getById: async (id: Session['id']): Promise<Session | null> => {
        const session = await db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
        return session ? mapSession(session) : null;
    },
    create: async (data: Session): Promise<Session> => {
        const { user_id } = data;
        const id = randomUUID();
        // with RETURNING
        const session = await createSession.run(id, user_id);
        return session.map(mapSession);
    },
    update: async (data: Session): Promise<Session> => {
        const { id, user_id } = data;
        const session = await db.prepare('UPDATE sessions SET user_id = ? WHERE id = ? RETURNING').run(user_id, id);
        return session.map(mapSession);
    },
    delete: async (id: Session['id']): Promise<void> => {
        await db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    }
}

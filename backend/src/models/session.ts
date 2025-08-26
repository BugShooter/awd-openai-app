import db, { createSession } from '../db/database';
import { randomUUID } from 'crypto';

const mapSession = (r: any): Session => ({
    id: r.id as string,
    user_id: r.user_id as string,
    created_at: new Date(r.created_at as string),
});

interface SearchCriteria {
    user_id?: string;
    created_at?: Date;
    limit?: number;
    offset?: number;
    orderBy?: {
        [P in keyof Session]?: undefined | 'asc' | 'desc'
    };
}
function prepareSearchCriteria(searchCriteria: SearchCriteria): { where: string[]; orderLimitOffset: string[]; params: (string | number)[] } {
    const where: string[] = [];
    const orderLimitOffset: string[] = [];
    const params: (string | number)[] = [];

    if (searchCriteria.user_id) {
        where.push('user_id = ?');
        params.push(searchCriteria.user_id);
    }
    if (searchCriteria.created_at) {
        where.push('created_at = ?');
        if (searchCriteria.created_at instanceof Date) {
            params.push(searchCriteria.created_at.toISOString());
        } else {
            params.push(searchCriteria.created_at);
        }
    }
    if (searchCriteria.orderBy) {
        const orderings = Object.entries(searchCriteria.orderBy).map(
            ([key, direction]) => `${key} ${direction === undefined ? 'asc' : direction}`
        );
        if (orderings.length) {
            orderLimitOffset.push('ORDER BY ' + orderings.join(', '));
        }
    }
    if (searchCriteria.limit) {
        orderLimitOffset.push('LIMIT ?');
        params.push(searchCriteria.limit);
    }
    if (searchCriteria.offset) {
        orderLimitOffset.push('OFFSET ?');
        params.push(searchCriteria.offset);
    }

    return {
        where,
        orderLimitOffset,
        params
    };
}

export default {
    getOne: async (searchCriteria: SearchCriteria): Promise<Session | null> => {
        const { where, orderLimitOffset, params } = prepareSearchCriteria(searchCriteria);

        const session = await db
            .prepare(`SELECT * FROM sessions ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ${orderLimitOffset.join(' ')}`)
            .get(...params);
        return session ? mapSession(session) : null;
    },
    getAll: async (searchCriteria: SearchCriteria): Promise<Session[]> => {
        const { where, orderLimitOffset, params } = prepareSearchCriteria(searchCriteria);

        const sessions = await db
            .prepare(`SELECT * FROM sessions ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ${orderLimitOffset.join(' ')}`)
            .all(...params);
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
        const session = await createSession.get(id, user_id);
        return mapSession(session);
    },
    update: async (data: Session): Promise<Session> => {
        const { id, user_id } = data;
        const session = await db
            .prepare('UPDATE sessions SET user_id = ? WHERE id = ? RETURNING *')
            .get(user_id, id);
        return mapSession(session);
    },
    delete: async (id: Session['id']): Promise<void> => {
        await db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    }
}


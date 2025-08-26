import db, { createUser } from '../db/database';
import { randomUUID } from 'crypto';
const mapUser = (r: any): User => ({
    id: r.id as string,
    email: r.email as string,
    name: r.name as string,
    created_at: new Date(r.created_at as string),
});

interface SearchCriteria {
    email?: string;
    name?: string;
    created_at?: Date;
}
function prepareSearchCriteria(searchCriteria: SearchCriteria): { where: string[]; params: (string | number)[] } {
    const where: string[] = [];
    const params: (string | number)[] = [];

    if (searchCriteria.email) {
        where.push('email = ?');
        params.push(searchCriteria.email);
    }
    if (searchCriteria.name) {
        where.push('name = ?');
        params.push(searchCriteria.name);
    }
    if (searchCriteria.created_at) {
        where.push('created_at = ?');
        if (searchCriteria.created_at instanceof Date) {
            params.push(searchCriteria.created_at.toISOString());
        } else {
            params.push(searchCriteria.created_at);
        }
    }

    return {
        where,
        params
    };
}

export default {
    getOne: async (searchCriteria: SearchCriteria): Promise<User | null> => {
        const { where, params } = prepareSearchCriteria(searchCriteria);
        const user = await db
            .prepare(`SELECT * FROM users ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`)
            .get(...params);
        return user ? mapUser(user) : null;
    },
    getAll: async (searchCriteria: SearchCriteria): Promise<User[]> => {
        const { where, params } = prepareSearchCriteria(searchCriteria);
        const users = await db
            .prepare(`SELECT * FROM users ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`)
            .all(...params);
        return users.map(mapUser);
    },
    getById: async (id: User['id']): Promise<User | null> => {
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return user ? mapUser(user) : null;
    },
    create: async (data: Omit<User, 'id'|'created_at'>): Promise<User> => {
        const { email, name } = data;
        const id = randomUUID();
        const user = await createUser.get(id, email, name);
        return mapUser(user);
    },
    update: async (data: User): Promise<User> => {
        const { id, email, name } = data;
        const user = await db
            .prepare('UPDATE users SET email = ?, name = ? WHERE id = ? RETURNING *')
            .get(email, name, id);
        return mapUser(user);
    },
    delete: async (id: User['id']): Promise<void> => {
        await db.prepare('DELETE FROM users WHERE id = ?').run(id);
    },
}

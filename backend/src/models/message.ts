import db, {createMessage} from '../db/database';
import { randomUUID } from 'crypto';

const mapMessage = (r: any): Message => ({
    id: r.id as string,
    session_id: r.session_id as string,
    role: r.role as string,
    content: r.content as string,
    model: r.model as string | null,
    created_at: new Date(r.created_at as string),
});

interface searchCriteria {
    session_id?: string;
    role?: string;
    content?: string;
    model?: string;
    created_at?: Date;
}
function prepareSearchCriteria(searchCriteria: searchCriteria): { where: string[]; params: (string | number)[] } {
    const where: string[] = [];
    const params: (string | number)[] = [];

    if (searchCriteria.session_id) {
        where.push('session_id = ?');
        params.push(searchCriteria.session_id);
    }
    if (searchCriteria.role) {
        where.push('role = ?');
        params.push(searchCriteria.role);
    }
    if (searchCriteria.content) {
        where.push('content = ?');
        params.push(searchCriteria.content);
    }
    if (searchCriteria.model) {
        where.push('model = ?');
        params.push(searchCriteria.model);
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
    getOne: async (searchCriteria: searchCriteria): Promise<Message | null> => {
        const { where, params } = prepareSearchCriteria(searchCriteria);

        const message = await db
            .prepare(`SELECT * FROM messages ${where.length ? 'WHERE ' + where.join(' AND ') : ''} LIMIT 1`)
            .get(...params);
        return message ? mapMessage(message) : null;
    },
    getAll: async (searchCriteria: searchCriteria): Promise<Message[]> => {
        const { where, params } = prepareSearchCriteria(searchCriteria);

        const messages = await db
            .prepare(`SELECT * FROM messages ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at`)
            .all(...params);

            return messages.map(mapMessage);
    },
    getById: async (id: Message['id']): Promise<Message | null> => {
        const message = await db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
        return message ? mapMessage(message) : null;
    },
    create: async (data: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
        const { session_id, role, model, content } = data;
        const id = randomUUID() as string;
        const message = createMessage.get(id, session_id, role, model, content);
        return mapMessage(message);
    },
    update: async (data: Message): Promise<Message> => {
        const { id, session_id, role, content, model } = data;
        const message = await db
            .prepare('UPDATE messages SET session_id = ?, role = ?, content = ?, model = ? WHERE id = ? RETURNING *')
            .get(session_id, role, content, model, id);
        return mapMessage(message);
    },
    delete: async (id: Message['id']): Promise<void> => {
        await db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    }
}

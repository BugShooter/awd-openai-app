import db, {createMessage} from '../db/database';
import { randomUUID } from 'crypto';

const mapMessage = (r: any): Message => ({
    id: r.id as string,
    session_id: r.session_id as string,
    role: r.role as string,
    content: r.content as string,
    created_at: new Date(r.created_at as string),
});

export default {
    getAll: async (): Promise<Message[]> => {
        const messages = await db.prepare('SELECT * FROM messages ORDER BY created_at').all();
        console.log(messages);
        return messages.map(mapMessage);
    },
    getById: async (id: Message['id']): Promise<Message | null> => {
        const message = await db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
        return message ? mapMessage(message) : null;
    },
    create: async (data: Message): Promise<Message> => {
        const { session_id, role, content } = data;
        const id = randomUUID();
        const message = await createMessage.run(id, session_id, role, content);
        return mapMessage(message);
    },
    update: async (data: Message): Promise<Message> => {
        const { id, session_id, role, content } = data;
        const message = await db.prepare('UPDATE messages SET session_id = ?, role = ?, content = ? WHERE id = ? RETURNING *').run(session_id, role, content, id);
        return mapMessage(message);
    },
    delete: async (id: Message['id']): Promise<void> => {
        await db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    }
}

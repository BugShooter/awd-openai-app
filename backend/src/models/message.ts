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
    create: async (data: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
        const { session_id, role, model, content } = data;
        const id = randomUUID() as string;
        console.log('data:',data)
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

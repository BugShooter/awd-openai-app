import db, { createUser } from '../db/database';
import { randomUUID } from 'crypto';
const mapUser = (r: any): User => ({
    id: r.id as string,
    email: r.email as string,
    name: r.name as string,
    created_at: new Date(r.created_at as string),
});
export default {
    getAll: async (): Promise<User[]> => {
        const users = await db.prepare('SELECT * FROM users').all();
        return users.map(mapUser);
    },
    getById: async (id: User['id']): Promise<User | null> => {
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return user ? mapUser(user) : null;
    },
    create: async (data: User): Promise<User> => {
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

import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

// const database = new DatabaseSync(':memory:');
const database = new DatabaseSync('./data/database.sqlite');

database.exec(`
    CREATE TABLE IF NOT EXISTS users(
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
database.exec(`
  CREATE TABLE IF NOT EXISTS sessions(
    id TEXT PRIMARY KEY,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

database.exec(`
  CREATE TABLE IF NOT EXISTS messages(
    id TEXT PRIMARY KEY,
    session_id TEXT,
    role TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create a prepared statement to insert data into the database.
export const createUser = database.prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?) RETURNING *');
const defaultUserId = randomUUID();
createUser.run(defaultUserId, 'tester@example.com', 'Tester');

export const createSession = database.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?) RETURNING *');
const defaultSessionId = randomUUID();
createSession.run(defaultSessionId, defaultUserId);

export const createMessage = database.prepare('INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?) RETURNING *');
const defaultMessageId = randomUUID();
createMessage.run(defaultMessageId, defaultSessionId, 'user', 'Hello, world!');

const query = database.prepare('SELECT * FROM messages ORDER BY created_at');
console.log(query.all());

export default database;

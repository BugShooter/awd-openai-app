import express from 'express';
import Session from '../models/session';
import User from '../models/user';
import { sendMessage } from '../services/openai';
import { getLogger } from '../logger';

const systemRole = 'assistant';
const model = 'gpt-5-nano';
const sendToLLM = sendMessage.bind(null, model, systemRole);

const router = express.Router();

const createRandomUser = async (): Promise<User> => {
    const starWarsCharacters = [
        ['Luke Skywalker', 'luke@rebel.com'],
        ['Darth Vader', 'darth@empire.com'],
        ['Leia Organa', 'leia@rebel.com'],
        ['Han Solo', 'han@rebel.com'],
        ['Obi-Wan Kenobi', 'obiwan@rebel.com'],
        ['Yoda', 'yoda@jedi.com'],
        ['R2-D2', 'r2d2@starwars.com'],
        ['C-3PO', 'c3po@starwars.com'],
        ['Chewbacca', 'chewie@starwars.com']
    ];
    const randomCharacter = starWarsCharacters[Math.floor(Math.random() * starWarsCharacters.length)];
    let user = await User.getOne({ name: randomCharacter[0] });
    if (!user) {
        user = await User.create({ name: randomCharacter[0], email: randomCharacter[1] });
    }
    return user;
};

router.get('{/:username}', async (req, res) => {
    const { username } = req.params;
    const user: User|null = username
        ? await User.getOne({ name: username })
        : await createRandomUser();
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    // load all sessions
    let sessions = await Session.getAll({ user_id: user.id });
    if (sessions.length === 0) {
        // create a new session
        const session = await Session.create({ user_id: user.id });
        if (!session) {
            return res.status(500).json({ error: 'Failed to create session' });
        }
        sessions.push(session);
    }
    res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        sessions
    });
});

export default router;
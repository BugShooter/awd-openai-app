import express from 'express';
import Session from '../models/session';
import User from '../models/user';
import { sendMessage } from '../services/openai';
import { getLogger } from '../logger';

const systemRole = 'assistant';
const model = 'gpt-5-nano';
const sendToLLM = sendMessage.bind(null, model, systemRole);

const router = express.Router();

// Dummy auth only return first session from DB
router.get('/', async (req, res) => {
    const session = await Session.getOne({ offset: 0, limit: 1, orderBy: { created_at: 'desc' } });
    if (!session) {
        return res.status(404).json({ error: 'No active session found' });
    }
    const session_id = session.id;
    const user = await User.getById(session.user_id);
    res.json({
        user: {
            id: user?.id,
            email: user?.email,
            name: user?.name
        },
        session_id
    });
});

export default router;
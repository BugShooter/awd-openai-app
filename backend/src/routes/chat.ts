import express from 'express';
import message from '../models/message';
import session from '../models/session';
import { sendMessage } from '../services/openai';
import { getLogger } from '../logger';

const systemRole = 'assistant';
const model = 'gpt-5-nano';
const sendToLLM = sendMessage.bind(null, model, systemRole);

const router = express.Router();

router.get('/', async (req, res) => {
    const messages = await message.getAll();
    res.json(messages);
});

router.post('/', async (req, res) => {
    const session_id = await session.getAll().then(sessions => sessions[0].id);
    const userMessage = await message.create({ session_id, role: 'user', model: null, content: req.body.content });
    const response = await sendToLLM(req.body.content);
    const responseMessage = {
        session_id,
        role: response.choices[0].message.role,
        model: response.model,
        content: response.choices[0].message.content
    };
    const assistantMessage = await message.create(responseMessage);
    console.log('assistantMessage', assistantMessage);
    getLogger(`chat-session-${session_id}.log`).info({ userMessage, assistantMessage });

    res.status(201).json(assistantMessage);
});

export default router;

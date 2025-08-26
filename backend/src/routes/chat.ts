import express from 'express';
import Message from '../models/message';
import { getLogger } from '../logger';
import { llm, sendUserMessage } from '../services/langchain';

const router = express.Router();

router.get('/:session_id', async (req, res) => {
    const { session_id } = req.params;
    const messages = await Message.getAll({ session_id });
    res.json(messages);
});

router.post('/:session_id', async (req, res) => {
    const { session_id } = req.params;
    const userMessage = await Message.create({ session_id, role: 'user', model: null, content: req.body.content });
    getLogger(`chat-session-${session_id}.log`).info(userMessage);
    const response = await sendUserMessage(req.body.content);
    const responseMessage = {
        session_id,
        role: 'assistant',
        model: llm.model,
        content: String(response.content)
    };
    const assistantMessage = await Message.create(responseMessage);
    getLogger(`chat-session-${session_id}.log`).info(assistantMessage);

    res.status(201).json(assistantMessage);
});

export default router;

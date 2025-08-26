import express from 'express';
import Message from '../models/message';
import { sendMessage } from '../services/openai';
import { getLogger } from '../logger';

const systemRole = 'assistant';
const model = 'gpt-5-nano';
const sendToLLM = sendMessage.bind(null, model, systemRole);

const router = express.Router();

router.get('/:session_id', async (req, res) => {
    const { session_id } = req.params;
    const messages = await Message.getAll({ session_id });
    res.json(messages);
});

router.post('/:session_id', async (req, res) => {
    const { session_id } = req.params;
    const userMessage = await Message.create({ session_id, role: 'user', model: null, content: req.body.content });
    const response = await sendToLLM(req.body.content);
    const responseMessage = {
        session_id,
        role: response.choices[0].message.role,
        model: response.model,
        content: response.choices[0].message.content
    };
    const assistantMessage = await Message.create(responseMessage);
    console.log('assistantMessage', assistantMessage);
    getLogger(`chat-session-${session_id}.log`).info({ userMessage, assistantMessage });

    res.status(201).json(assistantMessage);
});

export default router;

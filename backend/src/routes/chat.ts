import express from 'express';
import message from '../models/message';

const router = express.Router();

router.get('/', async (req, res) => {
    const messages = await message.getAll();
    res.json(messages);
});

export default router;

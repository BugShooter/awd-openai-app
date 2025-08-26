import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat'
import authRouter from './routes/auth'

if (!process.env.OPENAI_API_URL || !process.env.OPENAI_API_KEY) {
    console.error('OpenAI API URL or API Key is not set');
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
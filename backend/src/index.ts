import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat'

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
import fs from 'fs';
import path from 'path';

const tokenUsageFilePath = path.join(__dirname, '../../logs/tokenusage.json');

const tokensUsage = {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0,
    "prompt_tokens_details": {
        "cached_tokens": 0,
        "audio_tokens": 0
    },
    "completion_tokens_details": {
        "reasoning_tokens": 0,
        "audio_tokens": 0,
        "accepted_prediction_tokens": 0,
        "rejected_prediction_tokens": 0
    }
};

// load tokenusage from logs/tokenusage.json
if (fs.existsSync(tokenUsageFilePath)) {
    const data = fs.readFileSync(tokenUsageFilePath);
    Object.assign(tokensUsage, JSON.parse(data.toString()));
}
// save tokenUsage to logs/tokenusage.json
process.on('SIGINT', () => {
    fs.writeFileSync(tokenUsageFilePath, JSON.stringify(tokensUsage, null, 2));
    process.exit();
});
process.on('SIGTERM', () => {
    fs.writeFileSync(tokenUsageFilePath, JSON.stringify(tokensUsage, null, 2));
    process.exit();
});

const countTokens = (response: any) => {
    const usage = response?.usage;
    tokensUsage.prompt_tokens += usage?.prompt_tokens || 0;
    tokensUsage.completion_tokens += usage?.completion_tokens || 0;
    tokensUsage.total_tokens += usage?.total_tokens || 0;
    tokensUsage.prompt_tokens_details.cached_tokens += usage?.prompt_tokens_details?.cached_tokens || 0;
    tokensUsage.prompt_tokens_details.audio_tokens += usage?.prompt_tokens_details?.audio_tokens || 0;
    tokensUsage.completion_tokens_details.reasoning_tokens += usage?.completion_tokens_details?.reasoning_tokens || 0;
    tokensUsage.completion_tokens_details.audio_tokens += usage?.completion_tokens_details?.audio_tokens || 0;
    tokensUsage.completion_tokens_details.accepted_prediction_tokens += usage?.completion_tokens_details?.accepted_prediction_tokens || 0;
    tokensUsage.completion_tokens_details.rejected_prediction_tokens += usage?.completion_tokens_details?.rejected_prediction_tokens || 0;
    return tokensUsage;
};
export const sendMessage = async (model: 'gpt-5-nano' | 'gpt-5-mini', systemRole: string, message: string) => {
    const response = await fetch(`${process.env.OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: systemRole, content: "You are funny and helpful assistant that speaks always using phrases from books and films." },
                { role: 'user', content: message }
            ]
        })
    });
    const data = await response.json();
    countTokens(data);
    return data;
};

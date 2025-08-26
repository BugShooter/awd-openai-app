import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/dist/messages/ai";

export let llm: ChatOpenAI;

type configParams = {
    model?: string;
} | undefined;

export const config = (params: configParams = undefined) => {
    llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: params?.model || 'gpt-5-nano',
    });
};

config();


export const sendUserMessage = async (message: string): Promise<AIMessage> => {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Response als {style}."],
        ["user", "{userMessage}"],
    ]);

    const formattedPrompt = await prompt.format({
        style: 'Master Yoda',
        userMessage: message
    });

    const response = await llm.invoke(formattedPrompt);
 
    return response;
};

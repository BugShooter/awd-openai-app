import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/dist/messages/ai";
import { Runnable } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Define the schema
const adderSchema = z.object({
  a: z.number(),
  b: z.number(),
});

// Create the tool with explicit types
const adderTool = tool(
  async (input): Promise<string> => {
    const sum = input.a + input.b;
    return `The sum of ${input.a} and ${input.b} is ${sum}`;
  },
  {
    name: "adder",
    description: "Adds two numbers together",
    schema: adderSchema,
  }
);

const diceRollSchema = z.object({
    rolls: z.number().min(1).describe("The number of dice to roll."),
});

const diceRollTool = tool(
    async ({ rolls }) => {
        const results = [];
        for (let i = 0; i < rolls; i++) {
            results.push(Math.floor(Math.random() * 6) + 1);
        }
        return results;
    },
    {
        name: 'diceRoll',
        description: 'Rolls a dice.',
        schema: diceRollSchema,
    }
);


export let llm: ChatOpenAI;
export let llmWithTools: Runnable;

type configParams = {
    model?: string;
} | undefined;

export const config = (params: configParams = undefined) => {
    llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: params?.model || 'gpt-5-nano',
    });
    llmWithTools = llm.bindTools([adderTool, diceRollTool]);
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

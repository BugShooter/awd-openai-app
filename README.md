#  Custom ChatGPT Web App

This project demonstrates how to create a full-stack application using React for the frontend and Express.js for the backend and use OpenAI API to provide a conversational interface for users.
This was done as part of a coding challenge for the Advanced Web Development Bootcamp by neue fische GmbH aka Spiced Academy.

Links:
- [neue fische GmbH](https://www.neuefische.de/)
- [Spiced Academy](https://www.spiced-academy.com/)

## Implementation Details

### Create express.js backend

#### Set up a new Express.js project:
   ```bash
   mkdir -p backend
   cd backend
   npm init -y
   npm install express cors dotenv openai
   npm install --save-dev typescript @types/node @types/express @types/cors eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin nodemon ts-node
   ```

#### Create tsconfig.json

```bash
tsc --init \
  --target ES2020 \
  --module commonjs \
  --outDir ./dist \
  --rootDir ./src \
  --strict \
  --esModuleInterop \
  --skipLibCheck \
  --resolveJsonModule
```

#### Create nodemon.json

```bash
echo "Creating nodemon.json..."
cat > nodemon.json << 'EOF'
{
  "watch": ["src"],
  "ext": "ts,js",
  "exec": "ts-node -P tsconfig.json src/index.ts"
}
EOF
```

#### Create .eslintrc.json
```bash
echo "Creating .eslintrc.json..."
cat > .eslintrc.json << 'EOF'
{
  "env": {
    "node": true,
    "es2020": true
  },
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {}
}
EOF
```

#### Create .env

```bash
echo "Creating .env..."
cat > .env << 'EOF'
OPENAI_API_KEY=your_openai_api_key
EOF
```

#### Update package.json scripts

```bash
npm pkg set scripts.build="tsc -p tsconfig.json"
npm pkg set scripts.dev="nodemon"
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.lint="eslint src/**/*.ts"
npm pkg set scripts.lint:fix="eslint src/**/*.ts --fix"
npm pkg set scripts.clean="rm -rf dist node_modules/"
```

### Create .gitignore
```bash
echo "Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
dist/
*.log
.env
*.local
*.local.*
.DS_Store
data/*
!data/.gitkeep
logs/*
!logs/.gitkeep
EOF
```

### Initialize Git and create initial commit

```bash
git init
git branch -m main
git add .
git commit -m "Initial commit"
```

### Create GitHub repository via CLI and push initial commit

```bash
gh repo create BugShooter/awd-openai-app \
    --public --source=. --remote=origin --push
```

### Example of OpenAI response

```json
{
    "assistantMessage": {
        "id": "chatcmpl-C8R2xi5LIeHE4AdFFamXEOMngaTwe",
        "object": "chat.completion",
        "created": 1756126627,
        "model": "gpt-5-nano-2025-08-07",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "Assistant response should be here",
                    "refusal": null,
                    "annotations": []
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 35,
            "completion_tokens": 5967,
            "total_tokens": 6002,
            "prompt_tokens_details": {
                "cached_tokens": 0,
                "audio_tokens": 0
            },
            "completion_tokens_details": {
                "reasoning_tokens": 5440,
                "audio_tokens": 0,
                "accepted_prediction_tokens": 0,
                "rejected_prediction_tokens": 0
            }
        },
        "service_tier": "default",
        "system_fingerprint": null
    }
}
```

## Exercise: Integrating LangChain 
To enhance the capabilities of your Express.js backend, you can integrate LangChain, a powerful library for building applications with language models. Follow these steps to set up LangChain in your existing backend project:

### Install LangChain
```bash
cd backend
npm install langchain @langchain/openai @langchain/core
```

### Step1: wrap all of the api requests with LangChain.

In this step, you will wrap all API requests with LangChain's `ChatOpenAI` instance to leverage its capabilities.
Refer to the official LangChain documentation for more details:
https://js.langchain.com/docs/integrations/chat/

#### Example of using LangChain with OpenAI in your Express.js backend

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/dist/messages/ai";

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName:'gpt-5-nano',
});

const sendMessage = async (message: string): Promise<AIMessage> => {
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
```

#### Response example (AIMessage):
```json
{
  "id": "chatcmpl-C8oCvFGJQufJ3jOdEyxeXgxdojYp4",
  "content": "Hello, you are. The Force strong with you, it is. What guidance do you seek, hmm? Ask, and I will answer. Patience, you must have.",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
        "promptTokens": 17,
        "completionTokens": 1389,
        "totalTokens": 1406
    },
    "finish_reason": "stop",
    "model_name": "gpt-5-nano-2025-08-07"
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "output_tokens": 1389,
    "input_tokens": 17,
    "total_tokens": 1406,
    "input_token_details": {
      "audio": 0,
      "cache_read": 0
    },
    "output_token_details": {
      "audio": 0,
      "reasoning": 1344
    }
  }
}
```

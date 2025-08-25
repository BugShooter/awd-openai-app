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
*.{local,local.*}
.DS_Store
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


2. Create a basic Express server in `index.js`:
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const dotenv = require('dotenv');
   const { Configuration, OpenAIApi } = require('openai');

   dotenv.config();

   const app = express();
   app.use(cors());
   app.use(express.json());

   const configuration = new Configuration({
       apiKey: process.env.OPENAI_API_KEY,
   });
   const openai = new OpenAIApi(configuration);

   app.post('/api/messages', async (req, res) => {
       const { message } = req.body;
       try {
           const response = await openai.createChatCompletion({
               model: 'gpt-3.5-turbo',
               messages: [{ role: 'user', content: message }],
           });
           res.json({ reply: response.choices[0].message.content });
       } catch (error) {
           console.error(error);
           res.status(500).json({ error: 'Internal Server Error' });
       }
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
       console.log(`Server is running on port ${PORT}`);
   });
   ```

3. Create a `.env` file in the backend directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the Express server:
   ```bash
   node index.js
   ```

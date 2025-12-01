# Smart Learning Path Generator

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
   - Create a `.env` file in the `server` folder
   - Add your OpenAI API key (required for AI learning path generation):
   ```
   OPENAI_API_KEY=your-api-key-here
   ```
   - Get your API key from: https://platform.openai.com/api-keys
   - Note: The app will work without the API key but will use fallback content instead of AI-generated paths

### Running the Project

Start both server and client:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend app on `http://localhost:3000`

Open your browser and navigate to `http://localhost:3000`

### Alternative Commands

Run server only:
```bash
npm run server
```

Run client only:
```bash
npm run client
```

### Setting Up OpenAI API (Optional but Recommended)

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Create a new API key
4. Copy the key and add it to `server/.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
5. Restart the server for changes to take effect

Without the API key, the app will still work but will generate basic learning paths instead of AI-powered personalized ones.

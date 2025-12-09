import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

// API Key Validation Endpoint
app.post('/api/validate', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ valid: false, error: 'API Key is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Minimal token usage to test connection
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Test',
    });
    res.json({ valid: true });
  } catch (error) {
    console.error('Validation Error:', error);
    res.status(401).json({ valid: false, error: 'Invalid API Key' });
  }
});

// Chat Proxy Endpoint
app.post('/api/chat', async (req, res) => {
  const { apiKey, history, message, systemInstruction } = req.body;

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key is required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let chatHistory = [];
    let messageToSend = message;

    if (history && Array.isArray(history) && history.length > 0) {
      chatHistory = history.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: messageToSend });
    res.json({ text: result.text });

  } catch (error) {
    console.error('Proxy Error:', error);
    
    if (error.message?.includes('400') || error.message?.includes('401') || error.message?.includes('API key')) {
      return res.status(401).json({ error: 'AUTH_ERROR' });
    }
    
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Catch-all handler to serve index.html for any request not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
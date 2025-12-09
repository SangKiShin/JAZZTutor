import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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

    // Client passes the full history including the current message at the end.
    // We need to separate the "history" for the model context from the "current message" to send.
    // If the client logic passes [old1, old2, current], we use [old1, old2] as history and current as message.
    
    let chatHistory = [];
    let messageToSend = message;

    if (history && Array.isArray(history) && history.length > 0) {
      // Assuming the last message in history is the one we want to process if 'message' param matches it
      // However, usually we reconstruct history from all PREVIOUS messages.
      // The client calls sendMessageToGemini(messages.concat(userMessage), text...)
      // So history includes the latest user message. We should exclude it from 'history' passed to create().
      
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
    
    // Distinguish authentication errors
    if (error.message?.includes('400') || error.message?.includes('401') || error.message?.includes('API key')) {
      return res.status(401).json({ error: 'AUTH_ERROR' });
    }
    
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
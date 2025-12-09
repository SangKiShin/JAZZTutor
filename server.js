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
    // Minimal token usage to test connection using the correct 'gemini-2.5-flash' model
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: 'Test' }] },
    });
    res.json({ valid: true });
  } catch (error) {
    console.error('Validation Error Details:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Invalid API Key or Connection Failed';
    if (error.message) {
      errorMessage = error.message;
    }
    
    // Provide hints for common errors
    if (errorMessage.includes('API key not valid')) {
      errorMessage = 'API Key가 올바르지 않습니다. (Invalid Key)';
    } else if (errorMessage.includes('PERMISSION_DENIED')) {
      errorMessage = 'API Key 권한이 없습니다. (Referrer 제한 등 설정을 확인하세요)';
    }

    res.status(401).json({ valid: false, error: errorMessage });
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
    console.error('Proxy Chat Error:', error);
    
    let statusCode = 500;
    let errorMessage = error.message || 'Internal Server Error';

    if (errorMessage.includes('400') || errorMessage.includes('401') || errorMessage.includes('API key')) {
      statusCode = 401;
      errorMessage = 'AUTH_ERROR'; // Client uses this keyword to re-open modal
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
});

// Catch-all handler to serve index.html for any request not handled by API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
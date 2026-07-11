try { require('dotenv').config(); } catch (_) { /* dotenv is optional locally; not needed on Railway */ }

const express = require('express');
const cors = require('cors');
const { processMessage, processVoiceMessage } = require('./brain');
const voice = require('./voice');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Higher limit than the default 100kb — voice notes sent as base64 need room.
app.use(express.json({ limit: '20mb' }));

function voiceUrlFor(req, text, lang) {
  return `${req.protocol}://${req.get('host')}/api/stream-voice?text=${encodeURIComponent(text)}&lang=${lang}`;
}

// ========== API ==========

// Text in → reply text + voice URL.
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, userName } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const result = await processMessage(message, language || 'auto', userName);
    res.json({ reply: result.reply, language: result.language, voiceUrl: voiceUrlFor(req, result.reply, result.language) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voice in (base64 audio) → reply text + voice URL. Gemini listens to the
// audio directly — no separate speech-to-text step needed.
app.post('/api/voice-chat', async (req, res) => {
  try {
    const { audio, mimeType, language, userName } = req.body;
    if (!audio) return res.status(400).json({ error: 'audio (base64) required' });
    const result = await processVoiceMessage(audio, mimeType || 'audio/webm', language || 'auto', userName);
    res.json({ reply: result.reply, language: result.language, voiceUrl: voiceUrlFor(req, result.reply, result.language) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Streams the reply as actual audio/mpeg bytes (this is what voiceUrl points to).
app.get('/api/stream-voice', async (req, res) => {
  const { text, lang } = req.query;
  if (!text) return res.status(400).json({ error: 'text required' });
  await voice.streamVoice(text, lang || 'hi', res);
});

app.get('/api/docs', (req, res) => {
  res.json({
    name: '✦ ANJAN AI API',
    endpoints: [
      { method: 'POST', path: '/api/chat', body: { message: 'string (required)', language: 'hi|bn|en|auto', userName: 'string' }, description: 'Text in, get reply text + voiceUrl' },
      { method: 'POST', path: '/api/voice-chat', body: { audio: 'base64 string (required)', mimeType: 'audio/webm|audio/ogg|audio/mp3|audio/wav', language: 'hi|bn|en|auto', userName: 'string' }, description: 'Voice in, get reply text + voiceUrl' },
      { method: 'GET', path: '/api/stream-voice', query: { text: 'string (required)', lang: 'string' }, description: 'Streams reply as audio/mpeg — this is what voiceUrl points to' },
      { method: 'GET', path: '/health', description: 'Health check' }
    ]
  });
});

app.get('/', (req, res) => res.json({ status: 'ANJAN AI API is running', docs: '/api/docs' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`✦ ANJAN AI API LIVE on ${PORT}`));

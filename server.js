const express = require('express');
const cors = require('cors');
const path = require('path');
const { processMessage } = require('./brain');
const voice = require('./voice');
const plugins = require('./plugins/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ========== API ==========

app.post('/api/full-chat', async (req, res) => {
  try {
    const { message, language, userName, mood } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const lang = language || 'hi';
    const selectedMood = mood || 'friendly';
    const textResult = await processMessage(message, lang, userName || 'दोस्त');
    const voiceMusic = voice.createVoiceWithMusic(textResult.reply, lang, selectedMood);
    res.json({ ...textResult, ...voiceMusic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, userName } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const result = await processMessage(message, language || 'hi', userName || 'दोस्त');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

app.post('/api/voice-music', (req, res) => {
  try {
    const { text, language, mood } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    const result = voice.createVoiceWithMusic(text, language || 'hi', mood || 'friendly');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Voice generation failed' });
  }
});

app.get('/api/stream-voice', async (req, res) => {
  const { text, lang } = req.query;
  if (!text) return res.status(400).json({ error: 'Text required' });
  await voice.streamVoice(text, lang || 'hi', res);
});

app.get('/music-player', (req, res) => {
  const mood = req.query.mood || 'romantic';
  const music = voice.MUSIC_LIBRARY[mood] || voice.MUSIC_LIBRARY.friendly;
  res.send(voice.generateMusicPlayerHTML(mood, music));
});

app.get('/api/play-music/:mood', (req, res) => {
  const music = voice.MUSIC_LIBRARY[req.params.mood] || voice.MUSIC_LIBRARY.friendly;
  res.redirect(music.url);
});

app.get('/api/moods', (req, res) => {
  res.json({ moods: [
    { id: 'romantic', name: '💕 Romantic' }, { id: 'friendly', name: '🫶 Friendly' },
    { id: 'happy', name: '😄 Happy' }, { id: 'sad', name: '😢 Sad' },
    { id: 'angry', name: '😤 Angry' }, { id: 'professional', name: '👔 Professional' },
    { id: 'emotional', name: '🥺 Emotional' }, { id: 'sarcastic', name: '😏 Sarcastic' }
  ]});
});

app.get('/api/languages', (req, res) => {
  res.json({ languages: [
    { code: 'hi', name: '🇮🇳 हिन्दी' }, { code: 'bn', name: '🇧🇩 বাংলা' },
    { code: 'en', name: '🇺🇸 English' }, { code: 'auto', name: '🤖 Auto' }
  ]});
});

app.get('/api/music-library', (req, res) => {
  res.json({ library: voice.getMusicLibrary() });
});

app.get('/api/plugins', (req, res) => {
  res.json({ plugins: plugins.list() });
});

app.post('/api/plugin-execute', async (req, res) => {
  try {
    const { pluginId, message, language } = req.body;
    if (!pluginId || !message) return res.status(400).json({ error: 'Missing fields' });
    const result = await plugins.execute(pluginId, message, language || 'hi');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Plugin failed' });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`✦ 𝙰𝙽𝙹𝙰𝙽 ʬ 合 LIVE on ${PORT}`));

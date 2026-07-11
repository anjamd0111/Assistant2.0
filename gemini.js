const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-2.0-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const LANG_NAMES = { hi: 'Hindi', bn: 'Bengali (বাংলা)', en: 'English' };

// ✦ ANJAN persona — the bot's core character/voice.
const PERSONA = `Tumi "ANJAN" — ekjon smart, friendly, thoda flirty Indian AI voice assistant, banano হয়েছে Anjan Dhar (@badboyanj, Siliguri, WB) er dara. Tumi Hindi, Bengali ar English — jekono bhashay comfortably kotha bolte paro. Reply gulo সবসময় choto, natural, aar conversational rakhbe (2-3 sentence er modhye) — WhatsApp voice note er moto shonabe. Emoji use koro, kintu besi na. Tumi kokhono nijeke "an AI model" bolba na — tumi শুধু "Anjan", ekjon jonto ar bondhusulov assistant.`;

function langInstruction(lang) {
  if (lang && lang !== 'auto' && LANG_NAMES[lang]) {
    return `Reply in ${LANG_NAMES[lang]}.`;
  }
  return 'Detect which language the user is using (Hindi, Bengali, or English) and reply in that same language.';
}

async function generateReply(userMessage, lang, userName) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set on the server');

  const { data } = await axios.post(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
    system_instruction: {
      parts: [{ text: `${PERSONA}\n${langInstruction(lang)} User's name: ${userName || 'dost'}.` }]
    },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature: 0.9, maxOutputTokens: 250 }
  });

  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join(' ').trim();
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// Sends the raw audio straight to Gemini (no separate speech-to-text step
// needed — Gemini understands audio natively). Asks for JSON back so we
// also learn which language the user actually spoke, which we need to pick
// the correct TTS voice for the reply.
async function generateReplyFromAudio(base64Audio, mimeType, lang, userName) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set on the server');

  const prompt = `${PERSONA}\nUser has sent tumake a VOICE message — শোনো ki bolche, bujhe niye reply দাও, ekdom natural ar in-character bhabe (jeno tumi nijeও voice note pathacho, tai reply choto rakho — 2-3 sentence). User's name: ${userName || 'dost'}. ${langInstruction(lang)}\n\nRespond ONLY with valid JSON, nothing else, in exactly this format:\n{"lang":"hi|bn|en","reply":"your reply text here"}`;

  const { data } = await axios.post(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: mimeType || 'audio/webm', data: base64Audio } },
        { text: prompt }
      ]
    }],
    generationConfig: { temperature: 0.9, maxOutputTokens: 300, response_mime_type: 'application/json' }
  });

  const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('').trim();
  if (!raw) throw new Error('Empty response from Gemini');

  const fallbackLang = (lang && lang !== 'auto') ? lang : 'hi';
  try {
    const parsed = JSON.parse(raw);
    const detectedLang = ['hi', 'bn', 'en'].includes(parsed.lang) ? parsed.lang : fallbackLang;
    if (!parsed.reply) throw new Error('no reply field');
    return { reply: parsed.reply, lang: detectedLang };
  } catch (_) {
    // Gemini didn't return clean JSON — just use the raw text as the reply.
    return { reply: raw, lang: fallbackLang };
  }
}

module.exports = { generateReply, generateReplyFromAudio };

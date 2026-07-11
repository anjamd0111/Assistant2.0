const gemini = require('./gemini');

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  return 'en';
}

// Only used if Gemini fails (no API key, network issue, quota) so the bot
// never goes completely silent.
const FALLBACK = {
  hi: 'माफ़ करना, अभी थोड़ा दिक्कत हो रही है। थोड़ी देर बाद फिर try करो 🙏',
  bn: 'দুঃখিত, এখন একটু সমস্যা হচ্ছে। একটু পরে আবার try করো 🙏',
  en: 'Sorry, having a little trouble right now. Try again in a bit 🙏'
};

// Text in → text out.
async function processMessage(message, language, userName) {
  const msg = message.trim();
  const lang = language === 'auto' ? detectLanguage(msg) : (language || 'hi');
  try {
    const reply = await gemini.generateReply(msg, lang, userName);
    return { reply, language: lang };
  } catch (err) {
    console.error('Gemini text error:', err.message);
    return { reply: FALLBACK[lang] || FALLBACK.en, language: lang };
  }
}

// Voice in → text out. Gemini listens to the raw audio directly (no
// separate speech-to-text step) and also tells us which language the user
// spoke, so the caller knows which TTS voice to use for the reply.
async function processVoiceMessage(base64Audio, mimeType, language, userName) {
  try {
    const { reply, lang } = await gemini.generateReplyFromAudio(base64Audio, mimeType, language, userName);
    return { reply, language: lang };
  } catch (err) {
    console.error('Gemini voice error:', err.message);
    const lang = (language && language !== 'auto') ? language : 'hi';
    return { reply: FALLBACK[lang] || FALLBACK.en, language: lang };
  }
}

module.exports = { processMessage, processVoiceMessage, detectLanguage };

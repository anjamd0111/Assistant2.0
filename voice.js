const axios = require('axios');

// Generates a Google Translate TTS URL for the given text/language.
// NOTE: this is an unofficial endpoint and caps out around ~200 characters
// per request — long replies get truncated. Fine for voice-note-length bot
// replies; swap for a real TTS provider (ElevenLabs, Google Cloud TTS) if
// you need longer or higher-quality audio.
function generateVoiceUrl(text, lang = 'hi') {
  const safeText = text.length > 200 ? text.slice(0, 200) : text;
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&ttsspeed=1&q=${encodeURIComponent(safeText)}`;
}

// Streams the TTS audio through our own server (instead of handing out the
// raw Google Translate link) because that link 400s for clients that don't
// send browser-like headers — e.g. a bot's HTTP client. This makes it work
// reliably for everyone, not just browsers.
async function streamVoice(text, lang, res) {
  try {
    const response = await axios({
      method: 'get',
      url: generateVoiceUrl(text, lang),
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });
    res.set('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (err) {
    res.redirect(generateVoiceUrl(text, lang));
  }
}

module.exports = { generateVoiceUrl, streamVoice };

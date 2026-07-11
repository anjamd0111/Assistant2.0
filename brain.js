const plugins = require('./plugins/index');

function detectLanguage(text) {
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  return 'en';
}

const templates = {
  hi: {
    greetings: ['नमस्ते! कैसे हो? 😊🫶', 'अरे! कितने दिनों बाद! ✨', 'हैलो मेरे दोस्त! 💕'],
    howAreYou: ['मैं बढ़िया हूं! तुम बताओ? 😊', 'एकदम मस्त! और तुम? 🫶'],
    love: ['प्यार... बहुत खूबसूरत एहसास! ❤️', 'तुमसे बात करके दिल खुश हो गया! 🥰'],
    romantic: ['तुम्हारी बातें सुनकर दिल बाग-बाग... 💕', 'तुम्हारी आवाज़ मेरी favourite है! 🎤💖'],
    sad: ['उदास? क्या हुआ बताओ? 🥺', 'चिंता मत करो, सब ठीक होगा! 🤗'],
    angry: ['इस पर तो मुझे भी गुस्सा आता! 😤', 'बिल्कुल सही कहा! 😡'],
    professional: ['आपका प्रश्न महत्वपूर्ण है, विश्लेषण करती हूं...'],
    happy: ['हा हा! मज़ा आ गया! 😄🎉', 'बहुत खुशी हुई! 🥳'],
    sarcastic: ['वाह! ग्रेट! (असल में नहीं 😏)', 'कितनी बड़ी बात! (शायद 😂)'],
    emotional: ['ये तो बहुत emotional बात है! 🥺', 'आंखें भर आईं... 😢'],
    fallback: ['हम्म... थोड़ा और बताओगे? 🤔', 'Interesting! जारी रखो 👂'],
    wakeResponse: ['जी! मैं यहां हूं! बोलो 🎤💚', 'अंजन रेडी! कमांड बोलो ⚡']
  },
  bn: {
    greetings: ['এই যে! কেমন আছো? 😊🫶', 'আসসালামু আলাইকুম! ✨'],
    howAreYou: ['আমি দারুণ! তুমি? 😊', 'ফাটাফাটি! আর তুমি? 🫶'],
    love: ['ভালোবাসা... খুব সুন্দর! ❤️', 'তোমার কথা ভাবলেই ভালো লাগে! 🥰'],
    romantic: ['তোমার সাথে কথা বলে মন ভরে না... 💕'],
    sad: ['মন খারাপ? কি হয়েছে? 🥺', 'সব ঠিক হয়ে যাবে! 🤗'],
    angry: ['রাগ হচ্ছে? আমিও! 😤'],
    professional: ['আপনার প্রশ্ন গুরুত্বপূর্ণ...'],
    happy: ['হা হা! মজা! 😄'],
    sarcastic: ['ওহ! দারুণ! (না 😏)'],
    emotional: ['খুব ইমোশনাল! 🥺', 'চোখে পানি চলে এলো! 😢'],
    fallback: ['আরেকটু বলবে? 🤔', 'ইন্টারেস্টিং! 👂'],
    wakeResponse: ['জী! আমি এখানে! 🎤💚', 'আনজান রেডি! ⚡']
  },
  en: {
    greetings: ['Hey! How are you? 😊🫶', 'Hello my friend! 💕'],
    howAreYou: ["I'm great! What about you? 😊", 'Absolutely fantastic! 🫶'],
    love: ['Love... beautiful feeling! ❤️', 'Talking to you makes my day! 🥰'],
    romantic: ['Your voice is my favorite... 💕'],
    sad: ['Feeling sad? Tell me! 🥺', 'Everything will be okay! 🤗'],
    angry: ['That would make anyone angry! 😤'],
    professional: ['Your query is important, analyzing...'],
    happy: ['Haha! So much fun! 😄'],
    sarcastic: ['Wow! Great! (Not really 😏)'],
    emotional: ['That\'s so touching... 🥺'],
    fallback: ['Hmm... tell me more! 🤔', 'Interesting! 👂'],
    wakeResponse: ['Yes! I\'m here! 🎤💚', 'Anjan ready! ⚡']
  }
};

function detectPlugin(msg, lang) {
  const pluginList = plugins.list();
  for (const p of pluginList) {
    const kws = p.keywords[lang] || p.keywords.en || [];
    if (kws.some(k => msg.toLowerCase().includes(k.toLowerCase()))) return p.id;
  }
  return null;
}

function detectIntent(msg, lang, t) {
  const m = msg.toLowerCase();
  if (/anjan|आन्जान|আনজান/i.test(m) && m.length < 10) return getRandom(t.wakeResponse);
  if (/hello|hi|hey|नमस्ते|হাই/i.test(m) && m.length < 12) return getRandom(t.greetings);
  if (/how are you|कैसे हो|কেমন আছ/i.test(m)) return getRandom(t.howAreYou);
  if (/love|प्यार|ভালোবাসা|romantic|रोमांटिक/i.test(m) && m.length < 25) return getRandom(t.romantic || t.love);
  if (/sad|उदास|depress|কষ্ট|দুঃখ/i.test(m)) return getRandom(t.sad || t.fallback);
  if (/angry|गुस्सा|রাগ/i.test(m)) return getRandom(t.angry || t.fallback);
  if (/professional|formal|पेशेवर|প্রফেশনাল/i.test(m)) return getRandom(t.professional || t.fallback);
  if (/happy|खुश|আনন্দ|fun/i.test(m)) return getRandom(t.happy || t.fallback);
  if (/sarcastic|sarcasm|व्यंग्य|বিদ্রূপ/i.test(m)) return getRandom(t.sarcastic || t.fallback);
  if (/emotional|भावनात्मक|ইমোশনাল/i.test(m)) return getRandom(t.emotional || t.fallback);
  return getRandom(t.fallback);
}

async function processMessage(message, language, userName) {
  const msg = message.trim();
  const lang = language === 'auto' ? detectLanguage(msg) : language;
  const t = templates[lang] || templates.en;
  const pluginId = detectPlugin(msg, lang);
  if (pluginId) {
    const res = await plugins.execute(pluginId, msg, lang);
    return { reply: res.reply, language: lang, type: 'plugin', plugin: pluginId, data: res.data || null };
  }
  let reply = detectIntent(msg, lang, t);
  reply = reply.replace(/तुम|তুই|you/gi, userName || (lang==='hi'?'दोस्त':lang==='bn'?'দোস্ত':'friend'));
  return { reply, language: lang, type: 'conversation', plugin: null };
}

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
module.exports = { processMessage, detectLanguage };

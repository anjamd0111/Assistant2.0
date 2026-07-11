module.exports = {
  id: 'custom', name: '⚡ Custom', description: 'Your own commands',
  keywords: { hi: ['कस्टम'], bn: ['কাস্টম'], en: ['custom'] },
  async execute(msg, lang) {
    return { reply: lang==='hi'?'यह आपका कस्टम प्लगइन है! 🚀':lang==='bn'?'এটা তোমার কাস্টম প্লাগইন! 🚀':'This is your custom plugin! 🚀' };
  }
};

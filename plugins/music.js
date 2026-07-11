module.exports = {
  id: 'music', name: '🎵 Song', description: 'Play music',
  keywords: { hi: ['गाना','संगीत'], bn: ['গান','মিউজিক'], en: ['song','music'] },
  async execute(msg, lang) {
    return { reply: lang==='hi'?'🎵 गाना चला रही हूं... enjoy! 🎶':lang==='bn'?'🎵 গান চালাচ্ছি... উপভোগ করো! 🎶':'🎵 Playing song... enjoy! 🎶' };
  }
};

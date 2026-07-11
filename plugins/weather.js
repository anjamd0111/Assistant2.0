module.exports = {
  id: 'weather', name: '🌤️ Weather', description: 'Weather updates',
  keywords: { hi: ['मौसम','तापमान','बारिश'], bn: ['আবহাওয়া','তাপমাত্রা','বৃষ্টি'], en: ['weather','temperature','rain'] },
  async execute(msg, lang) {
    const city = 'Delhi'; const temp = 25 + Math.floor(Math.random()*15);
    const replies = {
      hi: `अभी ${city} में तापमान ${temp}°C है। मौसम अच्छा है! ☀️`,
      bn: `এখন ${city} এ তাপমাত্রা ${temp}°C। সুন্দর!`,
      en: `${city} temperature is ${temp}°C. Nice!`
    };
    return { reply: replies[lang] || replies.en, data: { city, temp } };
  }
};

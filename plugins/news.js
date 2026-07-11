module.exports = {
  id: 'news', name: '📰 News', description: 'Latest headlines',
  keywords: { hi: ['समाचार','खबर','न्यूज़'], bn: ['নিউজ','খবর'], en: ['news','headlines'] },
  async execute(msg, lang) {
    const n = lang==='hi'?['दिल्ली में बारिश का अलर्ट 🌧️','भारत ने शृंखला जीती 🏆','नई तकनीक: AI क्रांति 🚀']:
              lang==='bn'?['ঢাকায় বৃষ্টির সম্ভাবনা 🌧️','বাংলাদেশের জয় 🏆','প্রযুক্তিতে নতুন বিপ্লব 🚀']:
              ['Rain alert in Delhi 🌧️','India wins series 🏆','Tech: AI revolution 🚀'];
    return { reply: '📰 '+(lang==='hi'?'आज की मुख्य खबरें':lang==='bn'?'আজকের খবর':'Today\'s News')+':\n'+n.map((h,i)=>`${i+1}. ${h}`).join('\n') };
  }
};

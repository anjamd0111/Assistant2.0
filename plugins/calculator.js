module.exports = {
  id: 'calculator', name: '🧮 Calculator', description: 'Math calculations',
  keywords: { hi: ['गणना','जोड़','घटाव'], bn: ['গণনা','যোগ','বিয়োগ'], en: ['calculate','math','+','-','*','/'] },
  async execute(msg, lang) {
    const expr = msg.replace(/[^0-9+\-*/.() ]/g, '').trim();
    try {
      if (!expr) throw new Error('empty');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr});`)();
      if (typeof result !== 'number' || !isFinite(result)) throw new Error('bad result');
      return { reply: (lang==='hi'?'🧮 परिणाम':'🧮 Result')+`: ${expr} = ${result}`, data:{result} };
    } catch {
      return { reply: lang==='hi'?'गणना नहीं कर सका!':lang==='bn'?'গণনা করতে পারলাম না!':'Cannot calculate!' };
    }
  }
};

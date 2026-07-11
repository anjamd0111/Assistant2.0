const weather = require('./weather');
const news = require('./news');
const calculator = require('./calculator');
const music = require('./music');
const custom = require('./custom');
const plugins = [weather, news, calculator, music, custom];

function list() {
  return plugins.map(p => ({ id: p.id, name: p.name, description: p.description, keywords: p.keywords }));
}

async function execute(pluginId, message, lang) {
  const plugin = plugins.find(p => p.id === pluginId);
  if (!plugin) return { reply: lang==='hi'?'प्लगइन नहीं मिला!':lang==='bn'?'প্লাগইন পাওয়া যায়নি!':'Plugin not found!' };
  return await plugin.execute(message, lang);
}

module.exports = { list, execute };

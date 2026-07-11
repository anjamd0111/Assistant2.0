const axios = require('axios');

// Music library.
// NOTE: the original URLs here (cdn.pixabay.com/audio/.../audio_XXXX.mp3)
// were placeholder/fake links that don't actually exist — every request
// would 404 and no background music would ever play. Replaced with
// SoundHelix's freely-hosted demo tracks, which are real, stable, and need
// no API key. Swap these out any time for your own hosted mp3s — just keep
// the same { name, url, fallback, volume, description } shape.
const MUSIC_LIBRARY = {
  romantic: {
    name: '💕 Romantic Piano',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    volume: 0.15,
    description: 'Soft romantic piano'
  },
  happy: {
    name: '😄 Happy Cheerful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    volume: 0.15,
    description: 'Cheerful beat'
  },
  sad: {
    name: '😢 Emotional Sad',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    volume: 0.15,
    description: 'Sad violin'
  },
  angry: {
    name: '😤 Intense',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
    volume: 0.12,
    description: 'Intense dramatic'
  },
  friendly: {
    name: '🫶 Warm Acoustic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    volume: 0.15,
    description: 'Warm guitar'
  },
  professional: {
    name: '👔 Ambient',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
    volume: 0.10,
    description: 'Subtle corporate'
  },
  emotional: {
    name: '🥺 Cinematic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    volume: 0.15,
    description: 'Deep emotional'
  },
  sarcastic: {
    name: '😏 Playful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
    volume: 0.15,
    description: 'Witty tune'
  }
};

function generateVoiceUrl(text, lang = 'hi', mood = 'friendly') {
  const speedMap = { romantic: 0.85, happy: 1.05, sad: 0.85, angry: 1.1, friendly: 0.95, professional: 1.0, emotional: 0.9, sarcastic: 1.0 };
  const speed = speedMap[mood] || 0.95;
  // NOTE: Google Translate's TTS endpoint is unofficial and caps out around
  // ~200 characters per request — long replies will get cut off or fail.
  // It's fine for a demo/hobby project, but for production-grade voice swap
  // this for a real TTS provider (e.g. ElevenLabs, Google Cloud TTS, Azure).
  const safeText = text.length > 200 ? text.slice(0, 200) : text;
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&ttsspeed=${speed}&q=${encodeURIComponent(safeText)}`;
}

function createVoiceWithMusic(text, lang = 'hi', mood = 'friendly', options = {}) {
  const music = MUSIC_LIBRARY[mood] || MUSIC_LIBRARY.friendly;
  return {
    text, language: lang, mood,
    voice: { url: generateVoiceUrl(text, lang, mood), volume: options.voiceVolume || 1.0 },
    music: {
      url: music.url,
      fallback: music.fallback,
      volume: options.musicVolume || music.volume,
      loop: true
    },
    player: {
      voiceVolume: 1.0,
      musicVolume: music.volume
    }
  };
}

async function streamVoice(text, lang, res, mood) {
  try {
    const response = await axios({
      method: 'get',
      url: generateVoiceUrl(text, lang, mood),
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });
    res.set('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (err) {
    res.redirect(generateVoiceUrl(text, lang, mood));
  }
}

function getMusicLibrary() {
  return Object.entries(MUSIC_LIBRARY).map(([mood, info]) => ({ mood, name: info.name, description: info.description }));
}

function generateMusicPlayerHTML(mood, music) {
  const moods = Object.keys(MUSIC_LIBRARY).map(m => `<a class="mood-btn${m===mood?' active':''}" href="/music-player?mood=${m}">${MUSIC_LIBRARY[m].name.split(' ')[0]}</a>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>🎵 ANJAN Music — ${music.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#0a0a0a,#1a1a2e);min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',sans-serif}.player{background:rgba(20,20,20,0.9);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:40px 30px;text-align:center;max-width:420px;width:90%;box-shadow:0 30px 60px rgba(0,0,0,0.5)}.bars{display:flex;align-items:flex-end;justify-content:center;gap:6px;height:100px;margin:25px 0}.bar{width:8px;border-radius:10px;animation:dance 1.2s infinite ease-in-out}.bar:nth-child(1){height:45px;animation-delay:0s;background:#ff6b9d}.bar:nth-child(2){height:70px;animation-delay:0.15s;background:#c44dff}.bar:nth-child(3){height:55px;animation-delay:0.3s;background:#ff6b9d}.bar:nth-child(4){height:90px;animation-delay:0.45s;background:#c44dff}.bar:nth-child(5){height:60px;animation-delay:0.6s;background:#ff6b9d}.bar:nth-child(6){height:80px;animation-delay:0.75s;background:#c44dff}.bar:nth-child(7){height:50px;animation-delay:0.9s;background:#ff6b9d}.bar:nth-child(8){height:75px;animation-delay:1.05s;background:#c44dff}@keyframes dance{0%,100%{transform:scaleY(0.5)}50%{transform:scaleY(1.4)}}.mood-tag{display:inline-block;padding:8px 20px;background:linear-gradient(135deg,#ff6b9d,#c44dff);border-radius:20px;color:#fff;font-weight:600;font-size:14px;margin-bottom:15px}.music-name{color:#fff;font-size:18px;font-weight:700;margin-bottom:5px}.music-desc{color:#888;font-size:13px;margin-bottom:20px}.btn{padding:12px 24px;border:none;border-radius:25px;cursor:pointer;font-size:14px;font-weight:600;transition:all 0.3s;margin:5px}.btn-play{background:linear-gradient(135deg,#ff6b9d,#c44dff);color:#fff}.btn-play:hover{transform:scale(1.05);box-shadow:0 10px 25px rgba(255,107,157,0.4)}.btn-stop{background:rgba(255,255,255,0.1);color:#fff}.mood-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px;justify-content:center}.mood-btn{padding:6px 14px;border-radius:15px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#aaa;cursor:pointer;font-size:12px;transition:all 0.3s;text-decoration:none}.mood-btn:hover,.mood-btn.active{background:rgba(255,255,255,0.1);color:#fff;border-color:#ff6b9d}audio{display:none}</style></head>
<body><div class="player"><div class="mood-tag">${music.name}</div><div class="music-name">🎵 ${music.description}</div><div class="music-desc">Background Music — Mood: ${mood}</div><div class="bars"><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div></div><button class="btn btn-play" onclick="togglePlay()">▶️ Play Music</button><button class="btn btn-stop" onclick="stopMusic()">⏹️ Stop</button><div class="mood-list">${moods}</div></div><audio id="bgMusic" src="${music.url}" loop></audio>
<script>const a=document.getElementById('bgMusic');a.volume=${music.volume};let p=false;function togglePlay(){if(p){a.pause();document.querySelector('.btn-play').textContent='▶️ Play Music'}else{a.play();document.querySelector('.btn-play').textContent='⏸️ Pause'}p=!p}function stopMusic(){a.pause();a.currentTime=0;p=false;document.querySelector('.btn-play').textContent='▶️ Play Music'}a.play().then(()=>{p=true;document.querySelector('.btn-play').textContent='⏸️ Pause'}).catch(()=>{})</script></body></html>`;
}

module.exports = { MUSIC_LIBRARY, createVoiceWithMusic, generateVoiceUrl, streamVoice, getMusicLibrary, generateMusicPlayerHTML };

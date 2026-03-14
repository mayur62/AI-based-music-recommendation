const EMOTION_KEYWORDS: Record<string, string[]> = {
  happy: ["happy", "joy", "fun", "dance", "party", "upbeat", "good", "bright", "sunny", "celebrate", "smile", "love", "paradise", "summer", "sunshine"],
  sad: ["sad", "cry", "tears", "lonely", "heartbreak", "miss", "pain", "hurt", "broken", "lost", "alone", "goodbye", "rain", "blues", "sorrow", "melancholy"],
  angry: ["angry", "rage", "fight", "hate", "mad", "fury", "rebel", "war", "scream", "metal", "punk", "rock", "aggressive", "intense", "power"],
  calm: ["calm", "peaceful", "relax", "chill", "meditation", "sleep", "quiet", "soft", "gentle", "ambient", "soothing", "tranquil", "slow", "acoustic"],
  excited: ["excited", "hype", "energy", "pump", "adrenaline", "fast", "rush", "thrill", "epic", "boss", "workout", "motivation", "fire", "lit", "banger"],
};

const GENRE_EMOTION_MAP: Record<string, string> = {
  pop: "happy",
  dance: "excited",
  edm: "excited",
  electronic: "excited",
  house: "excited",
  techno: "excited",
  metal: "angry",
  "heavy metal": "angry",
  punk: "angry",
  rock: "angry",
  "hard rock": "angry",
  blues: "sad",
  soul: "sad",
  rnb: "sad",
  "r&b": "sad",
  classical: "calm",
  jazz: "calm",
  ambient: "calm",
  "lo-fi": "calm",
  lofi: "calm",
  country: "happy",
  folk: "calm",
  indie: "calm",
  alternative: "sad",
  rap: "excited",
  hiphop: "excited",
  "hip hop": "excited",
  "hip-hop": "excited",
  reggae: "happy",
  latin: "happy",
};

export function detectEmotion(title: string, genre: string): string {
  const combined = (title + " " + genre).toLowerCase();

  // Check genre first
  for (const [g, emotion] of Object.entries(GENRE_EMOTION_MAP)) {
    if (combined.includes(g)) {
      return emotion;
    }
  }

  // Then check keywords
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combined.includes(keyword)) {
        return emotion;
      }
    }
  }

  return "calm";
}

export function detectGenre(title: string): string {
  const t = title.toLowerCase();
  const genreKeywords: Record<string, string[]> = {
    "pop": ["pop"],
    "rock": ["rock", "guitar"],
    "hip hop": ["rap", "hip hop", "hiphop", "trap"],
    "electronic": ["edm", "electronic", "dance", "house", "techno"],
    "r&b": ["rnb", "r&b", "soul"],
    "classical": ["classical", "orchestra", "symphony"],
    "jazz": ["jazz"],
    "country": ["country"],
    "metal": ["metal"],
  };
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(k => t.includes(k))) return genre;
  }
  return "pop";
}

export function getOppositeEmotion(emotion: string): string {
  const opposites: Record<string, string> = {
    happy: "calm",
    sad: "excited",
    angry: "calm",
    calm: "happy",
    excited: "calm",
  };
  return opposites[emotion] || "happy";
}

export function getSimilarEmotions(emotion: string): string[] {
  const similar: Record<string, string[]> = {
    happy: ["happy", "excited"],
    sad: ["sad", "calm"],
    angry: ["angry", "excited"],
    calm: ["calm", "sad"],
    excited: ["excited", "happy"],
  };
  return similar[emotion] || [emotion];
}

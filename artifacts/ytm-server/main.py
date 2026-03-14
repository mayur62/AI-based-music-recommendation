import os
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="YouTube Music Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMOTION_KEYWORDS = {
    "happy": ["happy", "joy", "fun", "dance", "party", "upbeat", "good", "bright", "sunny", "celebrate", "smile", "love", "paradise", "summer", "sunshine", "cheerful", "positive"],
    "sad": ["sad", "cry", "tears", "lonely", "heartbreak", "miss", "pain", "hurt", "broken", "lost", "alone", "goodbye", "rain", "blues", "sorrow", "melancholy", "grief"],
    "angry": ["angry", "rage", "fight", "hate", "mad", "fury", "rebel", "war", "scream", "aggressive", "intense", "power", "revenge", "furious"],
    "calm": ["calm", "peaceful", "relax", "chill", "meditation", "sleep", "quiet", "soft", "gentle", "ambient", "soothing", "tranquil", "slow", "acoustic", "serene"],
    "excited": ["excited", "hype", "energy", "pump", "adrenaline", "fast", "rush", "thrill", "epic", "workout", "motivation", "fire", "banger", "lit", "hype"],
}

GENRE_EMOTION_MAP = {
    "pop": "happy", "dance": "excited", "edm": "excited", "electronic": "excited",
    "house": "excited", "techno": "excited", "metal": "angry", "heavy metal": "angry",
    "punk": "angry", "rock": "angry", "hard rock": "angry", "blues": "sad",
    "soul": "sad", "r&b": "sad", "rnb": "sad", "classical": "calm", "jazz": "calm",
    "ambient": "calm", "lo-fi": "calm", "lofi": "calm", "country": "happy",
    "folk": "calm", "indie": "calm", "alternative": "sad", "rap": "excited",
    "hip hop": "excited", "hip-hop": "excited", "reggae": "happy", "latin": "happy",
}


def detect_emotion(title: str, genre: str = "") -> str:
    combined = (title + " " + genre).lower()
    for g, emotion in GENRE_EMOTION_MAP.items():
        if g in combined:
            return emotion
    for emotion, keywords in EMOTION_KEYWORDS.items():
        for kw in keywords:
            if kw in combined:
                return emotion
    return "calm"


def detect_genre(title: str) -> str:
    t = title.lower()
    genre_map = {
        "pop": ["pop"],
        "rock": ["rock", "guitar"],
        "hip hop": ["rap", "hip hop", "hiphop", "trap"],
        "electronic": ["edm", "electronic", "dance", "house", "techno"],
        "r&b": ["rnb", "r&b", "soul"],
        "classical": ["classical", "orchestra", "symphony"],
        "jazz": ["jazz"],
        "country": ["country"],
        "metal": ["metal"],
    }
    for genre, keywords in genre_map.items():
        if any(k in t for k in keywords):
            return genre
    return "pop"


def parse_duration(duration_str) -> int:
    if not duration_str:
        return 0
    if isinstance(duration_str, int):
        return duration_str
    parts = str(duration_str).split(":")
    try:
        if len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    except:
        pass
    return 0


class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 20


@app.post("/ytm/search")
async def search_songs(request: SearchRequest):
    try:
        from ytmusicapi import YTMusic
        ytm = YTMusic()
        results = ytm.search(request.query, limit=request.limit or 20)

        songs = []
        for item in results:
            try:
                kind = item.get("resultType", "")
                if kind not in ("song", "video", ""):
                    continue

                video_id = item.get("videoId", "")
                if not video_id:
                    continue

                title = item.get("title", "Unknown")
                
                # Extract artist
                artists = item.get("artists", [])
                artist = artists[0]["name"] if artists else item.get("artist", "Unknown")

                # Thumbnail
                thumbnails = item.get("thumbnails", [])
                thumbnail = thumbnails[-1]["url"] if thumbnails else ""
                
                # Duration
                duration_str = item.get("duration", "0:00")
                duration = parse_duration(duration_str)

                # Genre/emotion
                genre = detect_genre(title)
                emotion = detect_emotion(title, genre)

                songs.append({
                    "youtubeId": video_id,
                    "title": title,
                    "artist": artist,
                    "genre": genre,
                    "emotion": emotion,
                    "thumbnail": thumbnail,
                    "duration": duration,
                })
            except Exception as e:
                print(f"Error parsing song: {e}")
                continue

        return {"results": songs[:request.limit or 20]}

    except ImportError:
        # Fallback: return mock results so the app still works
        return await search_fallback(request.query)
    except Exception as e:
        print(f"YTMusic search error: {e}")
        return await search_fallback(request.query)


async def search_fallback(query: str):
    """Fallback search using YouTube Data API or mock data"""
    # Return some popular songs as mock data
    mock_songs = [
        {"youtubeId": "dQw4w9WgXcQ", "title": "Never Gonna Give You Up", "artist": "Rick Astley", "genre": "pop", "emotion": "happy", "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", "duration": 213},
        {"youtubeId": "fJ9rUzIMcZQ", "title": "Bohemian Rhapsody", "artist": "Queen", "genre": "rock", "emotion": "excited", "thumbnail": "https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg", "duration": 354},
        {"youtubeId": "kJQP7kiw5Fk", "title": "Despacito", "artist": "Luis Fonsi", "genre": "latin", "emotion": "happy", "thumbnail": "https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg", "duration": 282},
        {"youtubeId": "YVkUvmDQ3HY", "title": "Shape of You", "artist": "Ed Sheeran", "genre": "pop", "emotion": "happy", "thumbnail": "https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg", "duration": 234},
        {"youtubeId": "450p7goxZqg", "title": "Hello", "artist": "Adele", "genre": "pop", "emotion": "sad", "thumbnail": "https://i.ytimg.com/vi/YQHsXMglC9A/maxresdefault.jpg", "duration": 295},
        {"youtubeId": "OPf0YbXqDm0", "title": "Mark Ronson - Uptown Funk", "artist": "Mark Ronson ft. Bruno Mars", "genre": "pop", "emotion": "excited", "thumbnail": "https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg", "duration": 269},
        {"youtubeId": "RgKAFK5djSk", "title": "See You Again", "artist": "Wiz Khalifa", "genre": "hip hop", "emotion": "sad", "thumbnail": "https://i.ytimg.com/vi/RgKAFK5djSk/maxresdefault.jpg", "duration": 229},
        {"youtubeId": "09R8_2nJtjg", "title": "Sugar", "artist": "Maroon 5", "genre": "pop", "emotion": "happy", "thumbnail": "https://i.ytimg.com/vi/09R8_2nJtjg/maxresdefault.jpg", "duration": 235},
        {"youtubeId": "hT_nvWreIhg", "title": "Counting Stars", "artist": "OneRepublic", "genre": "pop", "emotion": "excited", "thumbnail": "https://i.ytimg.com/vi/hT_nvWreIhg/maxresdefault.jpg", "duration": 257},
        {"youtubeId": "gdZLi9oWNZg", "title": "Stressed Out", "artist": "Twenty One Pilots", "genre": "alternative", "emotion": "calm", "thumbnail": "https://i.ytimg.com/vi/gdZLi9oWNZg/maxresdefault.jpg", "duration": 214},
    ]
    
    # Filter by query
    q = query.lower()
    filtered = [s for s in mock_songs if q in s["title"].lower() or q in s["artist"].lower()]
    return {"results": filtered if filtered else mock_songs}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PYTHON_PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

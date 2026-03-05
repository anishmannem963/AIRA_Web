# services/sentiment_service.py
import re
from typing import Optional

try:
    from afinn import Afinn
    _afinn = Afinn()
except ImportError:
    _afinn = None

try:
    import nltk
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    from nltk.corpus import stopwords
    STOPWORDS = set(stopwords.words('english'))
except Exception:
    STOPWORDS = set()

STRESS_KEYWORDS = {
    "Academic": ["exam", "study", "grade", "assignment", "homework", "deadline", "school", "university", "college"],
    "Work":     ["job", "boss", "work", "office", "meeting", "deadline", "project", "career", "salary"],
    "Relationship": ["relationship", "partner", "boyfriend", "girlfriend", "family", "friend", "lonely", "breakup"],
    "Financial": ["money", "rent", "bills", "debt", "afford", "financial", "salary", "broke", "expensive"],
    "Health":   ["sick", "health", "pain", "anxiety", "depression", "sleep", "tired", "exhausted"],
    "None":     []
}

SUGGESTIONS_MAP = {
    "Academic": [
        "Try the Pomodoro technique: 25 min focus, 5 min break.",
        "Break your tasks into small, manageable steps.",
        "Reward yourself after completing each milestone."
    ],
    "Work": [
        "Set clear boundaries between work time and rest time.",
        "Communicate openly with your team about workload.",
        "Take short walks between tasks to reset your mind."
    ],
    "Relationship": [
        "Practice active listening in your conversations.",
        "Spend quality time doing shared activities.",
        "Write down what you appreciate about the people in your life."
    ],
    "Financial": [
        "Create a simple budget to track your income and expenses.",
        "Look into free community resources that may help.",
        "Focus on what you can control today, not the bigger picture."
    ],
    "Health": [
        "Try a 5-minute guided breathing exercise.",
        "Prioritize sleep — even small improvements help a lot.",
        "Gentle movement like walking can significantly reduce anxiety."
    ],
    "None": [
        "Keep up the great work maintaining your wellbeing!",
        "Continue your positive habits.",
        "Share your positivity — it's contagious!"
    ]
}


def analyze_text_sentiment(texts: list[str]) -> dict:
    """Analyze sentiment from a list of chat messages."""
    if not texts:
        return {"mental_score": 5.0, "stress_type": "None", "suggestions": [], "supporting_texts": []}

    combined = " ".join(texts)

    # Afinn score
    raw_score = 0
    if _afinn:
        raw_score = _afinn.score(combined)

    # Normalize to 0-10
    mental_score = max(0.0, min(10.0, 5.0 + raw_score * 0.3))

    # Detect stress type
    combined_lower = combined.lower()
    stress_type = "None"
    max_hits = 0
    for stype, keywords in STRESS_KEYWORDS.items():
        if stype == "None":
            continue
        hits = sum(1 for kw in keywords if kw in combined_lower)
        if hits > max_hits:
            max_hits = hits
            stress_type = stype

    suggestions = SUGGESTIONS_MAP.get(stress_type, SUGGESTIONS_MAP["None"])

    # Extract supporting texts (sentences with strong sentiment words)
    supporting = []
    sentences = re.split(r'[.!?]', combined)
    for s in sentences[:3]:
        s = s.strip()
        if len(s) > 20:
            supporting.append(s)

    return {
        "mental_score": round(mental_score, 2),
        "stress_type": stress_type,
        "suggestions": suggestions[:3],
        "supporting_texts": supporting[:3]
    }

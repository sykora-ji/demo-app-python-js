import re
from collections import Counter

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "not", "no", "nor",
    "so", "yet", "both", "either", "neither", "each", "few", "more", "most",
    "other", "some", "such", "than", "too", "very", "just", "that", "this",
    "these", "those", "it", "its", "i", "me", "my", "we", "our", "you",
    "your", "he", "she", "they", "them", "their", "what", "which", "who",
    "as", "if", "then", "up", "out", "about", "into", "through", "after",
}


def analyze(text: str) -> dict:
    if not text or not text.strip():
        return {
            "word_count": 0,
            "sentence_count": 0,
            "char_count": 0,
            "char_no_spaces": 0,
            "avg_word_length": 0.0,
            "top_words": [],
            "reading_time_sec": 0,
            "lexical_diversity": 0.0,
        }

    char_count = len(text)
    char_no_spaces = len(text.replace(" ", "").replace("\n", "").replace("\t", ""))

    sentences = re.split(r"[.!?]+", text)
    sentence_count = len([s for s in sentences if s.strip()])

    words_raw = re.findall(r"\b[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+\b", text)
    word_count = len(words_raw)

    if word_count > 0:
        avg_word_length = round(sum(len(w) for w in words_raw) / word_count, 2)
    else:
        avg_word_length = 0.0

    words_lower = [w.lower() for w in words_raw]
    filtered = [w for w in words_lower if w not in STOP_WORDS and len(w) > 1]
    top_words = Counter(filtered).most_common(5)

    reading_time_sec = round((word_count / 180) * 60)

    unique_words = len(set(words_lower))
    lexical_diversity = round(unique_words / word_count, 2) if word_count > 0 else 0.0

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "char_count": char_count,
        "char_no_spaces": char_no_spaces,
        "avg_word_length": avg_word_length,
        "top_words": top_words,
        "reading_time_sec": reading_time_sec,
        "lexical_diversity": lexical_diversity,
    }

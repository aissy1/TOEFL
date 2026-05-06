# preprocessor.py
import re
import nltk
from nltk.stem import WordNetLemmatizer

lemmatizer = WordNetLemmatizer()


def preprocess(text: str) -> str:
    """
    Preprocessing pipeline:
    1. Lowercasing
    2. Tokenization
    3. Lemmatization

    NOTE: Stopword removal TIDAK dilakukan karena
    kata seperti 'is', 'the', 'because' tetap
    memiliki peran semantik pada short answer essay
    """

    if not text or not text.strip():
        return ""

    # Step 1 — Lowercasing
    text = text.lower()

    # Step 2 — Tokenization Hanya pertahankan huruf dan spasi → hilangkan tanda baca
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = text.strip().split()

    # Step 3 — Lemmatization
    tokens = [lemmatizer.lemmatize(token) for token in tokens]

    return " ".join(tokens)


def count_words(text: str) -> int:
    """Hitung jumlah kata dari teks asli"""
    if not text or not text.strip():
        return 0
    return len(text.strip().split())

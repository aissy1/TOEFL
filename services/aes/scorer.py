# scorer.py
import os
import requests
import time
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from preprocessor import preprocess, count_words

# ── Load Model saat startup ──────────────────────────────────
# Hanya diload sekali, bukan setiap request

MODEL_NAME = os.getenv('SBERT_MODEL', 'all-MiniLM-L6-v2')

print(f"[AES] Loading SBERT model: {MODEL_NAME}")
sbert_model = SentenceTransformer(MODEL_NAME)
print(f"[AES] SBERT model loaded!")
print(f"[AES] Grammar: LanguageTool Public API (via requests)")


# ════════════════════════════════════════════════════════════
# GRAMMAR CHECK — LanguageTool Public API via requests
# ════════════════════════════════════════════════════════════

LANGUAGETOOL_API = "https://api.languagetool.org/v2/check"


def check_grammar_api(text: str, retries: int = 3) -> list:
    """
    Memanggil LanguageTool Public API langsung via requests
    dengan retry logic untuk handle rate limit
    """
    for attempt in range(retries):
        try:
            response = requests.post(
                LANGUAGETOOL_API,
                data={
                    'text': text,
                    'language': 'en-US',
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
                timeout=15
            )

            # Rate limit → tunggu lalu retry
            if response.status_code == 429:
                wait_time = (attempt + 1) * 5  # 5s, 10s, 15s
                print(f"[Grammar] Rate limit hit, "
                      f"waiting {wait_time}s... "
                      f"(attempt {attempt + 1}/{retries})")
                time.sleep(wait_time)
                continue

            if response.status_code == 200:
                return response.json().get('matches', [])

            print(f"[Grammar] API error: {response.status_code}")
            return []

        except requests.exceptions.Timeout:
            print(f"[Grammar] Timeout (attempt {attempt + 1}/{retries})")
            time.sleep(3)
            continue

        except requests.exceptions.ConnectionError:
            print(f"[Grammar] Connection error "
                  f"(attempt {attempt + 1}/{retries})")
            time.sleep(3)
            continue

        except Exception as e:
            print(f"[Grammar] Unexpected error: {e}")
            return []

    # Semua retry gagal → return empty (tidak crash sistem)
    print("[Grammar] All retries failed, skipping grammar check")
    return []


# ════════════════════════════════════════════════════════════
# CONTENT SCORING — Semantic Similarity
# ════════════════════════════════════════════════════════════

def get_content_scale(cosine: float) -> tuple:
    """
    Pemetaan cosine similarity ke skala rubrik 0-4
    Berdasarkan Tabel Rubrik Penilaian Essay (Bab 2)
    """
    if cosine >= 0.80:
        return 4, "Sangat Relevan"
    elif cosine >= 0.60:
        return 3, "Relevan"
    elif cosine >= 0.40:
        return 2, "Cukup Relevan"
    elif cosine >= 0.20:
        return 1, "Kurang Relevan"
    else:
        return 0, "Tidak Relevan"


def calculate_content_score(
    student_answer: str,
    reference_answer: str
) -> dict:
    """
    Menghitung content relevance score menggunakan
    SBERT + Cosine Similarity

    Preprocessing diterapkan pada kedua teks sebelum
    di-encode oleh SBERT
    """

    # Preprocessing kedua teks
    processed_student = preprocess(student_answer)
    processed_reference = preprocess(reference_answer)

    # Encode ke vektor menggunakan SBERT
    emb_student = sbert_model.encode([processed_student])
    emb_reference = sbert_model.encode([processed_reference])

    # Hitung cosine similarity
    cosine = float(
        cosine_similarity(emb_student, emb_reference)[0][0]
    )

    # Pemetaan ke skala rubrik
    scale, category = get_content_scale(cosine)

    return {
        "cosine_similarity": round(cosine, 4),
        "scale": scale,
        "category": category,
        "processed_student": processed_student,
        "processed_reference": processed_reference,
    }


# ════════════════════════════════════════════════════════════
# GRAMMAR SCORING — Error Ratio
# ════════════════════════════════════════════════════════════

def get_grammar_scale(error_ratio: float) -> tuple:
    """
    Pemetaan error ratio ke skala rubrik 0-4
    Berdasarkan Tabel Rubrik Penilaian Essay (Bab 2)

    Error ratio = jumlah error / jumlah kata
    Lebih proporsional dari error count karena
    mempertimbangkan panjang jawaban
    (Crossley, 2020)
    """
    if error_ratio == 0:
        return 4, "Sangat Baik"
    elif error_ratio <= 0.10:
        return 3, "Baik"
    elif error_ratio <= 0.20:
        return 2, "Cukup"
    elif error_ratio <= 0.30:
        return 1, "Kurang"
    else:
        return 0, "Sangat Kurang"


def calculate_grammar_score(student_answer: str) -> dict:
    """
    Menghitung grammatical accuracy score menggunakan
    LanguageTool Public API dengan pendekatan error ratio

    PENTING: Grammar check menggunakan teks ASLI
    tanpa preprocessing karena LanguageTool butuh
    teks original untuk deteksi kapitalisasi,
    artikel, dan kesalahan kontekstual lainnya
    """

    word_count = count_words(student_answer)

    if word_count == 0:
        return {
            "error_count": 0,
            "word_count": 0,
            "error_ratio": 0.0,
            "error_pct": "0%",
            "scale": 0,
            "category": "Tidak ada jawaban",
            "errors": [],
        }

    # Grammar check pada teks ASLI via Public API
    matches = check_grammar_api(student_answer)
    error_count = len(matches)
    error_ratio = error_count / word_count

    scale, category = get_grammar_scale(error_ratio)

    # Detail error untuk keperluan feedback admin
    errors = []
    for m in matches[:5]:  # Maksimal 5 error ditampilkan
        errors.append({
            "message": m.get('message', ''),
            "context": m.get('context', {}).get('text', ''),
            "suggestion": [
                r.get('value', '')
                for r in m.get('replacements', [])[:2]
            ],
        })

    return {
        "error_count": error_count,
        "word_count": word_count,
        "error_ratio": round(error_ratio, 4),
        "error_pct": f"{round(error_ratio * 100, 1)}%",
        "scale": scale,
        "category": category,
        "errors": errors,
    }


# ════════════════════════════════════════════════════════════
# FINAL SCORING
# ════════════════════════════════════════════════════════════

def calculate_soal_score(
    content_scale: int,
    grammar_scale: int
) -> float:
    """
    Skor per soal berdasarkan rubrik:
    Skor = (Content Scale + Grammar Scale) / 8 × 100

    Maksimum: (4 + 4) / 8 × 100 = 100
    Minimum:  (0 + 0) / 8 × 100 = 0
    """
    total = content_scale + grammar_scale
    score = (total / 8) * 100
    return round(score, 1)


def get_kategori(total_score: float) -> str:
    """
    Kategorisasi Total Essay Score
    Berdasarkan Tabel Kategorisasi Skor Essay (Bab 2)
    Diadaptasi dari Can Do Statements CEFR
    """
    if total_score >= 76:
        return "Sangat Baik"
    elif total_score >= 51:
        return "Baik"
    elif total_score >= 26:
        return "Cukup"
    else:
        return "Kurang"


# ════════════════════════════════════════════════════════════
# MAIN SCORING FUNCTION
# ════════════════════════════════════════════════════════════

def score_essay(
    student_answer: str,
    reference_answer: str,
    min_words: int = 20
) -> dict:
    """
    Fungsi utama penilaian essay
    Dipanggil oleh Flask endpoint /score-single

    Flow:
    1. Validasi word count (min words)
    2. Content scoring (preprocessing + SBERT + cosine)
    3. Delay 2 detik untuk hindari rate limit
    4. Grammar scoring (teks asli + LanguageTool API + error ratio)
    5. Hitung soal score
    6. Return hasil lengkap
    """

    # Validasi word count
    word_count = count_words(student_answer)
    if word_count < min_words:
        return {
            "status": "rejected",
            "message": (
                f"Jawaban terlalu pendek ({word_count} kata). "
                f"Minimum {min_words} kata."
            ),
            "word_count": word_count,
        }

    # Content scoring
    content = calculate_content_score(student_answer, reference_answer)

    # Delay sebelum grammar check untuk hindari rate limit
    time.sleep(2)

    # Grammar scoring
    grammar = calculate_grammar_score(student_answer)

    # Soal score
    soal_score = calculate_soal_score(
        content["scale"],
        grammar["scale"]
    )

    return {
        "status": "success",
        "word_count": word_count,
        "content": {
            "cosine_similarity": content["cosine_similarity"],
            "scale": content["scale"],
            "category": content["category"],
        },
        "grammar": {
            "error_count": grammar["error_count"],
            "word_count": grammar["word_count"],
            "error_ratio": grammar["error_ratio"],
            "error_pct": grammar["error_pct"],
            "scale": grammar["scale"],
            "category": grammar["category"],
            "errors": grammar["errors"],
        },
        "soal_score": soal_score,
    }

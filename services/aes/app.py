# app.py
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from scorer import score_essay

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)
MIN_WORDS = int(os.getenv('MIN_WORDS', 10))


# ── Health Check ─────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "AES System is running!",
        "version": "1.0.0",
    })


# ── Score Single Soal ─────────────────────────────────────────
@app.route('/score-single', methods=['POST'])
def score_single():
    """
    Endpoint yang dipanggil oleh Laravel Job
    untuk menilai satu jawaban essay

    Request body:
    {
        "student_answer":   "jawaban siswa",
        "reference_answer": "isi kolom keywords dari tabel questions"
    }

    Response:
    {
        "status":      "success" | "rejected",
        "word_count":  16,
        "content": {
            "cosine_similarity": 0.8234,
            "scale":             4,
            "category":          "Sangat Relevan"
        },
        "grammar": {
            "error_count":  1,
            "word_count":   16,
            "error_ratio":  0.0625,
            "error_pct":    "6.2%",
            "scale":        3,
            "category":     "Baik",
            "errors": [...]
        },
        "soal_score": 87.5
    }
    """
    data = request.get_json()

    # Validasi input
    if not data:
        return jsonify({
            "error": "Request body tidak valid"
        }), 400

    student_answer = data.get('student_answer', '').strip()
    reference_answer = data.get('reference_answer', '').strip()

    if not student_answer:
        return jsonify({
            "error": "student_answer wajib diisi"
        }), 400

    if not reference_answer:
        return jsonify({
            "error": "reference_answer (keywords) wajib diisi"
        }), 400

    # Jalankan penilaian
    result = score_essay(
        student_answer=student_answer,
        reference_answer=reference_answer,
        min_words=MIN_WORDS,
    )

    return jsonify(result)


# ── Test Endpoint ─────────────────────────────────────────────
@app.route('/test', methods=['POST'])
def test_scoring():
    """
    Endpoint untuk testing manual via Postman
    Sama seperti score-single tapi dengan
    output yang lebih verbose
    """
    data = request.get_json()

    student_answer = data.get('student_answer', '')
    reference_answer = data.get('reference_answer', '')

    result = score_essay(
        student_answer=student_answer,
        reference_answer=reference_answer,
        min_words=MIN_WORDS,
    )

    # Tambahkan summary untuk kemudahan testing
    if result['status'] == 'success':
        result['summary'] = {
            "content_scale": f"{result['content']['scale']}/4",
            "grammar_scale": f"{result['grammar']['scale']}/4",
            "total_scale": (
                f"{result['content']['scale'] + result['grammar']['scale']}/8"
            ),
            "soal_score": f"{result['soal_score']}/100",
        }

    return jsonify(result)


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    print(f"\n[AES] Server running on http://127.0.0.1:{port}")
    print(f"[AES] Debug mode: {debug}\n")
    app.run(host='0.0.0.0', port=port, debug=debug)

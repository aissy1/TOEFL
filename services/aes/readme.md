# Services

Folder ini berisi microservice Python yang digunakan
oleh aplikasi TEP berbasis web.

## AES (Automated Essay Scoring)

Lokasi: services/aes/
Fungsi: Menilai jawaban essay siswa menggunakan
SBERT + Cosine Similarity (content)
dan LanguageTool + Error Ratio (grammar)

### Cara Menjalankan:

cd services/aes
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

Port default: 5000

# Scripts

Folder ini berisi script utilitas yang dijalankan
secara manual atau on-demand.

## generate_tts.py

Fungsi: Generate audio Text-to-Speech untuk
soal listening pada subtes Listening TEP

### Cara Menjalankan:

cd scripts
pip install -r requirements_tts.txt
python generate_tts.py

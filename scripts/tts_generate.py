import sys
import json
import random
import numpy as np
import soundfile as sf
from tkinter import dialog
from tkinter import dialog
from kokoro_onnx import Kokoro

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)


def clean_text(text: str) -> str:
    return text.replace("\\'", "'").strip()


def normalize_gender(gender: str) -> str:
    if not gender:
        return "male"

    gender = gender.lower().strip()

    if gender in ["male", "m", "man", "boy"]:
        return "male"
    elif gender in ["female", "f", "woman", "girl"]:
        return "female"

    return "male"


def build_voice_pool():
    return {
        "male": ['am_adam', 'am_fenrir', 'am_michael', "am_puck"],
        "female": ['af_heart', 'af_bella', 'af_aoede', 'af_sarah']
    }


def assign_actor_voices(actors, voice_pool):
    """
    Assign voice sekali di awal → konsisten per actor
    """
    actor_voice_map = {}

    # male_idx = 0
    # female_idx = 0

    for actor in actors:
        actor_id = actor.get("id")
        gender = normalize_gender(actor.get("gender"))

        voices = voice_pool.get(gender, voice_pool["male"])

        # pilih random voice sesuai gender
        voice = random.choice(voices)

        actor_voice_map[actor_id] = voice

    return actor_voice_map


def generate(passage: dict, output_path: str):
    model_path = os.path.join(PROJECT_ROOT, "kokoro-v1.0.onnx")
    voices_path = os.path.join(PROJECT_ROOT, "voices-v1.0.bin")

    kokoro = Kokoro(model_path, voices_path)

    actors = passage.get('actors', [])
    dialog = passage.get('dialog', [])

    if not actors or not dialog:
        raise ValueError("Actors atau dialog tidak boleh kosong")

    voice_pool = build_voice_pool()

    # ✅ assign voice sekali
    actor_voice_map = assign_actor_voices(actors, voice_pool)

    # cache actor biar O(1)
    actor_map = {a["id"]: a for a in actors}

    all_audio = []
    sample_rate = 24000

    for line in dialog:
        actor_id = line.get("actor_id")
        actor = actor_map.get(actor_id)

        if not actor:
            # skip kalau actor tidak ditemukan
            continue

        voice = actor_voice_map.get(actor_id, 'am_adam')
        text = clean_text(line.get('text', ''))

        if not text:
            continue

        # generate audio per line & set volume default
        samples, sr = kokoro.create(
            text,
            voice=voice,
            speed=1.0,
            lang="en-us"
        )

        all_audio.append(samples)

        # jeda antar dialog (400ms)
        silence = np.zeros(int(sr * 0.4))
        all_audio.append(silence)

    if not all_audio:
        raise ValueError("Tidak ada audio yang dihasilkan")

    combined = np.concatenate(all_audio)
    sf.write(output_path, combined, sample_rate)


if __name__ == '__main__':
    try:
        arg = sys.argv[1]

        # support file JSON atau string JSON
        if arg.endswith('.json'):
            with open(arg, 'r') as f:
                passage_json = json.load(f)
        else:
            passage_json = json.loads(arg)

        output_path = sys.argv[2]

        generate(passage_json, output_path)

        print(json.dumps({
            'success': True,
            'path': output_path
        }))

    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

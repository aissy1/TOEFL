<?php

namespace App\Jobs;

use App\Models\Passage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GeneratePassageAudioJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;
    public int $tries = 3;

    public function __construct(public Passage $passage)
    {
    }

    public function handle(): void
    {
        Log::info('TTS Job Started', [
            'passage_id' => $this->passage->id
        ]);

        $data = json_decode($this->passage->text, true);
        // $data = $this->passage->text;

        Log::info('TTS Data Type', ['type' => $data['type'] ?? 'null']); // ← cek type

        if (($data['type'] ?? '') !== 'listening')
            return;

        $filename = 'audio/passage_' . $this->passage->id . '.wav';
        $outputPath = storage_path('app/public/' . $filename);

        // Pastikan folder ada
        if (!file_exists(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        $pythonPath = base_path('venv/Scripts/python.exe'); // Windows
        // $pythonPath = 'python3'; // Linux/Mac

        $scriptPath = base_path('scripts/tts_generate.py');
        $jsonFile = storage_path('app/temp_passage_' . $this->passage->id . '.json');

        // Tulis JSON ke file sementara — hindari masalah escaping
        file_put_contents($jsonFile, json_encode($data));

        $command = escapeshellcmd("{$pythonPath} {$scriptPath} {$jsonFile} {$outputPath}");
        $result = shell_exec($command . ' 2>&1');

        // Hapus file temp
        @unlink($jsonFile);

        Log::info('TTS Generate Result', ['result' => $result]);

        $decoded = json_decode($result, true);
        Log::info('DECODED RESULT', [
            'decoded' => $decoded
        ]);

        if ($decoded['success'] ?? false) {
            $this->passage->update([
                'audio_url' => Storage::url($filename),
            ]);
            Log::info('TTS audio saved', ['passage_id' => $this->passage->id]);
        } else {
            throw new \Exception('TTS generation failed: ' . $result);
        }
    }
}

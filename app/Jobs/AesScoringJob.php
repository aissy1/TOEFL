<?php

namespace App\Jobs;

use App\Models\EssayAnswer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AesScoringJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public readonly int $essayAnswerId
    ) {
    }

    public function handle(): void
    {
        $answer = EssayAnswer::with('questions')
            ->findOrFail($this->essayAnswerId);

        if (!$answer->questions) {
            Log::warning("AES: Question not found for answer {$answer->question_id}");
            $answer->update([
                'aes_status' => 'failed',
                'aes_error_message' => 'Question tidak ditemukan',
            ]);
            return;
        }

        // Ambil reference answer dari kolom keywords
        $referenceAnswer = $answer->questions->keywords;
        $wordCount = $answer->questions->word_count;

        if (empty($referenceAnswer)) {
            Log::warning("AES: No reference answer (keywords) " .
                "for question {$answer->question_id}");
            $answer->update([
                'aes_status' => 'failed',
                'aes_error_message' => 'Reference answer (keywords) kosong',
            ]);
            return;
        }

        // Update status ke processing
        $answer->update(['aes_status' => 'processing']);

        try {
            // Panggil Flask API
            $response = Http::timeout(60)
                ->post(config('services.flask.url') . '/score-single', [
                    'student_answer' => $answer->answer_text,
                    'reference_answer' => $referenceAnswer,
                    'word_count' => $wordCount,
                ]);

            if (!$response->successful()) {
                throw new \Exception(
                    "Flask API error: HTTP " . $response->status()
                );
            }

            $result = $response->json();

            // Jika jawaban ditolak (terlalu pendek)
            if ($result['status'] === 'rejected') {
                $answer->update([
                    'aes_status' => 'failed',
                    'aes_error_message' => $result['message'],
                    'word_count' => $result['word_count'] ?? 0,
                ]);
                Log::info("AES: Answer {$answer->id} rejected — " .
                    $result['message']);
                return;
            }

            // Simpan hasil scoring
            $answer->update([
                // Content
                'content_cosine' => $result['content']['cosine_similarity'],
                'content_scale' => $result['content']['scale'],
                'content_category' => $result['content']['category'],

                // Grammar
                'grammar_score' => $result['grammar']['scale'],
                'grammar_error_count' => $result['grammar']['error_count'],
                'grammar_error_ratio' => $result['grammar']['error_ratio'],
                'grammar_category' => $result['grammar']['category'],
                'word_count' => $result['grammar']['word_count'],

                // Soal score (0-100)
                'similarity_score' => $result['soal_score'],

                // Status
                'aes_status' => 'completed',
                'scored_at' => now(),
            ]);

            Cache::put(
                "Scoring Status {$this->essayAnswerId}",
                ['status' => 'completed'],
                now()->addMinutes(5)
            );

            Log::info("AES: Answer {$answer->id} scored — " .
                "soal_score: {$result['soal_score']}");

            // Hitung total essay score jika semua soal sudah dinilai
            $this->calculateTotalEssayScore($answer->test_attempt_id);

        } catch (\Exception $e) {
            $answer->update([
                'aes_status' => 'failed',
                'aes_error_message' => $e->getMessage(),
            ]);
            Log::error("AES: Failed to score answer {$answer->id} — " .
                $e->getMessage());
            throw $e;
        }
    }

    private function calculateTotalEssayScore(int $testAttemptId): void
    {
        // Cek apakah semua jawaban essay sudah selesai dinilai
        $allAnswers = EssayAnswer::where('test_attempt_id', $testAttemptId)
            ->get();

        $completedAnswers = $allAnswers->where('aes_status', 'completed');

        // Hanya hitung jika semua soal sudah completed
        if ($allAnswers->count() !== $completedAnswers->count()) {
            Log::info("AES: Attempt {$testAttemptId} — waiting for " .
                "other answers to complete");
            return;
        }

        // Hitung rata-rata soal score
        $totalScore = round(
            $completedAnswers->avg('similarity_score'),
            1
        );

        $kategori = match (true) {
            $totalScore >= 76 => 'Sangat Baik',
            $totalScore >= 51 => 'Baik',
            $totalScore >= 26 => 'Cukup',
            default => 'Kurang',
        };

        // Update final_score dan kategori di semua jawaban attempt ini
        EssayAnswer::where('test_attempt_id', $testAttemptId)
            ->update([
                'final_score' => $totalScore,
                'kategori' => $kategori,
            ]);

        Log::info("AES: Attempt {$testAttemptId} — " .
            "final_score: {$totalScore} ({$kategori})");
    }

    public function failed(\Throwable $exception): void
    {
        EssayAnswer::where('id', $this->essayAnswerId)
            ->where('aes_status', 'processing')
            ->update([
                'aes_status' => 'failed',
                'aes_error_message' => $exception->getMessage(),
            ]);

        Log::error("AES Job permanently failed for answer " .
            "{$this->essayAnswerId}: " . $exception->getMessage());
    }
}
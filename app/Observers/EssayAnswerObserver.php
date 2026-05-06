<?php

namespace App\Observers;

use App\Jobs\AesScoringJob;
use App\Models\EssayAnswer;
use Illuminate\Support\Facades\Log;

class EssayAnswerObserver
{
    public function created(EssayAnswer $essayAnswer): void
    {
        Log::info("AES Observer: New essay answer {$essayAnswer->id} " .
            "created for attempt {$essayAnswer->test_attempt_id}");

        // Dispatch job langsung per jawaban
        // Tidak perlu tunggu soal lain karena
        // calculateTotalEssayScore akan cek apakah semua sudah selesai
        AesScoringJob::dispatch($essayAnswer->id)
            ->delay(now()->addSeconds(1));

        Log::info("AES Job dispatched for answer {$essayAnswer->id}");
    }
}
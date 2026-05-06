<?php

namespace App\Observers;

use App\Jobs\GeneratePassageAudioJob;
use App\Models\Passage;
use Illuminate\Support\Facades\Log;

class PassageObserver
{
    public function created(Passage $passage): void
    {
        $this->dispatchIfListening($passage);
    }

    public function updated(Passage $passage): void
    {
        // Re-generate jika text berubah
        if ($passage->isDirty('text')) {
            $this->dispatchIfListening($passage);
        }
    }

    private function dispatchIfListening(Passage $passage): void
    {
        // $data = json_decode($passage->text, true);
        $data = $passage->text;

        if (is_string($data)) {
            $data = json_decode($data, true);
        }

        if (!is_array($data)) {
            Log::error('Invalid passage text format', [
                'passage_id' => $passage->id
            ]);
            return;
        }

        if (!is_array($data)) {
            Log::error('Invalid passage text format', [
                'passage_id' => $passage->id,
                'raw' => $passage->text
            ]);
            return;
        }

        if (($data['type'] ?? '') === 'listening') {
            Log::info('Dispatching TTS Job', [
                'passage_id' => $passage->id
            ]);

            GeneratePassageAudioJob::dispatch($passage);
        }
    }
}
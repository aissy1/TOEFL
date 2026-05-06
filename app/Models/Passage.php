<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Passage extends Model
{
    protected $fillable = ['subtest_id', 'title', 'text', 'audio_url'];

    protected $casts = [
        'text' => 'array',
    ];

    public function subtest()
    {
        return $this->belongsTo(Subtest::class);
    }

    /* ================= HELPERS ================= */

    public function isListening(): bool
    {
        return isset($this->text['type']) &&
            $this->text['type'] === 'listening';
    }

    public function getActors()
    {
        return $this->text['actors'] ?? [];
    }

    public function getDialog()
    {
        return $this->text['dialog'] ?? [];
    }
}

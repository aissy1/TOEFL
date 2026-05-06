<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EssayAnswer extends Model
{
    use HasFactory;
    protected $fillable = [
        'test_attempt_id',
        'question_id',
        'answer_text',
        'word_count',
        'content_cosine',
        'content_scale',
        'content_category',
        'grammar_score',
        'grammar_error_count',
        'grammar_error_ratio',
        'grammar_category',
        'similarity_score',
        'final_score',
        'manual_score',
        'aes_status',
        'kategori',
        'scored_at',
        'aes_error_message',
    ];

    protected $casts = [
        'manual_score' => 'array',
    ];

    public function questions()
    {
        return $this->belongsTo(questions::class, 'question_id');
    }
    public function testAttempts()
    {
        return $this->belongsTo(TestAttempt::class);
    }
}


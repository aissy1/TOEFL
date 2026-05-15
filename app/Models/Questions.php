<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class questions extends Model
{
    use HasFactory;

    protected $fillable = [
        'passage_id',
        'toefl_subtest_id',
        'subtest_id',
        'question',
        'question_audio_url',
        'question_type',
        'choices',
        'correct_answer',
        'point',
        'keywords',
        'min_words',
        'order',
    ];

    protected $casts = [
        'choices' => 'array',
        'keywords' => 'array',
    ];

    /**
     * Relasi ke Subtest
     */
    public function subtest()
    {
        return $this->belongsTo(Subtest::class);
    }
    public function toeflSubtest()
    {
        return $this->belongsTo(ToeflSubtest::class);
    }

    public function passage()
    {
        return $this->belongsTo(Passage::class);
    }



    /**
     * Relasi ke essay answers (writing)
     */
    public function essayAnswers()
    {
        return $this->hasMany(EssayAnswer::class);
    }
}

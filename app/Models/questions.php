<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class questions extends Model
{
    use HasFactory;

    protected $fillable = [
        'subtest_id',
        'question',
        'question_type',
        'choices',
        'correct_answer',
        'point',
        'keywords',
        'min_words',
        'max_score',
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

    /**
     * Relasi ke essay answers (writing)
     */
    // public function essayAnswers()
    // {
    //     return $this->hasMany(EssayAnswer::class);
    // }
}

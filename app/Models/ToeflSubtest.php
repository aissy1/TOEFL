<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ToeflSubtest extends Model
{
    use HasFactory;

    protected $table = 'toefl_subtests';

    protected $fillable = [
        'toefl_id',
        'subtest_id',
        'order',
        'duration_minutes',
        'passing_score',
        'total_questions',
    ];

    /**
     * Relasi ke TOEFL
     */
    public function toefl()
    {
        return $this->belongsTo(Toefl::class);
    }

    /**
     * Relasi ke Subtest
     */
    public function subtest()
    {
        return $this->belongsTo(Subtest::class);
    }

}

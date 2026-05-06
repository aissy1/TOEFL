<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestScore extends Model
{
    use HasFactory;
    protected $fillable = [
        'test_attempt_id',
        'subtest_id',
        'raw_score',
    ];
    public function subtest()
    {
        return $this->belongsTo(ToeflSubtest::class);
    }

    public function attempt()
    {
        return $this->belongsTo(TestAttempt::class, 'test_attempt_id');
    }
}
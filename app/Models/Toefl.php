<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Toefl extends Model
{
    protected $fillable = [
        'name',
        'code',
        'status'
    ];

    public function toeflSubtests()
    {
        return $this->hasMany(ToeflSubtest::class);
    }

    public function subtests()
    {
        return $this->belongsToMany(Subtest::class, 'toefl_subtests', 'toefl_id', 'subtest_id')->withPivot(['order', 'duration_minutes', 'total_questions', 'passing_score'])->orderBy('toefl_subtests.order');

    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subtest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'order',
        'instructions',
    ];

    protected $casts = [
        'instructions' => 'array',
    ];

    /**
     * Relasi ke konfigurasi TOEFL-SUBTEST
     * Satu subtest bisa dipakai oleh banyak TOEFL
     */
    public function toeflSubtests()
    {
        return $this->hasMany(ToeflSubtest::class);
    }

    /**
     * Relasi ke question
     * Question WAJIB milik satu subtest
     */
    public function questions()
    {
        return $this->hasMany(Questions::class);
    }
}

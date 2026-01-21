<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('toefl_subtests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toefl_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subtest_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedSmallInteger('total_questions');
            $table->unsignedSmallInteger('passing_score')->nullable();
            $table->timestamps();


            $table->unique(['toefl_id', 'subtest_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toefl_subtests');
    }
};

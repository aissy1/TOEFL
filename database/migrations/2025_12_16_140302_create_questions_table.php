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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subtest_id')
                ->constrained('subtests')
                ->cascadeOnDelete();

            $table->enum('question_type', ['mcq', 'essay']);
            $table->text('question');

            // MCQ
            $table->json('choices')->nullable();
            $table->string('correct_answer')->nullable();

            // Essay
            $table->json('keywords')->nullable();
            $table->unsignedInteger('min_words')->nullable();
            $table->unsignedInteger('max_score')->default(100);

            $table->unsignedInteger('point')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};

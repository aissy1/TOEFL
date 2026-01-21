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
        Schema::create('essay_answers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('test_attempt_id')
                ->constrained('test_attempts')
                ->cascadeOnDelete();

            $table->foreignId('question_id')
                ->constrained('questions')
                ->cascadeOnDelete();

            $table->longText('answer_text');

            // Untuk tahap selanjutnya (NLP / similarity)
            $table->float('similarity_score')->nullable();
            $table->unsignedInteger('word_count')->nullable();
            $table->unsignedInteger('final_score')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('essay_answers');
    }
};

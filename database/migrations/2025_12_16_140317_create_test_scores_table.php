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
        Schema::create('test_scores', function (Blueprint $table) {
            $table->id();

            $table->foreignId('test_attempt_id')
                ->constrained('test_attempts')
                ->cascadeOnDelete();

            $table->foreignId('subtest_id')
                ->constrained('subtests')
                ->cascadeOnDelete();

            $table->unsignedInteger('raw_score');
            $table->unsignedInteger('scaled_score')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_scores');
    }
};

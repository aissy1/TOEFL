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
        Schema::table('essay_answers', function (Blueprint $table) {
            // Content detail
            $table->decimal('content_cosine', 6, 4)
                ->nullable()->after('answer_text');
            $table->integer('content_scale')
                ->nullable()->after('content_cosine');
            $table->string('content_category')
                ->nullable()->after('content_scale');

            // Grammar detail
            $table->integer('grammar_error_count')
                ->nullable()->after('grammar_score');
            $table->decimal('grammar_error_ratio', 6, 4)
                ->nullable()->after('grammar_error_count');
            $table->string('grammar_category')
                ->nullable()->after('grammar_error_ratio');

            // Status AES
            $table->enum('aes_status', [
                'pending',
                'processing',
                'completed',
                'failed'
            ])->default('pending')->after('final_score');

            $table->string('kategori')
                ->nullable()->after('aes_status');
            $table->timestamp('scored_at')
                ->nullable()->after('kategori');
            $table->text('aes_error_message')
                ->nullable()->after('scored_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('essay_answers', function (Blueprint $table) {
            //
        });
    }
};

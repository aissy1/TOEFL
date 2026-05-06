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
            $table->integer('grammar_score')->nullable()->after('similarity_score');
            $table->integer('manual_score')->nullable()->after('final_score');
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

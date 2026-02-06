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
        Schema::create('passages', function (Blueprint $table) {
            $table->id(); // id passage

            $table->foreignId('subtest_id')
                ->constrained('subtests')
                ->cascadeOnDelete();

            $table->string('title')->nullable();
            $table->longText('text'); // isi passage / bacaan

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passage');
    }
};

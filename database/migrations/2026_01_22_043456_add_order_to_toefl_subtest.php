<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('toefl_subtests', function (Blueprint $table) {
            // nullable dulu agar aman untuk data existing
            $table->unsignedInteger('order')->nullable()->after('subtest_id');
        });

        /**
         * ===============================
         * BACKFILL ORDER DATA (AMAN)
         * ===============================
         */
        DB::table('toefl_subtests')
            ->select('toefl_id')
            ->distinct()
            ->get()
            ->each(function ($row) {
                $subtests = DB::table('toefl_subtests')
                    ->where('toefl_id', $row->toefl_id)
                    ->orderBy('subtest_id')
                    ->get();

                foreach ($subtests as $index => $subtest) {
                    DB::table('toefl_subtests')
                        ->where('id', $subtest->id)
                        ->update([
                            'order' => $index + 1,
                        ]);
                }
            });

        /**
         * ===============================
         * FINALIZE CONSTRAINT
         * ===============================
         */
        Schema::table('toefl_subtests', function (Blueprint $table) {
            $table->unsignedInteger('order')->nullable(false)->change();
            $table->unique(['toefl_id', 'order'], 'toefl_subtests_unique_order');
        });
    }

    public function down(): void
    {
        Schema::table('toefl_subtests', function (Blueprint $table) {
            $table->dropUnique('toefl_subtests_unique_order');
            $table->dropColumn('order');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->deleteDuplicateRows('test_scores', ['test_attempt_id', 'subtest_id']);
        $this->deleteDuplicateRows('essay_answers', ['test_attempt_id', 'question_id']);

        Schema::table('test_scores', function (Blueprint $table) {
            $table->unique(['test_attempt_id', 'subtest_id'], 'test_scores_attempt_subtest_unique');
        });

        Schema::table('essay_answers', function (Blueprint $table) {
            $table->unique(['test_attempt_id', 'question_id'], 'essay_answers_attempt_question_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('test_scores', function (Blueprint $table) {
            $table->dropUnique('test_scores_attempt_subtest_unique');
        });

        Schema::table('essay_answers', function (Blueprint $table) {
            $table->dropUnique('essay_answers_attempt_question_unique');
        });
    }

    private function deleteDuplicateRows(string $table, array $groupColumns): void
    {
        $seen = [];
        $duplicateIds = [];

        DB::table($table)
            ->select(array_merge(['id'], $groupColumns))
            ->orderByDesc('id')
            ->chunk(500, function ($rows) use ($groupColumns, &$seen, &$duplicateIds) {
                foreach ($rows as $row) {
                    $key = collect($groupColumns)
                        ->map(fn(string $column) => $row->{$column})
                        ->implode(':');

                    if (isset($seen[$key])) {
                        $duplicateIds[] = $row->id;
                        continue;
                    }

                    $seen[$key] = true;
                }
            });

        collect($duplicateIds)
            ->chunk(500)
            ->each(fn($ids) => DB::table($table)->whereIn('id', $ids)->delete());
    }
};

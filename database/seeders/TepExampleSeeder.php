<?php

namespace Database\Seeders;

use App\Models\Questions;
use App\Models\Toefl;
use App\Models\ToeflSubtest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TepExampleSeeder extends Seeder
{
    private const SOURCE_CODES = ['tep', 'tep-pratice'];
    private const TARGET_CODE = 'tep-example';
    private const MULTIPLE_CHOICE_LIMIT = 10;
    private const ESSAY_LIMIT = 5;

    public function run(): void
    {
        DB::transaction(function () {
            $sourceToefl = Toefl::whereIn('code', self::SOURCE_CODES)
                ->orderByRaw("case when code = 'tep' then 0 else 1 end")
                ->first();

            if (!$sourceToefl) {
                $this->call(DashboardPracticeBankSoalSeeder::class);
                $sourceToefl = Toefl::whereIn('code', self::SOURCE_CODES)
                    ->orderByRaw("case when code = 'tep' then 0 else 1 end")
                    ->first();
            }

            if (!$sourceToefl) {
                throw new RuntimeException('Source TOEFL package tep was not found.');
            }

            $targetToefl = Toefl::updateOrCreate(
                ['code' => self::TARGET_CODE],
                [
                    'name' => 'TEP Example',
                    'status' => 'active',
                ],
            );

            $sourceToeflSubtests = ToeflSubtest::with('subtest')
                ->where('toefl_id', $sourceToefl->id)
                ->orderBy('order')
                ->get();

            if ($sourceToeflSubtests->isEmpty()) {
                throw new RuntimeException("Source TOEFL package {$sourceToefl->code} does not have subtests.");
            }

            foreach ($sourceToeflSubtests as $sourceToeflSubtest) {
                $isEssay = $sourceToeflSubtest->subtest->name === 'essay';
                $limit = $isEssay ? self::ESSAY_LIMIT : self::MULTIPLE_CHOICE_LIMIT;

                $sampleQuestions = Questions::where('toefl_subtest_id', $sourceToeflSubtest->id)
                    ->when($isEssay, fn($query) => $query->whereIn('question_type', ['essay', 'written']))
                    ->inRandomOrder()
                    ->limit($limit)
                    ->get();

                if ($sampleQuestions->count() < $limit) {
                    throw new RuntimeException(
                        "Not enough {$sourceToeflSubtest->subtest->name} questions in {$sourceToefl->code}. "
                        . "Needed {$limit}, found {$sampleQuestions->count()}."
                    );
                }

                $passingScore = $isEssay
                    ? $sourceToeflSubtest->passing_score
                    : $sampleQuestions->sum(fn(Questions $question) => $question->point ?? 1);

                $targetToeflSubtest = ToeflSubtest::updateOrCreate(
                    [
                        'toefl_id' => $targetToefl->id,
                        'subtest_id' => $sourceToeflSubtest->subtest_id,
                    ],
                    [
                        'order' => $sourceToeflSubtest->order,
                        'duration_minutes' => $sourceToeflSubtest->duration_minutes,
                        'total_questions' => $limit,
                        'passing_score' => $passingScore,
                    ],
                );

                Questions::where('toefl_subtest_id', $targetToeflSubtest->id)->delete();

                foreach ($sampleQuestions->values() as $index => $question) {
                    Questions::create([
                        'toefl_subtest_id' => $targetToeflSubtest->id,
                        'subtest_id' => $question->subtest_id,
                        'passage_id' => $question->passage_id,
                        'order' => $index + 1,
                        'question_type' => $question->question_type,
                        'question' => $question->question,
                        'question_audio_url' => $question->question_audio_url,
                        'choices' => $question->choices,
                        'correct_answer' => $question->correct_answer,
                        'keywords' => $question->keywords,
                        'min_words' => $question->min_words,
                        'point' => $question->point,
                    ]);
                }
            }

            $this->command->newLine();
            $this->command->info('TEP Example seed created:');
            $this->command->line("  - code: {$targetToefl->code}");
            $this->command->line('  - non-essay: 10 random questions per subtest');
            $this->command->line('  - essay: 5 random questions');
            $this->command->newLine();
        });
    }
}

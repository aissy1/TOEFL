<?php

namespace App\Services;

use App\Models\EssayAnswer;
use App\Models\questions;
use App\Models\ToeflSubtest;
use App\Models\TestScore;

class scoringService
{
    public function scoreChoices(array $answers, int $toeflSubtestId, int $attemptId): int
    {
        $score = 0;

        $questions = questions::where('toefl_subtest_id', $toeflSubtestId)
            ->get()
            ->keyBy('id');

        foreach ($answers as $questionId => $answer) {

            $question = $questions[$questionId] ?? null;

            if (!$question)
                continue;

            $correct = $question->choices[$question->correct_answer] ?? null;

            $point = $question->point ?? 1;

            if ($answer === $correct) {
                $score += $point;
            }
        }

        return $score;
    }
}
<?php

namespace App\Services;
use App\Models\questions;

class questionsSubtests
{
    public function getReadingQuestions(int $toeflSubtestId, int $subtest_id)
    {
        $questions = questions::with('passage')
            ->where('toefl_subtest_id', $toeflSubtestId)
            ->where('subtest_id', $subtest_id)
            ->orderBy('order')
            ->get()
            ->groupBy('passage_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'id' => $first->passage_id,
                    'title' => $first->passage?->title,
                    'passage' => $first->passage?->text,
                    'questions' => $items->map(function ($q) {
                        return [
                            'id' => $q->id,
                            'order' => $q->order,
                            'question' => $q->question,
                            'choices' => array_values($q->choices ?? []),
                        ];
                    })->values(),
                ];
            })->values();
        return $questions;
    }
    public function getListeningQuestions(int $toeflSubtestId, int $subtest_id)
    {
        $questions = questions::with('passage')
            ->where('toefl_subtest_id', $toeflSubtestId)
            ->where('subtest_id', $subtest_id)
            ->orderBy('order')
            ->get()
            ->groupBy('passage_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'id' => $first->passage_id,
                    'title' => $first->passage?->title,
                    'passage' => $first->passage?->text,
                    'audio_url' => $first->passage?->audio_url,
                    'questions' => $items->map(function ($q) {
                        return [
                            'id' => $q->id,
                            'order' => $q->order,
                            'question' => $q->question,
                            'choices' => array_values($q->choices ?? []),
                        ];
                    })->values(),
                ];
            })->values();
        return $questions;
    }

    public function getStructureQuestions(int $toeflSubtestId, int $subtest_id)
    {
        $questions = questions::with('passage')
            ->where('toefl_subtest_id', $toeflSubtestId)
            ->where('subtest_id', $subtest_id)
            ->orderBy('order')
            ->get()
            ->groupBy('passage_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'id' => $first->passage_id,
                    'title' => $first->passage?->title,
                    'passage' => $first->passage?->text,
                    'questions' => $items->map(function ($q) {
                        return [
                            'id' => $q->id,
                            'order' => $q->order,
                            'question' => $q->question,
                            'choices' => array_values($q->choices ?? []),
                        ];
                    })->values(),
                ];
            })->values();
        return $questions;
    }

    public function getEssayQuestions(int $toeflSubtestId, int $subtest_id)
    {
        $questions = questions::with('passage')
            ->where('toefl_subtest_id', $toeflSubtestId)
            ->where('subtest_id', $subtest_id)
            ->orderBy('order')
            ->get()
            ->groupBy('passage_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'id' => $first->passage_id,
                    'title' => $first->passage?->title,
                    'passage' => $first->passage?->text,
                    'questions' => $items->map(function ($q) {


                        return [
                            'id' => $q->id,
                            'order' => $q->order,
                            'question' => $q->question,
                        ];
                    })->values(),
                ];
            })->values();
        return $questions;
    }
}
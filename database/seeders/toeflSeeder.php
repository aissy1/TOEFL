<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Toefl;
use App\Models\Subtest;
use App\Models\ToeflSubtest;
use App\Models\Passage;
use App\Models\questions;

class ToeflSeeder extends Seeder
{
    public function run(): void
    {
        // =========================================================
        // Seeder for Subtest Master
        // =========================================================
        Subtest::create([
            'name' => 'reading',
            'slug' => 'Reading Comprehension',
            'order' => 3,
            'instructions' => [
                [
                    "Read each passage carefully before answering the questions.",
                    "Pay attention to the main idea, important details, and implied meaning in the text.",
                    "You can return to the passage while time is still available.",
                    "Choose the answer that is most appropriate based on the content of the reading.",
                    "Manage your time well because there are quite a number of questions."
                ],
            ],
        ]);

        Subtest::create([
            'name' => 'listening',
            'slug' => 'listening Comprehension',
            'order' => 1,
            'instructions' => [
                [
                    "Focus on correct grammar and sentence structure.",
                    "Identify errors in the use of tenses, subject-verb agreement, and parts of speech.",
                    "For the error recognition question, choose the part of the sentence that is incorrect.",
                    "Don't spend too long on one question\u2014move on if in doubt.",
                    "Use the grammar intuition that is most commonly used in formal English."
                ]
            ],
        ]);
        Subtest::create([
            'name' => 'structure',
            'slug' => 'Structure & Written Expression',
            'order' => 2,
            'instructions' => [
                [
                    "Focus on correct grammar and sentence structure.",
                    "Identify errors in the use of tenses, subject-verb agreement, and parts of speech.",
                    "For the error recognition question, choose the part of the sentence that is incorrect.",
                    "Don't spend too long on one question\u2014move on if in doubt.",
                    "Use the grammar intuition that is most commonly used in formal English."
                ]
            ],
        ]);
        Subtest::create([
            'name' => 'essay',
            'slug' => 'essay',
            'order' => 4,
            'instructions' => [
                [
                    "Write the answer with a clear structure: introduction, body, and conclusion.",
                    "Use the correct grammar and vocabulary.",
                    "Develop the idea with supporting examples or reasons and make sure your answer has more than the minimum word length",
                    "Make sure the answers are relevant to the given topic.",
                    "Check your writing again before submitting."
                ]
            ],
        ]);
    }
}
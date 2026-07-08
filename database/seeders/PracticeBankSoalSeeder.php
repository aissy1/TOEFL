<?php

namespace Database\Seeders;

use App\Models\Passage;
use App\Models\Questions;
use App\Models\Subtest;
use App\Models\Toefl;
use App\Models\ToeflSubtest;
use DOMDocument;
use DOMXPath;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use ZipArchive;

class PracticeBankSoalSeeder extends Seeder
{
    private const DOCX_PATH = 'docs/bank soal TOEFL ITP.docx';
    private const TOEFL_CODE = 'PRACTICE-ITP';

    /**
     * Seed a public/practice TOEFL ITP bank from docs/bank soal TOEFL ITP.docx.
     */
    public function run(): void
    {
        $lines = $this->readDocxLines(base_path(self::DOCX_PATH));

        DB::transaction(function () use ($lines) {
            $toefl = Toefl::updateOrCreate(
                ['code' => self::TOEFL_CODE],
                [
                    'name' => 'TOEFL ITP Practice Bank',
                    'status' => 'active',
                ],
            );

            $subtests = $this->ensureSubtests();
            $toeflSubtests = $this->ensureToeflSubtests($toefl, $subtests);

            foreach ($toeflSubtests as $toeflSubtest) {
                Questions::where('toefl_subtest_id', $toeflSubtest->id)->delete();
            }

            $listening = $this->parseListening($lines);
            $structureAnswers = $this->parseStructureAnswers($lines);
            $structure = $this->parseStructure($lines, $structureAnswers);
            $readingAnswers = $this->parseReadingAnswers($lines);
            $reading = $this->parseReading($lines, $readingAnswers);
            $essay = $this->parseEssay($lines);

            $this->seedListening($subtests['listening'], $toeflSubtests['listening'], $listening);
            $this->seedStructure($subtests['structure'], $toeflSubtests['structure'], $structure);
            $this->seedReading($subtests['reading'], $toeflSubtests['reading'], $reading);
            $this->seedEssay($subtests['essay'], $toeflSubtests['essay'], $essay);
        });
    }

    private function ensureSubtests(): array
    {
        $definitions = [
            'listening' => [
                'name' => 'listening',
                'slug' => 'listening Comprehension',
                'order' => 1,
                'instructions' => [
                    'Listen carefully to each conversation or talk.',
                    'The audio and question flow may only be played once during the test.',
                    'Choose the best answer based on what the speakers say or imply.',
                ],
            ],
            'structure' => [
                'name' => 'structure',
                'slug' => 'Structure & Written Expression',
                'order' => 2,
                'instructions' => [
                    'Choose the answer that best completes the sentence or identifies the error.',
                    'Pay attention to grammar, word form, and sentence structure.',
                    'Move on if unsure and manage your time carefully.',
                ],
            ],
            'reading' => [
                'name' => 'reading',
                'slug' => 'Reading Comprehension',
                'order' => 3,
                'instructions' => [
                    'Read each passage carefully before answering the questions.',
                    'Use information stated or implied in the passage.',
                    'Choose the best answer for each question.',
                ],
            ],
            'essay' => [
                'name' => 'essay',
                'slug' => 'essay',
                'order' => 4,
                'instructions' => [
                    'Write a clear response with an introduction, supporting body, and conclusion.',
                    'Use relevant examples and reasons to support your opinion.',
                    'Review your grammar and vocabulary before submitting.',
                ],
            ],
        ];

        $subtests = [];

        foreach ($definitions as $key => $definition) {
            $subtests[$key] = Subtest::updateOrCreate(
                ['name' => $definition['name']],
                $definition,
            );
        }

        return $subtests;
    }

    private function ensureToeflSubtests(Toefl $toefl, array $subtests): array
    {
        $definitions = [
            'listening' => ['order' => 1, 'duration_minutes' => 35, 'total_questions' => 50, 'passing_score' => 50],
            'structure' => ['order' => 2, 'duration_minutes' => 25, 'total_questions' => 40, 'passing_score' => 40],
            'reading' => ['order' => 3, 'duration_minutes' => 55, 'total_questions' => 50, 'passing_score' => 50],
            'essay' => ['order' => 4, 'duration_minutes' => 30, 'total_questions' => 1, 'passing_score' => 100],
        ];

        $toeflSubtests = [];

        foreach ($definitions as $key => $definition) {
            $toeflSubtests[$key] = ToeflSubtest::updateOrCreate(
                [
                    'toefl_id' => $toefl->id,
                    'subtest_id' => $subtests[$key]->id,
                ],
                $definition,
            );
        }

        return $toeflSubtests;
    }

    private function seedListening(Subtest $subtest, ToeflSubtest $toeflSubtest, array $items): void
    {
        foreach ($items as $item) {
            $passage = $this->updateOrCreatePassage(
                $subtest->id,
                "Listening Item {$item['number']}",
                $this->listeningPayload($item),
                true,
            );

            Questions::create([
                'toefl_subtest_id' => $toeflSubtest->id,
                'subtest_id' => $subtest->id,
                'passage_id' => $passage->id,
                'order' => $item['number'],
                'question_type' => 'multiple_choice',
                'question' => $item['question'],
                'choices' => $item['choices'],
                'correct_answer' => $item['answer'],
                'point' => 1,
            ]);
        }
    }

    private function seedStructure(Subtest $subtest, ToeflSubtest $toeflSubtest, array $items): void
    {
        $passage = $this->updateOrCreatePassage(
            $subtest->id,
            'Structure Practice Items',
            'Structure and Written Expression practice questions.',
        );

        foreach ($items as $item) {
            Questions::create([
                'toefl_subtest_id' => $toeflSubtest->id,
                'subtest_id' => $subtest->id,
                'passage_id' => $passage->id,
                'order' => $item['number'],
                'question_type' => 'multiple_choice',
                'question' => $item['question'],
                'choices' => $item['choices'],
                'correct_answer' => $item['answer'],
                'point' => 1,
            ]);
        }
    }

    private function seedReading(Subtest $subtest, ToeflSubtest $toeflSubtest, array $passages): void
    {
        foreach ($passages as $index => $readingPassage) {
            $passage = $this->updateOrCreatePassage(
                $subtest->id,
                'Reading Passage ' . ($index + 1),
                $readingPassage['passage'],
            );

            foreach ($readingPassage['questions'] as $item) {
                Questions::create([
                    'toefl_subtest_id' => $toeflSubtest->id,
                    'subtest_id' => $subtest->id,
                    'passage_id' => $passage->id,
                    'order' => $item['number'],
                    'question_type' => 'multiple_choice',
                    'question' => $item['question'],
                    'choices' => $item['choices'],
                    'correct_answer' => $item['answer'],
                    'point' => 1,
                ]);
            }
        }
    }

    private function seedEssay(Subtest $subtest, ToeflSubtest $toeflSubtest, array $essay): void
    {
        $passage = $this->updateOrCreatePassage(
            $subtest->id,
            $essay['title'],
            $essay['instruction'],
        );

        Questions::create([
            'toefl_subtest_id' => $toeflSubtest->id,
            'subtest_id' => $subtest->id,
            'passage_id' => $passage->id,
            'order' => 1,
            'question_type' => 'essay',
            'question' => $essay['prompt'],
            'choices' => null,
            'correct_answer' => null,
            'keywords' => [],
            'min_words' => 120,
            'point' => 100,
        ]);
    }

    private function updateOrCreatePassage(int $subtestId, string $title, string $text, bool $isJsonString = false): Passage
    {
        $passage = Passage::firstOrNew([
            'subtest_id' => $subtestId,
            'title' => $title,
        ]);

        $passage->text = $isJsonString ? $text : $text;
        $passage->save();

        return $passage;
    }

    private function parseListening(array $lines): array
    {
        $start = $this->findLineIndex($lines, 'LISTENING COMPREHENSION');
        $end = $this->findLineIndex($lines, 'STRUCTURE');
        $items = [];
        $pendingNumber = null;

        for ($i = $start; $i < $end; $i++) {
            $line = $lines[$i];
            $number = $this->lineNumber($line);

            if ($number !== null) {
                $pendingNumber = $number;
                continue;
            }

            if ($pendingNumber === null || str_starts_with($line, 'Answer:')) {
                continue;
            }

            $parsed = $this->parseQuestionLine($line);
            $listeningQuestion = $this->extractListeningQuestion($parsed['question']);
            $answer = null;

            if (isset($lines[$i + 1]) && preg_match('/^Answer:\s*([A-D])/i', $lines[$i + 1], $matches)) {
                $answer = strtoupper($matches[1]);
                $i++;
            }

            $items[] = array_merge($parsed, [
                'number' => $pendingNumber,
                'listening_text' => $this->extractListeningText($parsed['question']),
                'question' => $listeningQuestion,
                'answer' => $answer,
            ]);

            $pendingNumber = null;
        }

        return $items;
    }

    private function parseStructure(array $lines, array $answers): array
    {
        $start = $this->findLineIndex($lines, 'STRUCTURE') + 1;
        $end = $this->findLineIndex($lines, 'No', $start);
        $items = [];
        $pendingNumber = null;

        for ($i = $start; $i < $end; $i++) {
            $line = $lines[$i];
            $number = $this->lineNumber($line);

            if ($number !== null) {
                $pendingNumber = $number;
                continue;
            }

            if ($pendingNumber === null) {
                continue;
            }

            $questionLine = $line;

            if (!$this->hasChoices($questionLine) && isset($lines[$i + 1])) {
                $questionLine .= $lines[$i + 1];
                $i++;
            }

            $parsed = $this->parseQuestionLine($questionLine);
            $items[] = array_merge($parsed, [
                'number' => $pendingNumber,
                'answer' => $answers[$pendingNumber] ?? null,
            ]);

            $pendingNumber = null;
        }

        return $items;
    }

    private function parseReading(array $lines, array $answers): array
    {
        $start = $this->findLineIndex($lines, 'READING COMPREHENSION') + 1;
        $end = $this->findLineIndex($lines, '📘 READING PASSAGE 1');
        $passages = [];
        $current = null;

        for ($i = $start; $i < $end; $i++) {
            $line = $lines[$i];

            if (str_starts_with($line, '(Topik:')) {
                if ($current !== null) {
                    $passages[] = $current;
                }

                $current = [
                    'title' => trim($line, "()"),
                    'passage_lines' => [],
                    'questions' => [],
                ];

                continue;
            }

            if ($current === null) {
                continue;
            }

            if (preg_match('/^(\d+)\.\s*(.+)$/u', $line, $matches)) {
                $number = (int) $matches[1];
                $questionLine = $matches[2];

                if (!$this->hasChoices($questionLine) && isset($lines[$i + 1])) {
                    $questionLine .= $lines[$i + 1];
                    $i++;
                }

                $parsed = $this->parseQuestionLine($questionLine);
                $current['questions'][] = array_merge($parsed, [
                    'number' => $number,
                    'answer' => $answers[$number] ?? null,
                ]);

                continue;
            }

            $current['passage_lines'][] = $line;
        }

        if ($current !== null) {
            $passages[] = $current;
        }

        return array_map(fn(array $passage) => [
            'title' => $passage['title'],
            'passage' => implode("\n\n", $passage['passage_lines']),
            'questions' => $passage['questions'],
        ], $passages);
    }

    private function parseEssay(array $lines): array
    {
        $start = $this->findLineIndex($lines, 'Essay Prompt');

        return [
            'title' => $lines[$start],
            'prompt' => $lines[$start + 1] ?? '',
            'instruction' => trim(($lines[$start + 2] ?? '') . "\n" . ($lines[$start + 3] ?? '')),
        ];
    }

    private function parseStructureAnswers(array $lines): array
    {
        $start = $this->findLineIndex($lines, 'Jawaban') + 1;
        $end = $this->findLineIndex($lines, 'READING COMPREHENSION');

        return $this->parseNumberedAnswerPairs(array_slice($lines, $start, $end - $start));
    }

    private function parseReadingAnswers(array $lines): array
    {
        $start = $this->findLineIndex($lines, '📘 READING PASSAGE 1');
        $end = $this->findLineIndex($lines, 'Essay Prompt');
        $answers = [];
        $number = 1;

        for ($i = $start; $i < $end; $i++) {
            if (preg_match('/^[A-D]$/', $lines[$i])) {
                $answers[$number] = $lines[$i];
                $number++;
            }
        }

        return $answers;
    }

    private function parseNumberedAnswerPairs(array $lines): array
    {
        $answers = [];

        for ($i = 0; $i < count($lines) - 1; $i++) {
            if (preg_match('/^\d+$/', $lines[$i]) && preg_match('/^[A-D]$/', $lines[$i + 1])) {
                $answers[(int) $lines[$i]] = $lines[$i + 1];
                $i++;
            }
        }

        return $answers;
    }

    private function parseQuestionLine(string $line): array
    {
        if (!preg_match('/^(.*?)A\.\s*(.*?)B\.\s*(.*?)C\.\s*(.*?)D\.\s*(.*)$/u', $line, $matches)) {
            throw new RuntimeException("Unable to parse question line: {$line}");
        }

        return [
            'question' => trim($this->stripQuestionPrefix($matches[1])),
            'choices' => [
                'A' => trim($matches[2]),
                'B' => trim($matches[3]),
                'C' => trim($matches[4]),
                'D' => trim($matches[5]),
            ],
        ];
    }

    private function hasChoices(string $line): bool
    {
        return preg_match('/A\..*B\..*C\..*D\./u', $line) === 1;
    }

    private function stripQuestionPrefix(string $text): string
    {
        return trim(preg_replace('/^Question:\s*/i', '', $text));
    }

    private function listeningPayload(array $item): string
    {
        $payload = [
            'type' => 'listening',
            'part' => $item['number'] <= 30 ? 'A' : ($item['number'] <= 38 ? 'B' : 'C'),
            'actors' => [
                ['id' => 'speaker_1', 'name' => 'Speaker 1', 'gender' => 'unknown'],
            ],
            'dialog' => [
                ['actor_id' => 'speaker_1', 'text' => $item['listening_text']],
            ],
        ];

        return json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    private function extractListeningText(string $question): string
    {
        $parts = preg_split('/Question:\s*/i', $question, 2);

        return trim($parts[0] ?? $question);
    }

    private function extractListeningQuestion(string $question): string
    {
        $parts = preg_split('/Question:\s*/i', $question, 2);

        return trim($parts[1] ?? $question);
    }

    private function readDocxLines(string $path): array
    {
        if (!file_exists($path)) {
            throw new RuntimeException("Bank soal file not found: {$path}");
        }

        $zip = new ZipArchive();
        $opened = $zip->open($path);

        if ($opened !== true) {
            throw new RuntimeException("Unable to open DOCX file: {$path}");
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xml === false) {
            throw new RuntimeException('word/document.xml not found in DOCX file.');
        }

        $document = new DOMDocument();
        $document->loadXML($xml);

        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');

        $lines = [];

        foreach ($xpath->query('//w:p') as $paragraph) {
            $text = '';

            foreach ($xpath->query('.//w:t', $paragraph) as $node) {
                $text .= $node->nodeValue;
            }

            $text = trim($text);

            if ($text !== '') {
                $lines[] = $text;
            }
        }

        return $lines;
    }

    private function findLineIndex(array $lines, string $needle, int $offset = 0): int
    {
        for ($index = $offset; $index < count($lines); $index++) {
            $line = $lines[$index];

            if (str_contains($line, $needle)) {
                return $index;
            }
        }

        throw new RuntimeException("Unable to find section marker: {$needle}");
    }

    private function lineNumber(string $line): ?int
    {
        if (preg_match('/(\d+)\.$/', $line, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }
}

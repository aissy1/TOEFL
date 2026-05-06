<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Toefl;
use App\Models\Passage;
use App\Models\Subtest;
use App\Models\TestScore;
use App\Models\questions;
use App\Models\TestAttempt;
use App\Models\EssayAnswer;
use App\Jobs\AesScoringJob;
use App\Models\ToeflSubtest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use function Pest\Laravel\json;

class AdminToeflController extends Controller
{
    private function questionRules(): array
    {
        return [
            'toefl_subtest_id' => 'required|exists:toefl_subtests,id',
            'subtest_id' => 'required|exists:subtests,id',
            'passage_id' => 'nullable|exists:passages,id',
            'order' => 'required|integer|min:1',
            'question' => 'required|string',
            'question_type' => 'required|in:multiple_choice,written,essay',

            // MCQ
            'choices' => 'required_if:question_type,multiple_choice,written|array|size:4',
            'correct_answer' => 'nullable|required_if:question_type,multiple_choice,written|in:A,B,C,D',

            // Essay
            'keywords' => 'nullable|required_if:question_type,essay|string',

            'point' => 'required|integer|min:1',
        ];
    }
    private function validateListeningPayload(array $payload): void
    {
        if (!isset($payload['actors']) || count($payload['actors']) < 1) {
            abort(422, 'Listening passage must have at least one actor.');
        }

        if (!isset($payload['dialog']) || count($payload['dialog']) < 1) {
            abort(422, 'Listening passage must have dialog.');
        }

        foreach ($payload['actors'] as $actor) {
            if (empty($actor['name'])) {
                abort(422, 'Actor name cannot be empty.');
            }
        }

        foreach ($payload['dialog'] as $line) {
            if (empty($line['actor_id']) || empty($line['text'])) {
                abort(422, 'Dialog line is invalid.');
            }
        }
    }

    // method to manage toefl data
    public function getToefl(Request $request)
    {
        $toefl = Toefl::query()
            ->select('id', 'code', 'name', 'status', 'created_at')
            ->orderBy('status', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('components/admin/toefl/index', [
            'toefls' => $toefl,
        ]);
    }
    public function create()
    {
        return Inertia::render('components/admin/toefl/form/create-toefl', [
            'subtestMaster' => Subtest::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255',

            'subtests' => 'required|array|min:1',
            'subtests.*.subtest_id' => 'required|exists:subtests,id',
            'subtests.*.order' => 'required|integer',
            'subtests.*.duration_minutes' => 'required|integer|min:1',
            'subtests.*.total_questions' => 'required|integer|min:1',
            'subtests.*.passing_score' => 'required|integer|min:0|max:100',
        ]);

        DB::transaction(function () use ($validated) {
            $toefl = Toefl::create([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'status' => 'inactive',
            ]);

            foreach ($validated['subtests'] as $subtest) {
                ToeflSubtest::create([
                    'toefl_id' => $toefl->id,
                    'subtest_id' => $subtest['subtest_id'],
                    'order' => $subtest['order'],
                    'duration_minutes' => $subtest['duration_minutes'],
                    'total_questions' => $subtest['total_questions'],
                    'passing_score' => $subtest['passing_score'],
                ]);
            }
        });

        return redirect()->route('admin.toefl.create')->with('success', 'TOEFL created successfully');
    }

    public function edit(int $id)
    {
        $toefl = Toefl::with('subtests')->findOrFail($id);
        $toeflSubtests = Toefl::with('toeflSubtests')->findOrFail($id);

        $subtestMaster = Subtest::select('id', 'name')->get();
        return Inertia::render('components/admin/toefl/form/edit-toefl', [
            'toefl' => $toefl,
            'toeflSubtests' => $toeflSubtests,
            'subtestMaster' => $subtestMaster,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255',
            'status' => 'required|in:active,draft,inactive',

            'subtests' => 'required|array|min:1',
            'subtests.*.subtest_id' => 'required|exists:subtests,id',
            'subtests.*.order' => 'required|integer|min:1',
            'subtests.*.duration_minutes' => 'required|integer|min:1',
            'subtests.*.total_questions' => 'required|integer|min:1',
            'subtests.*.passing_score' => 'required|integer|min:0|max:100',
        ]);

        /** =====================
         *  VALIDASI ORDER UNIK
         *  ===================== */
        $orders = collect($validated['subtests'])->pluck('order');

        if ($orders->count() !== $orders->unique()->count()) {
            return back()->withErrors([
                'subtests' => 'Each subtest must have a unique order value.',
            ]);
        }

        // check questions before activate toefl
        if ($validated['status'] === 'active') {
            $subtests = ToeflSubtest::where('toefl_id', $id)->get();

            if ($subtests->isEmpty()) {
                return back()->withErrors(['status' => 'All Subtest must have a questions']);
            }

            $subtestsWithoutQuestions = $subtests->filter(
                fn($subtest) => $subtest->questions()->count() === 0
            );

            if ($subtestsWithoutQuestions->isNotEmpty()) {
                $names = $subtestsWithoutQuestions->map(fn($s) => $s->subtest->name)->join(', ');
                return back()->withErrors(['status' => "Subtests missing questions: {$names}."]);
            }
        }


        DB::transaction(function () use ($validated, $id) {
            $toefl = Toefl::findOrFail($id);

            /** UPDATE TOEFL */
            $toefl->update([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'status' => $validated['status'],
            ]);

            $incomingSubtestIds = [];

            /** UPDATE ATAU INSERT SUBTEST */
            foreach ($validated['subtests'] as $subtest) {
                $updated = ToeflSubtest::updateOrCreate(
                    [
                        'toefl_id' => $toefl->id,
                        'subtest_id' => $subtest['subtest_id'],
                    ],
                    [
                        'order' => $subtest['order'],
                        'duration_minutes' => $subtest['duration_minutes'],
                        'total_questions' => $subtest['total_questions'],
                        'passing_score' => $subtest['passing_score'],
                    ]
                );

                $incomingSubtestIds[] = $updated->id;
            }

            /** HAPUS SUBTEST YANG TIDAK ADA DI REQUEST (tanpa cascade ke questions) */
            ToeflSubtest::where('toefl_id', $toefl->id)
                ->whereNotIn('id', $incomingSubtestIds)
                ->delete();
        });

        return redirect()
            ->route('admin.toefl.edit', $id)
            ->with('success', 'TOEFL updated successfully');
    }

    public function destroy(int $id)
    {
        $toefl = Toefl::with('subtests')->findOrFail($id);
        $toefl->delete();

        return redirect()
            ->route('admin.toefl')
            ->with('success', 'TOEFL deleted successfully');
    }

    public function getToeflSubtests(int $id)
    {
        $toefl = Toefl::with('subtests')->findOrFail($id);

        foreach ($toefl->subtests as $subtest) {
            $subtest->name;
            $subtest->pivot->duration_minutes;
            $subtest->pivot->total_questions;
            $subtest->pivot->passing_score;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data retrieved successfully',
            'data' => $toefl
        ], 200);
    }

    // method to manage toefl subtests
    public function getSubtests(Request $request)
    {
        $subtests = Subtest::query()
            ->select('id', 'name', 'slug', 'order')
            ->orderBy('id', 'asc')
            ->get();
        return Inertia::render('components/admin/subtest/index', [
            'subtests' => $subtests,
        ]);
    }

    public function createSubtest()
    {
        return Inertia::render('components/admin/subtest/form/create-form');
    }

    public function storeSubtest(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'required|integer',
            'slug' => 'required|string|max:255|unique:subtests,slug',
            'instructions' => 'nullable|array',
            'instructions.*' => 'nullable|string|max:500',
        ]);

        Subtest::create($validated);

        return redirect()->route('admin.subtests.create')->with('success', 'Subtest created successfully');
    }

    public function editSubtest(int $id)
    {
        $subtest = Subtest::findOrFail($id);
        return Inertia::render('components/admin/subtest/form/edit-form', [
            'subtest' => $subtest,
        ]);
    }

    public function updateSubtest(Request $request, int $id)
    {
        $subtest = Subtest::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'required|integer',
            'slug' => 'required|string|max:255|unique:subtests,slug,' . $subtest->id,
            'instructions' => 'nullable|array',
            'instructions.*' => 'nullable|string|max:500',
        ]);

        $subtest->update($validated);

        return redirect()
            ->route('admin.subtests.edit', $id)
            ->with('success', 'Subtest updated successfully');
    }

    public function destroySubtest(int $id)
    {
        $subtest = Subtest::findOrFail($id);
        $subtest->delete();

        return redirect()
            ->route('admin.subtests')
            ->with('success', 'Subtest deleted successfully');
    }

    // method to manage questions

    public function getBankQuestions()
    {
        $toefls = Toefl::with([
            'toeflSubtests.subtest' => function ($q) {
                $q->withCount('questions');
            }
        ])
            ->withCount('toeflSubtests')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('components/admin/questions/index', [
            'toefls' => $toefls
        ]);
    }

    public function getQuestionsSubtest(int $toeflId, int $toeflSubtest, int $subtestId)
    {
        $toefl = Toefl::findOrFail($toeflId);

        $toeflSubtest = ToeflSubtest::with('subtest')
            ->where('id', $toeflSubtest)
            ->where('toefl_id', $toeflId)
            ->where('subtest_id', $subtestId)
            ->firstOrFail();

        $subtest = $toeflSubtest->subtest;

        $questions = questions::query()
            ->where('toefl_subtest_id', $toeflSubtest->id)
            ->orderBy('order')
            ->get();

        $totalScore = questions::query()
            ->where('toefl_subtest_id', $toeflSubtest->id)
            ->sum('point');

        return Inertia::render('components/admin/questions/questions-details', [
            'toefl' => $toefl,
            'subtest' => $subtest,
            'toeflSubtest' => $toeflSubtest,
            'questions' => $questions,
            'totalScore' => $totalScore,
        ]);
    }

    public function previewQuestionsSubtest(int $toeflId, int $toeflSubtest, int $subtestId, int $questionId)
    {
        $passages = Passage::query()
            ->where('subtest_id', $subtestId)
            ->select('id', 'title', 'text')
            ->get();
        $question = questions::where('id', $questionId)
            ->where('toefl_subtest_id', $toeflSubtest)
            ->where('subtest_id', $subtestId)
            ->firstOrFail();

        return Inertia::render('components/admin/questions/form/preview-form', [
            'context' => [
                "toefl" => $toeflId,
                "toeflSubtest" => $toeflSubtest,
                "subtest" => $subtestId
            ],
            'passages' => $passages,
            'questions' => $question,
        ]);
    }

    public function createQuestionsSubtest(int $toeflId, int $toeflSubtest, int $subtestId)
    {
        $passages = Passage::query()
            ->where('subtest_id', $subtestId)
            ->select('id', 'title', 'text')
            ->get();

        $lastOrderQuestion = questions::query()
            ->where('toefl_subtest_id', $toeflSubtest)
            ->max('order') ?? 0;

        return Inertia::render('components/admin/questions/form/create-form', [
            'context' => [
                "toefl" => $toeflId,
                "toeflSubtest" => $toeflSubtest,
                "subtest" => $subtestId
            ],
            'passages' => $passages,
            'lastQuestion' => (int) $lastOrderQuestion,
        ]);
    }

    public function storeQuestionsSubtest(Request $request, $toefl, $toeflSubtest, $subtest)
    {

        $validated = $request->validate($this->questionRules());

        // Cegah order bentrok dalam subtest
        $exists = questions::where('toefl_subtest_id', $validated['toefl_subtest_id'])
            ->where('order', $validated['order'])
            ->where('subtest_id', $validated['subtest_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'order' => 'Order can\'t be duplicated !',
            ]);
        }

        questions::create($validated);

        return redirect()
            ->route('admin.questions.subtest.create', [$toefl, $toeflSubtest, $subtest])
            ->with('success', 'Question berhasil dibuat');
    }

    public function editQuestionsSubtest($toefl, $toeflSubtest, $subtest, int $id)
    {
        $passages = Passage::query()
            ->where('subtest_id', $subtest)
            ->select('id', 'title', 'text')
            ->get();
        $question = questions::where('id', $id)
            ->where('toefl_subtest_id', $toeflSubtest)
            ->where('subtest_id', $subtest)
            ->firstOrFail();

        return Inertia::render('components/admin/questions/form/edit-form', [
            'context' => [
                "toefl" => $toefl,
                "toeflSubtest" => $toeflSubtest,
                "subtest" => $subtest
            ],
            'passages' => $passages,
            'questions' => $question,
        ]);
    }

    public function updateQuestionsSubtest(Request $request, $toefl, int $toeflSubtest, int $subtest, int $id)
    {
        $question = questions::where('id', $id)
            ->where('toefl_subtest_id', $toeflSubtest)
            ->where('subtest_id', $subtest)
            ->firstOrFail();

        $validated = $request->validate($this->questionRules());

        if ($request->order != $question->order) {
            // Cegah order bentrok dalam subtest
            $exists = questions::where('toefl_subtest_id', $validated['toefl_subtest_id'])
                ->where('order', $validated['order'])
                ->where('subtest_id', $validated['subtest_id'])
                ->exists();

            if ($exists) {
                return back()->withErrors([
                    'order' => 'Order can\'t be duplicated !',
                ]);
            }
        }

        $question->update($validated);

        return redirect()
            ->route('admin.questions.subtest.preview', [$toefl, $toeflSubtest, $subtest, $id])
            ->with('success', 'Question berhasil diupdate');
    }

    public function deleteQuestionsSubtest($toefl, $toeflSubtest, $subtest, int $id)
    {
        questions::where('id', $id)->delete();

        return redirect()->route('admin.questions.subtest', [$toefl, $toeflSubtest, $subtest])
            ->with('success', 'Question berhasil dihapus');
    }



    // Manage Passages
    public function getPassages()
    {
        $passages = Passage::all();

        return Inertia::render('components/admin/questions/passages/index', [
            'passages' => $passages,
        ]);
    }

    public function viewPassages(int $id)
    {
        $Subtests = Subtest::query()
            ->select('id', 'name')
            ->get();
        $passage = Passage::with('subtest')->findOrFail($id);

        $text = is_array($passage->text)
            ? $passage->text
            : json_decode((string) $passage->text, true);

        $type = $text['type'] ?? 'reading';

        return Inertia::render('components/admin/questions/passages/form/preview-form', [
            'subtests' => $Subtests,
            'passages' => [
                'id' => $passage->id,
                'title' => $passage->title,
                'subtest_id' => $passage->subtest_id,
                'subtest' => $passage->subtest->name,
                'type' => $type,
                'actors' => $text['actors'] ?? [],
                'dialog' => $text['dialog'] ?? [],
                'text' => $passage->text,
                'audio_url' => $passage->audio_url,
            ],
        ]);
    }

    public function createPassages()
    {
        $Subtests = Subtest::query()
            ->select('id', 'name')
            ->get();

        return Inertia::render('components/admin/questions/passages/form/create-form', [
            'subtests' => $Subtests
        ]);
    }
    public function storePassages(Request $request)
    {
        $validated = $request->validate([
            'subtest_id' => 'required|exists:subtests,id',
            'title' => 'required|string|max:255',
            'text' => 'required',
        ]);

        // VALIDASI KHUSUS LISTENING
        if (is_array($validated['text']) && ($validated['text']['type'] ?? null) === 'listening') {
            $this->validateListeningPayload($validated['text']);
        }

        Passage::create($validated);

        return redirect()->route('admin.questions.passage.create');
    }

    public function editPassages(int $id)
    {
        $Subtests = Subtest::query()
            ->select('id', 'name')
            ->get();

        $passages = Passage::with('subtest')->findOrFail($id);

        return Inertia::render('components/admin/questions/passages/form/edit-form', [
            'passages' => $passages,
            'subtests' => $Subtests
        ]);
    }

    public function updatePassages(Request $request, int $id)
    {
        $passages = Passage::findOrFail($id);

        $validated = $request->validate([
            'subtest_id' => ['required', 'exists:subtests,id'],
            'title' => 'required|string|max:255',
            'text' => 'required|string',
        ]);

        $passages->update($validated);

        return redirect()->route('admin.questions.passage.edit', $id)
            ->with('success', 'Passage berhasil diubah');
    }

    public function deletePassages(int $id)
    {
        Passage::where('id', $id)->delete();

        return redirect()->route('admin.questions.passage')
            ->with('success', 'Passage berhasil dihapus');
    }

    // Manage Test Attempts
    public function getAttempts()
    {
        $toefls = Toefl::select('id', 'name', 'code')->get();

        return Inertia::render('components/admin/attempts/index', [
            'toefls' => $toefls,
        ]);
    }
    public function getToeflAttempts(int $id)
    {
        $toefl = Toefl::findOrFail($id);

        $attempts = TestAttempt::with('user')
            ->where('toefl_id', $toefl->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('components/admin/attempts/details/test-attempts', [
            'toefl' => $toefl,
            'attempts' => $attempts,
        ]);
    }
    public function viewUserAttempts(int $id, int $userId)
    {
        $result = TestAttempt::with('scores')
            ->where('id', $id)
            ->where('user_id', $userId)
            ->firstOrFail();

        $toefl = Toefl::findOrFail($result->toefl_id);

        $user = $result->user()->select('name', 'email')->first();

        $essayAnswers = EssayAnswer::with('questions')
            ->where('test_attempt_id', $result->id)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'question' => $item->questions->question,
                    'answer_text' => $item->answer_text,
                    'similarity_score' => $item->similarity_score,
                    'grammar_score' => $item->grammar_score,
                    'word_count' => $item->word_count,
                    'manual_score' => $item->manual_score,
                    'score' => $item->score,
                    'final_score' => $item->final_score,
                ];
            });

        $subtests = ToeflSubtest::with('subtest')
            ->where('toefl_id', $result->toefl_id)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->subtest->id,
                    'name' => $item->subtest->name,
                    'order' => $item->order,
                    'passing_score' => $item->passing_score,
                ];
            });

        return Inertia::render('components/admin/attempts/details/view-attempts', [
            'results' => fn() => $result,
            'toefl' => fn() => $toefl,
            'subtests' => fn() => $subtests,
            'user' => fn() => $user,
            'essayAnswers' => fn() => $essayAnswers,
        ]);
    }

    public function gradeSystem(int $attempt)
    {
        $answers = EssayAnswer::where('test_attempt_id', $attempt)
            ->whereIn('aes_status', ['failed', 'pending'])
            ->get();

        if ($answers->isEmpty()) {
            return back()->with('info', 'Semua jawaban sudah dinilai.');
        }

        foreach ($answers as $index => $answer) {
            $answer->update(['aes_status' => 'processing']);

            AesScoringJob::dispatch($answer->id)
                ->delay(now()->addSeconds($index * 5));
        }

        return back()->with(
            'success',
            "Re-scoring {$answers->count()} jawaban dimulai."
        );
    }

    public function grade(Request $request, int $toeflId, int $userId, int $attempt)
    {
        $testAttempt = TestAttempt::findOrFail($attempt);
        $request->validate([
            'grades' => 'required|array',
            'grades.*.id' => 'required|exists:essay_answers,id',
            'grades.*.manual_score_expert1' => 'nullable|numeric|min:0',
            'grades.*.manual_score_expert2' => 'nullable|numeric|min:0',
            'grades.*.final_score_type' => 'required|in:manual,system',
        ]);

        foreach ($request->grades as $grade) {
            $answer = EssayAnswer::find($grade['id']);

            $manualAvg = ($grade['manual_score_expert1'] !== null && $grade['manual_score_expert2'] !== null)
                ? ($grade['manual_score_expert1'] + $grade['manual_score_expert2']) / 2
                : null;

            $finalScore = $grade['final_score_type'] === 'manual'
                ? $manualAvg
                : ($answer->similarity_score + $answer->grammar_score);

            $answer->update([
                'manual_score' => [
                    'expert1' => $grade['manual_score_expert1'],
                    'expert2' => $grade['manual_score_expert2'],
                ],
                'final_score_type' => $grade['final_score_type'],
                'final_score' => $finalScore,
            ]);
        }

        // Update raw_score di test_scores untuk subtest essay
        $totalEssayScore = EssayAnswer::where('test_attempt_id', $testAttempt->id)
            ->sum('final_score') ?? 0;

        TestScore::where('test_attempt_id', $testAttempt->id)
            ->where('subtest_id', 4)
            ->update(['raw_score' => $totalEssayScore]);

        return back();
    }

}

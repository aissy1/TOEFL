<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Passage;
use Inertia\Inertia;
use App\Models\Toefl;
use App\Models\ToeflSubtest;
use App\Models\Subtest;
use App\Models\questions;
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
            'question_type' => 'required|in:multiple_choice,essay',

            // MCQ
            'choices' => 'required_if:question_type,multiple_choice|array|size:4',
            'correct_answer' => 'nullable|required_if:question_type,multiple_choice|in:A,B,C,D',

            // Essay
            'keywords' => 'required_if:question_type,essay|array|min:1',
            'keywords.*' => 'nullable|string|max:255',

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
            ->orderBy('status', 'desc')
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

    public function edit($id)
    {
        $toefl = Toefl::with('subtests')->findOrFail($id);
        $subtestMaster = Subtest::select('id', 'name')->get();
        return Inertia::render('components/admin/toefl/form/edit-toefl', [
            'toefl' => $toefl,
            'subtestMaster' => $subtestMaster,
        ]);
    }

    public function update(Request $request, $id)
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

        DB::transaction(function () use ($validated, $id) {
            $toefl = Toefl::findOrFail($id);

            /** UPDATE TOEFL */
            $toefl->update([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'status' => $validated['status'],
            ]);

            /** HAPUS SEMUA SUBTEST LAMA */
            ToeflSubtest::where('toefl_id', $toefl->id)->delete();

            /** INSERT ULANG (ORDER SUDAH BERSIH) */
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

        return redirect()
            ->route('admin.toefl.edit', $id)
            ->with('success', 'TOEFL updated successfully');
    }

    public function destroy($id)
    {
        $toefl = Toefl::with('subtests')->findOrFail($id);
        $toefl->delete();

        return redirect()
            ->route('admin.toefl')
            ->with('success', 'TOEFL deleted successfully');
    }

    public function getToeflSubtests($id)
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
        ]);

        Subtest::create($validated);

        return redirect()->route('admin.subtests.create')->with('success', 'Subtest created successfully');
    }

    public function editSubtest($id)
    {
        $subtest = Subtest::findOrFail($id);
        return Inertia::render('components/admin/subtest/form/edit-form', [
            'subtest' => $subtest,
        ]);
    }

    public function updateSubtest(Request $request, $id)
    {
        $subtest = Subtest::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'order' => 'required|integer',
            'slug' => 'required|string|max:255|unique:subtests,slug,' . $subtest->id,
        ]);

        $subtest->update($validated);

        return redirect()
            ->route('admin.subtests.edit', $id)
            ->with('success', 'Subtest updated successfully');
    }

    public function destroySubtest($id)
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

    public function getQuestionsSubtest($toeflId, $toeflSubtest, $subtestId)
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

    public function previewQuestionsSubtest($toeflId, $toeflSubtest, $subtestId, $questionId)
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

    public function createQuestionsSubtest($toeflId, $toeflSubtest, $subtestId)
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

    public function editQuestionsSubtest($toefl, $toeflSubtest, $subtest, $id)
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

    public function updateQuestionsSubtest(Request $request, $toefl, $toeflSubtest, $subtest, $id)
    {
        $question = questions::where('id', $id)
            ->where('toefl_subtest_id', $toeflSubtest)
            ->where('subtest_id', $subtest)
            ->firstOrFail();

        $validated = $request->validate($this->questionRules());

        // Cegah order bentrok dalam subtest
        $exists = questions::where('toefl_subtest_id', $validated['toefl_subtest_id'])
            ->where('order', $validated['order'])
            ->where('subtest_id', $validated['subtest_id'])
            ->where('id', '!=', $question->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'order' => 'Order can\'t be duplicated !',
            ]);
        }

        $question->update($validated);

        return redirect()
            ->route('admin.questions.subtest.preview', [$toefl, $toeflSubtest, $subtest, $id])
            ->with('success', 'Question berhasil diupdate');
    }

    public function deleteQuestionsSubtest($toefl, $toeflSubtest, $subtest, $id)
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

    public function viewPassages($id)
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

    public function editPassages($id)
    {
        $Subtests = Subtest::query()
            ->select('id', 'name')
            ->get();

        $passages = Passage::findOrFail($id);
        return Inertia::render('components/admin/questions/passages/form/edit-form', [
            'passages' => $passages,
            'subtests' => $Subtests
        ]);
    }

    public function updatePassages(Request $request, $id)
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

    public function deletePassages($id)
    {
        Passage::where('id', $id)->delete();

        return redirect()->route('admin.questions.passage')
            ->with('success', 'Passage berhasil dihapus');
    }

}

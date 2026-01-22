<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Toefl;
use App\Models\ToeflSubtest;
use App\Models\Subtest;
use App\Models\questions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminToeflController extends Controller
{
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

    public function getQuestions(Request $request)
    {
        $questions = questions::query()
            ->select('id', 'question_text', 'type', 'section', 'level')
            ->orderBy('section', 'desc')
            ->get();
        return Inertia::render('components/admin/questions/index', [
            'questions' => $questions,
        ]);
    }
}

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

        return response()->json([
            'status' => 'success',
            'message' => 'TOEFL created successfully',
        ], 201);
    }

    public function edit($id)
    {
        $toefl = Toefl::findOrFail($id);
        return Inertia::render('components/admin/toefl/form/edit-toefl', [
            'toefl' => $toefl,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'status' => 'required|in:active,draft,inactive',
        ]);

        $toefl = Toefl::findOrFail($id);
        $toefl->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'TOEFL updated successfully',
        ]);
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

        return response()->json([
            'status' => 'success',
            'message' => 'Subtest created successfully',
        ], 201);
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

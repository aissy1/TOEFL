<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Toefl;
use App\Models\Subtest;
use App\Models\ToeflSubtest;
use Illuminate\Http\Request;
use function Pest\Laravel\json;

class ToeflController extends Controller
{
    public function showTableToefl()
    {
        return redirect()->route('admin.toefl');
    }


    public function getToefl()
    {
        try {
            $toefl = Toefl::with('subtests')->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Data retrieved successfully',
                'data' => $toefl
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function showDetailToefl(int $id)
    {
        try {
            $toefl = Toefl::with('subtests')->find($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Data retrieved successfully',
                'data' => $toefl
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteToefl(int $id)
    {
        try {
            $toefl = Toefl::find($id);
            $toefl->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Data deleted successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function createToefl(Request $request)
    {
        try {
            $toefl = Toefl::create([
                'name' => $request->name
            ]);
            $subtests = Subtest::all();

            foreach ($subtests as $subtest) {
                ToeflSubtest::create([
                    'toefl_id' => $toefl->id,
                    'subtest_id' => $subtest->id
                ]);
            }
            return response()->json([
                'status' => 'success',
                'message' => 'Data created successfully',
                'data' => $toefl
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function editToefl(Request $request, int $id)
    {
        try {
            $toefl = Toefl::find($id);
            $toefl->update([
                'name' => $request->name,
                'status' => $request->status
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'Data updated successfully',
                'data' => $toefl
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function changeStatusToefl(Request $request, int $id)
    {
        try {
            $toefl = Toefl::find($id);
            $toefl->update([
                'status' => $request->status
            ]);
            return response()->json([
                'status' => 'success',
                'message' => 'Data updated successfully',
                'data' => $toefl
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

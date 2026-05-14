<?php

namespace App\Http\Controllers;

use App\Models\EssayAnswer;
use App\Models\Toefl;
use App\Models\ToeflSubtest;
use App\Models\User;
use App\Models\Passage;
use App\Services\questionsSubtests;
use App\Services\scoringService;
use App\Models\questions;
use App\Models\TestAttempt;
use App\Models\TestScore;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TestUnitController extends Controller
{
    protected $questionsSubtests;
    protected $scoringService;

    public function __construct(questionsSubtests $questionsSubtests, scoringService $scoringService)
    {
        $this->questionsSubtests = $questionsSubtests;
        $this->scoringService = $scoringService;
    }

    private function buildFlow(array $toeflSubtests): array
    {
        // sort by order
        usort($toeflSubtests, fn($a, $b) => $a['order'] <=> $b['order']);

        $flow = ['general'];

        foreach ($toeflSubtests as $item) {
            $name = strtolower($item['subtest']['name']);
            $flow[] = $name;                // info
            $flow[] = "{$name}-question";   // question
        }

        $flow[] = 'scoreboard';

        return $flow;
    }

    public function ThrowSession(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'packetToefl' => 'required|string',
        ]);

        $username = $request->input('username');
        $password = $request->input('password');
        $packetToefl = $request->input('packetToefl');

        $account = User::where('name', $username)
            ->first();

        if (!$account || !password_verify($password, $account->password)) {
            return redirect()->back()->withErrors(['username' => 'Invalid credentials.']);
        }

        $toefl = Toefl::where('code', $packetToefl)
            ->where('status', 'active')
            ->first();

        if (!$toefl) {
            return redirect()->back()->withErrors(['packetToefl' => 'Packet Toefl is invalid or inactive.']);
        }

        TestAttempt::create([
            'user_id' => $account->id,
            'toefl_id' => $toefl->id,
            'started_at' => now('Asia/Jakarta'),
        ]);

        $attempt = TestAttempt::where('user_id', $account->id)
            ->where('toefl_id', $toefl->id)
            ->latest()
            ->first();

        // Simpan data ke session
        session(['username' => $username, 'toefl_id' => $toefl->id, 'attempt_id' => $attempt->id]);

        return redirect()->route('test.show', ['section' => 'general']);
    }


    public function subtestShow(string $section = 'general')
    {

        $toeflId = session('toefl_id');
        $username = session('username');

        if (!$toeflId || !$username) {
            return redirect()->route('home')->with('error', 'Please enter a TOEFL packet code and your credential to start the test.');
        }

        $toeflSubtests = ToeflSubtest::with('subtest')
            ->where('toefl_id', $toeflId)
            ->orderBy('order')
            ->get()
            ->toArray();

        $flow = $this->buildFlow($toeflSubtests);

        $savedAnsweredCounts = session('answeredCounts', []);

        $answeredCounts = collect($toeflSubtests)
            ->mapWithKeys(fn($item) => [
                strtolower($item['subtest']['name']) => $savedAnsweredCounts[strtolower($item['subtest']['name'])] ?? false
            ])
            ->toArray();

        if (!in_array($section, $flow)) {
            abort(404);
        }

        $currentIndex = array_search($section, $flow);

        // Get current subtest data matching the current index
        $currentSubtest = collect($toeflSubtests)->first(function ($item) use ($section) {
            $subtestName = strtolower($item['subtest']['name']);

            return str_contains($section, $subtestName);
        });

        // next otomatis
        $nextSection = $flow[$currentIndex + 1] ?? null;

        // render halaman test (test-question.tsx)
        if (str_ends_with($section, '-question')) {
            //render question
            $questions = match ($section) {
                'reading-question' => $this->questionsSubtests->getReadingQuestions($currentSubtest['id'], $currentSubtest['subtest_id']),
                'listening-question' => $this->questionsSubtests->getListeningQuestions($currentSubtest['id'], $currentSubtest['subtest_id']),
                'structure-question' => $this->questionsSubtests->getStructureQuestions($currentSubtest['id'], $currentSubtest['subtest_id']),
                'essay-question' => $this->questionsSubtests->getEssayQuestions($currentSubtest['id'], $currentSubtest['subtest_id']),
                'writing-question' => $this->questionsSubtests->getEssayQuestions($currentSubtest['id'], $currentSubtest['subtest_id']),
                default => [],
            };

            return Inertia::render('test-question', [
                'section' => $section,
                'username' => $username,
                'answeredCounts' => $answeredCounts,
                'toeflSubtests' => $toeflSubtests,
                'currentSubtest' => $currentSubtest,
                'questions' => $questions,
                'nextSection' => $nextSection,
            ]);
        }

        // render halaman info (test-unit.tsx)
        return Inertia::render('test-unit', [
            'section' => $section,
            'username' => $username,
            'toeflSubtests' => $toeflSubtests,
            'nextSection' => $nextSection,
        ]);
    }

    public function submitTest(Request $request)
    {
        $attemptId = session('attempt_id');
        $toeflId = session('toefl_id');
        $toeflSubtests = $request->input('toeflSubtests');
        $section = $request->input('section');
        $answers = $request->input('answers', []);

        $allSection = ToeflSubtest::where('toefl_id', $toeflId)->count();
        $subtestName = str_replace('-question', '', $section);
        $subtestId = ToeflSubtest::where('id', $toeflSubtests)->value('subtest_id');

        switch ($section) {
            case "reading-question":
                $score = $this->scoringService->scoreChoices($answers, $toeflSubtests, $attemptId);
                session(['ReadingScore' => $score]);
                break;
            case "listening-question":
                $score = $this->scoringService->scoreChoices($answers, $toeflSubtests, $attemptId);
                session(['ListeningScore' => $score]);
                break;
            case "structure-question":
                $score = $this->scoringService->scoreChoices($answers, $toeflSubtests, $attemptId);
                session(['StructureScore' => $score]);
                break;
            case "speaking-question":
                $score = $this->scoringService->scoreChoices($answers, $toeflSubtests, $attemptId);
                session(['SpeakingScore' => $score]);
                break;
            case "essay-question":
                foreach ($answers as $questionId => $answerText) {
                    EssayAnswer::updateOrCreate(
                        ['test_attempt_id' => $attemptId, 'question_id' => $questionId],
                        ['answer_text' => $answerText, 'word_count' => str_word_count($answerText), 'aes_status' => 'pending']
                    );
                }
                $score = null;
                break;
        }

        // Atomic session update — tidak perlu baca dulu
        session()->put("answeredCounts.$subtestName", true);

        if (!is_null($score ?? null)) {
            TestScore::create([
                'test_attempt_id' => $attemptId,
                'subtest_id' => $subtestId,
                'raw_score' => $score,
            ]);
        }

        // Cek apakah semua subtest selesai
        $answeredCounts = session('answeredCounts', []);
        if (count($answeredCounts) >= $allSection) {
            TestAttempt::find($attemptId)->update(['finished_at' => now('Asia/Jakarta')]);
        }

        return back()->with('success', 'Your answers have been submitted successfully.');
    }

    public function resetTest()
    {
        // Clear all test-related session data
        session()->flush();

        return redirect()->route('home');
    }

    public function scoreboard()
    {


        $username = session('username');
        $toeflId = session('toefl_id');
        $attemptId = session('attempt_id');

        $resultAttempt = TestAttempt::with('scores')
            ->where('id', $attemptId)
            ->where('toefl_id', $toeflId)
            ->first();

        $toeflSubtest = ToeflSubtest::with('subtest')
            ->where('toefl_id', $toeflId)
            ->orderBy('order')
            ->get();

        $answeredSubtests = session('answeredCounts', []);

        if (count($answeredSubtests) !== count($toeflSubtest)) {
            return redirect()->route('test.show', ['section' => 'general'])
                ->with('error', 'Please complete all sections before viewing the scoreboard.');
        }

        $scoresMap = $resultAttempt->scores->keyBy('subtest_id');

        $result = $toeflSubtest->map(function ($item) use ($scoresMap) {
            $score = $scoresMap->get($item->subtest_id);

            return [
                'id' => $item->id,
                'toefl_id' => $item->toefl_id,
                'subtest_id' => $item->subtest_id,
                'order' => $item->order,
                'duration_minutes' => $item->duration_minutes,
                'total_questions' => $item->total_questions,
                'passing_score' => $item->passing_score,
                'subtest' => $item->subtest,

                // Score data (null jika belum diproses, misal essay/AES)
                'raw_score' => $score?->raw_score,
                'scaled_score' => $score?->scaled_score,
                'score_status' => $score ? 'complete' : 'pending',
            ];
        });

        return Inertia::render('scoreboard', [
            'result' => $result,
            'username' => $username
        ]);
    }
}


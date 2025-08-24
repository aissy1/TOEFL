<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class PreventReentryTestSection
{
    public function handle(Request $request, Closure $next)
    {
        $section = $request->route('section'); // ambil section dari route

        $sectionRedirectMap = [
            'reading' => 'test/listening',
            'reading-question' => 'test/listening',
            'listening' => 'test/speaking',
            'listening-question' => 'test/speaking',
            'speaking' => 'test/writing',
            'speaking-question' => 'test/writing',
            'writing' => 'scoreboard',
            'writing-question' => 'scoreboard',
        ];

        $answeredMap = [
            'reading' => session('AnsweredCountReading', false),
            'reading-question' => session('AnsweredCountReading', false),
            'listening' => session('AnsweredCountListening', false),
            'listening-question' => session('AnsweredCountListening', false),
            'speaking' => session('AnsweredCountSpeaking', false),
            'speaking-question' => session('AnsweredCountSpeaking', false),
            'writing' => session('AnsweredCountWriting', false),
            'writing-question' => session('AnsweredCountWriting', false),
        ];

        if (!empty($answeredMap[$section])) {
            return redirect($sectionRedirectMap[$section] ?? '/')->with('message', 'You already completed this section!');
        }


        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        return $response;

    }
}

<?php

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;

test('reset test clears only test session data and keeps admin authenticated', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->withoutMiddleware(ValidateCsrfToken::class);

    $response = $this
        ->actingAs($admin)
        ->withSession([
            'username' => 'test-user',
            'toefl_id' => 10,
            'attempt_id' => 20,
            'status' => 'finished',
            'answeredCounts' => ['reading' => true],
            'ReadingScore' => 42,
        ])
        ->post('/reset-test');

    $response->assertRedirect(route('home'));
    $response->assertSessionMissing('username');
    $response->assertSessionMissing('toefl_id');
    $response->assertSessionMissing('attempt_id');
    $response->assertSessionMissing('answeredCounts');

    $this->assertAuthenticatedAs($admin);
});

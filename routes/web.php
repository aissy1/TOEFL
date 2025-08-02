<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TestUnitController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/test/{section?}', [TestUnitController::class, 'subtestShow'])->name('test.show');

Route::post('/submit-test', [TestUnitController::class, 'submitTest'])->name('submit-test');

Route::post('/reset-test', [TestUnitController::class, 'resetTest'])->name('reset-test');

Route::post('/submit-session', [TestUnitController::class, 'ThrowSession'])->name('ThrowSession');

Route::get('/scoreboard', [TestUnitController::class, 'scoreboard'])->name('scoreboard');
;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

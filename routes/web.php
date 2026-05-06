<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TestUnitController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AdminToeflController;

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
    Route::get('admin/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Admin User Management Routes
    Route::get('/admin/users', [AdminUserController::class, 'getUsers'])->name('admin.users');
    Route::get('/admin/users/create', [AdminUserController::class, 'create'])->name('admin.users.create');
    Route::post('/admin/users/create', [AdminUserController::class, 'store'])->name('admin.users.store');
    route::get('/admin/users/edit/{user}', [AdminUserController::class, 'edit'])->name('admin.users.edit');
    Route::put('/admin/users/update/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/admin/users/delete/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.delete');

    // Admin Toefl Management Routes
    Route::get('/admin/toefl', [AdminToeflController::class, 'getToefl'])->name('admin.toefl');
    Route::get('/admin/toefl/{id}/subtests', [AdminToeflController::class, 'getToeflSubtests'])->name('admin.toefl.details');
    Route::get('/admin/toefl/create', [AdminToeflController::class, 'create'])->name('admin.toefl.create');
    Route::post('/admin/toefl/create', [AdminToeflController::class, 'store'])->name('admin.toefl.store');
    Route::get('/admin/toefl/edit/{toefl}', [AdminToeflController::class, 'edit'])->name('admin.toefl.edit');
    Route::put('/admin/toefl/edit/{toefl}', [AdminToeflController::class, 'update'])->name('admin.toefl.update');
    Route::delete('/admin/toefl/delete/{toefl}', [AdminToeflController::class, 'destroy'])->name('admin.toefl.delete');

    // Admin Subtest Management Routes
    Route::get('/admin/subtest', [AdminToeflController::class, 'getSubtests'])->name('admin.subtests');
    Route::get('/admin/subtest/create', [AdminToeflController::class, 'createSubtest'])->name('admin.subtests.create');
    Route::post('/admin/subtest/create', [AdminToeflController::class, 'storeSubtest'])->name('admin.subtests.store');
    Route::get('/admin/subtest/edit/{subtest}', [AdminToeflController::class, 'editSubtest'])->name('admin.subtests.edit');
    Route::put('/admin/subtest/update/{subtest}', [AdminToeflController::class, 'updateSubtest'])->name('admin.subtests.update');
    Route::delete('/admin/subtest/delete/{id}', [AdminToeflController::class, 'destroySubtest'])->name('admin.subtests.delete');


    // Admin Questions Management Routes
    Route::get('/admin/questions', [AdminToeflController::class, 'getBankQuestions'])->name('admin.questions');
    Route::get('/admin/questions/{toefl}/subtest/{toeflSubtest}/{subtest}', [AdminToeflController::class, 'getQuestionsSubtest'])->name('admin.questions.subtest');
    Route::get('/admin/questions/{toefl}/subtest/{toeflSubtest}/{subtest}/preview/{id}', [AdminToeflController::class, 'previewQuestionsSubtest'])->name('admin.questions.subtest.preview');
    Route::get('/admin/questions/{toefl}/subtest/{toeflSubtest}/{subtest}/create', [AdminToeflController::class, 'createQuestionsSubtest'])->name('admin.questions.subtest.create');
    Route::post('/admin/questions/{toefl}/subtest/{toeflSubtest}/{subtest}/store', [AdminToeflController::class, 'storeQuestionsSubtest'])->name('admin.questions.subtest.store');
    Route::get('/admin/questions/{toefl}/subtest/{toeflSubtest}/{subtest}/edit/{id}', [AdminToeflController::class, 'editQuestionsSubtest'])->name('admin.questions.subtest.edit');
    Route::put('/admin/questions/{toefl}/subtest/{toeflSubtest}/{subtest}/update/{id}', [AdminToeflController::class, 'updateQuestionsSubtest'])->name('admin.questions.subtest.update');
    Route::delete('/admin/questions/{toefl}/subtest/{toeflSubtest}/{subtest}/delete/{id}', [AdminToeflController::class, 'deleteQuestionsSubtest'])->name('admin.questions.subtest.delete');

    //Admin Question Passage Management Routes
    Route::get('/admin/questions/passage', [AdminToeflController::class, 'getPassages'])->name('admin.questions.passage');
    Route::get('/admin/questions/passage/preview/{id}', [AdminToeflController::class, 'viewPassages'])->name('admin.questions.passage.view');
    Route::get('/admin/questions/passage/create', [AdminToeflController::class, 'createPassages'])->name('admin.questions.passage.create');
    Route::post('/admin/questions/passage/store', [AdminToeflController::class, 'storePassages'])->name('admin.questions.passage.store');
    Route::get('/admin/questions/passage/edit/{id}', [AdminToeflController::class, 'editPassages'])->name('admin.questions.passage.edit');
    Route::put('/admin/questions/passage/put/{id}', [AdminToeflController::class, 'updatePassages'])->name('admin.questions.passage.update');
    Route::delete('/admin/questions/passage/delete/{id}', [AdminToeflController::class, 'deletePassages'])->name('admin.questions.passage.delete');

    //Admin Test Attempts Management Routes
    Route::get('/admin/attempts', [AdminToeflController::class, 'getAttempts'])->name('admin.attempts');
    Route::get('/admin/attempts/toefl/{id}', [AdminToeflController::class, 'getToeflAttempts'])->name('admin.attempts.toefl');
    Route::get('/admin/attempts/toefl/{id}/{userId}', [AdminToeflController::class, 'viewUserAttempts'])->name('admin.attempts.toefl.view');
    Route::put('/admin/attempts/toefl/{id}/{userId}/{attempt}', [AdminToeflController::class, 'grade'])->name('admin.attempts.toefl.grade');
    Route::post('/admin/attempts/toefl/{attempt}', [AdminToeflController::class, 'gradeSystem'])->name('admin.attempts.gradeSystem');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

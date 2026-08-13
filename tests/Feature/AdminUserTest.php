<?php

use App\Http\Controllers\AdminUserController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('user profile can be updated without changing the password', function () {
    $user = User::factory()->create();
    $originalPassword = $user->password;

    $request = Request::create("/admin/users/update/{$user->id}", 'POST');
    $request->merge([
        'name' => 'Updated User',
        'email' => 'updated@example.com',
        'role' => 'user',
    ]);

    $response = app(AdminUserController::class)->update($request, $user);

    expect($response->getTargetUrl())->toBe(route('admin.users'));

    $user->refresh();

    expect($user->name)->toBe('Updated User')
        ->and($user->email)->toBe('updated@example.com')
        ->and($user->password)->toBe($originalPassword);
});

test('user password can be replaced during a profile update', function () {
    $user = User::factory()->create();

    $request = Request::create("/admin/users/update/{$user->id}", 'POST');
    $request->merge([
        'name' => $user->name,
        'email' => 'updated-password@example.com',
        'role' => 'user',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $response = app(AdminUserController::class)->update($request, $user);

    expect($response->getTargetUrl())->toBe(route('admin.users'));

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

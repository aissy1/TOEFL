<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function getUsers(Request $request)
    {
        $users = User::query()
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
        return Inertia::render('components/admin/users/index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('components/admin/users/form/create-users');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|in:admin,user',
            'password' => 'required|min:8|confirmed',
        ]);

        User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        return redirect()->route('admin.users.create');
    }

    public function edit(User $user)
    {
        return Inertia::render('components/admin/users/form/edit-users', [
            'user' => $user,
        ]);
    }

    /**
     * UPDATE 
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,user',
            'password' => 'nullable|min:8|confirmed',
        ]);

        if ($data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->route('admin.users');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->back()
            ->with('success', 'User deleted');
    }
}

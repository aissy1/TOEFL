<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrator',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'user@gmail.com'],
            [
                'name' => 'User',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        for ($i = 1; $i <= 32; $i++) {
            User::firstOrCreate(
                ['email' => "user{$i}@gmail.com"],
                [
                    'name' => "User {$i}",
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'role' => 'user',
                ]
            );
        }

        $this->command->info('✅ UserSeeder selesai:');
        $this->command->info('   • admin@gmail.com  | password: password | role: admin');
        $this->command->info('   • user@gmail.com   | password: password | role: user');
    }
}
<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@escaladmusicos.test'],
            [
                'name' => 'Administrador',
                'password' => 'password',
                'role' => UserRole::Admin,
            ]
        );
    }
}

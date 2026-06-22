<?php

namespace App\Policies;

use App\Models\Musician;
use App\Models\User;

class MusicianPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Musician $musician): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }

    public function update(User $user, Musician $musician): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }

    public function delete(User $user, Musician $musician): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }
}

<?php

namespace App\Policies;

use App\Models\Repertoire;
use App\Models\User;

class RepertoirePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Repertoire $repertoire): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }

    public function update(User $user, Repertoire $repertoire): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }

    public function delete(User $user, Repertoire $repertoire): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }
}

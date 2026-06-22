<?php

namespace App\Policies;

use App\Models\Scale;
use App\Models\User;

class ScalePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Scale $scale): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }

    public function update(User $user, Scale $scale): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }

    public function delete(User $user, Scale $scale): bool
    {
        return $user->isAdmin() || $user->isCoordenador();
    }

    public function confirm(User $user, Scale $scale): bool
    {
        if ($user->isAdmin() || $user->isCoordenador()) {
            return true;
        }

        return $user->musician !== null
            && $scale->musicians()->where('musicians.id', $user->musician->id)->exists();
    }
}

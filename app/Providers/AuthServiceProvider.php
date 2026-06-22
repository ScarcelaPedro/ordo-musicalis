<?php

namespace App\Providers;

use App\Models\Musician;
use App\Models\Repertoire;
use App\Models\Scale;
use App\Models\Team;
use App\Policies\MusicianPolicy;
use App\Policies\RepertoirePolicy;
use App\Policies\ScalePolicy;
use App\Policies\TeamPolicy;
// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Musician::class => MusicianPolicy::class,
        Scale::class => ScalePolicy::class,
        Repertoire::class => RepertoirePolicy::class,
        Team::class => TeamPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}

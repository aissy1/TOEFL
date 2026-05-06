<?php

namespace App\Providers;

use App\Models\Passage;
use App\Models\EssayAnswer;
use App\Observers\EssayAnswerObserver;
use App\Observers\PassageObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Observer Passage 
        Passage::observe(PassageObserver::class);

        // Observer EssayAnswer
        EssayAnswer::observe(EssayAnswerObserver::class);
    }
}

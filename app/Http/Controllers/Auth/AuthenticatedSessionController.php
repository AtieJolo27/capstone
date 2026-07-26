<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the admin sign-in page.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Authenticate an existing admin account.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        $user = User::query()
            ->where('email', $request->string('email')->toString())
            ->first();

        if (! $user instanceof User || ! $this->passwordMatches($user, $request->string('password')->toString())) {
            RateLimiter::hit($request->throttleKey(), 60);

            throw ValidationException::withMessages([
                'email' => 'The provided credentials do not match an administrator account.',
            ]);
        }

        RateLimiter::clear($request->throttleKey());
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * End the current admin session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login')->with('success', 'You have been signed out.');
    }

    /**
     * Check the submitted password and upgrade a legacy clear-text value after a successful sign-in.
     */
    private function passwordMatches(User $user, string $password): bool
    {
        $storedPassword = $user->getAuthPassword();

        if ($storedPassword === '') {
            return false;
        }

        if (Hash::isHashed($storedPassword)) {
            return Hash::check($password, $storedPassword);
        }

        if (! hash_equals($storedPassword, $password)) {
            return false;
        }

        $user->forceFill([
            'password' => Hash::make($password),
        ])->save();

        return true;
    }
}

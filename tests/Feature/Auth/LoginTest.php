<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class LoginTest extends TestCase
{
    public function test_guests_can_view_the_admin_login_page(): void
    {
        $this->get('/login')->assertOk();
    }

    public function test_guests_are_redirected_to_login_before_accessing_the_admin_panel(): void
    {
        $this->get('/')->assertRedirect(route('login'));
    }
}

<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_all_four_websites_and_hub_render_successfully(): void
    {
        // 1. Platform Hub
        $this->get('/')->assertStatus(200);

        // 2. Customer Portal
        $this->get('/customer')->assertStatus(200);

        // 3. Merchant Portal
        $this->get('/merchant')->assertStatus(200);

        // 4. Courier Portal
        $this->get('/courier')->assertStatus(200);

        // 5. Admin Portal
        $this->get('/admin')->assertStatus(200);
    }

    public function test_localization_assets_and_switchers_are_present(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('/js/i18n.js');
        $response->assertSee('langToggleBtn');
        $response->assertSee('Cairo');

        $this->assertFileExists(public_path('js/i18n.js'));
        $i18nContent = file_get_contents(public_path('js/i18n.js'));
        $this->assertStringContainsString('en:', $i18nContent);
        $this->assertStringContainsString('ar:', $i18nContent);
        $this->assertStringContainsString('Cairo', file_get_contents(resource_path('views/layouts/portal.blade.php')));
    }
}

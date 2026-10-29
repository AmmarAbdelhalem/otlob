<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_backend_api_root_and_documentation_endpoints(): void
    {
        // 1. Root API service discovery endpoint
        $response = $this->getJson('/');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'operational')
            ->assertJsonStructure([
                'name',
                'version',
                'status',
                'documentation_ui',
                'endpoints' => [
                    'api_root',
                    'health_check',
                    'openapi_spec',
                    'postman_collection',
                ],
            ]);

        // 2. Base API status endpoint
        $apiResponse = $this->getJson('/api');
        $apiResponse->assertStatus(200)
            ->assertJsonPath('status', 'operational');

        // 3. Framework health check endpoint
        $healthResponse = $this->get('/up');
        $healthResponse->assertStatus(200);

        // 4. Interactive Swagger UI HTML page at /docs
        $docsUiResponse = $this->get('/docs');
        $docsUiResponse->assertStatus(200)
            ->assertSee('swagger-ui')
            ->assertSee('SwaggerUIBundle')
            ->assertSee('/docs/openapi.json');

        // 5. OpenAPI JSON specification endpoint directly
        $docsJsonResponse = $this->get('/docs/openapi.json');
        $docsJsonResponse->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json; charset=UTF-8');

        // 6. Documentation redirect from /api/documentation
        $this->get('/api/documentation')->assertRedirect('/docs');

        // 7. Verify specifications and collections are valid JSON
        $this->assertFileExists(public_path('docs/openapi.json'));
        $this->assertFileExists(public_path('docs/otlob_postman_collection.json'));

        $openapiData = json_decode(file_get_contents(public_path('docs/openapi.json')), true);
        $this->assertIsArray($openapiData);
        $this->assertEquals('3.1.0', $openapiData['openapi']);

        $postmanData = json_decode(file_get_contents(public_path('docs/otlob_postman_collection.json')), true);
        $this->assertIsArray($postmanData);
        $this->assertArrayHasKey('item', $postmanData);
    }
}

<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_map(function ($origin) {
        if ($origin && !str_starts_with($origin, 'http://') && !str_starts_with($origin, 'https://')) {
            return 'https://' . $origin;
        }
        return $origin;
    }, [env('FRONTEND_URL', 'http://localhost:5173')]),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];

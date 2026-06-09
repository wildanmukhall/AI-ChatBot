<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Exceptions\BusinessRuleException;
use App\Exceptions\ExternalApiException;
use App\Support\ApiResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Terapkan ForceJsonResponse pada semua request API
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render JSON untuk semua request API
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Handle BusinessRuleException
        $exceptions->renderable(function (BusinessRuleException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    $e->getMessage(),
                    null,
                    $e->getStatusCode()
                );
            }
        });

        // Handle ExternalApiException
        $exceptions->renderable(function (ExternalApiException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                logger()->error('External API Error', [
                    'service' => $e->getServiceName(),
                    'message' => $e->getMessage(),
                ]);

                return ApiResponse::error(
                    $e->getMessage(),
                    ['service' => $e->getServiceName()],
                    $e->getStatusCode()
                );
            }
        });

        // Handle ValidationException
        $exceptions->renderable(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::validationError(
                    $e->errors(),
                    'Validasi gagal.'
                );
            }
        });

        // Handle AuthenticationException
        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::unauthorized('Silakan login terlebih dahulu.');
            }
        });

        // Handle ModelNotFoundException
        $exceptions->renderable(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::notFound('Data tidak ditemukan.');
            }
        });

        // Handle NotFoundHttpException (404 route)
        $exceptions->renderable(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::notFound('Endpoint tidak ditemukan.');
            }
        });

        // Handle ThrottleRequestsException (rate limit)
        $exceptions->renderable(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    'Terlalu banyak request. Silakan coba lagi nanti.',
                    null,
                    429
                );
            }
        });
    })->create();

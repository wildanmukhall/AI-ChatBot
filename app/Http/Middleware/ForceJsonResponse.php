<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ForceJsonResponse Middleware
 *
 * Memastikan semua request API selalu menerima
 * response dalam format JSON, termasuk saat terjadi
 * error validasi atau unauthenticated.
 */
class ForceJsonResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}

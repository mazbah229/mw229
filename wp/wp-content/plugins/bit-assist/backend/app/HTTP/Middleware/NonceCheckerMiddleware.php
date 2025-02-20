<?php

namespace BitApps\Assist\HTTP\Middleware;

use BitApps\Assist\Deps\BitApps\WPKit\Http\Response;
use BitApps\Assist\Deps\BitApps\WPKit\Http\Request\Request;

final class NonceCheckerMiddleware
{
    public function handle(Request $request, ...$params)
    {
        if (!$request->has('_ajax_nonce') || !wp_verify_nonce(sanitize_key($request->_ajax_nonce), 'bit_assist_nonce')) {
            return Response::error('Invalid token')->httpStatus(411);
        }

        return true;
    }
}

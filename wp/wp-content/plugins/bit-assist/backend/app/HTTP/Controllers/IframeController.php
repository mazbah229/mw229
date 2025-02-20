<?php

namespace BitApps\Assist\HTTP\Controllers;

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPKit\Http\Request\Request;

final class IframeController
{
    public function iframe(Request $request)
    {
        if (empty($request->clientDomain)) {
            status_header(422);
            exit();
        }

        $urlParts = explode('-protocol-bit-assist-', $request->clientDomain);
        $protocol = $urlParts[0] === 'i' ? 'http://' : 'https://';
        $domain = $urlParts[1];
        $clientDomain = $protocol . $domain;

        $version = Config::VERSION;
        $assetBase = Config::get('ROOT_URI') . '/iframe';
        $frameAncestor = Config::get('SITE_URL');
        if ($clientDomain !== $frameAncestor) {
            $frameAncestor .= ' ' . $clientDomain;
        }

        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bit Assist Widget</title>
        <script crossorigin src="{$assetBase}/assets/index.js?ver={$version}"></script>
        <link rel="stylesheet" href="{$assetBase}/assets/index.css?ver={$version}">
    </head>
    <body>
        <div id="widgetWrapper" class="hide">
            <div id="contentWrapper" class="hide"></div>
            <div id="widgetBubbleRow">
                <div id="widgetBubbleWrapper">
                    <button id="widgetBubble"><img alt="Widget Icon" id="widget-img" /></button>
                    <span id="credit"><a href="https://www.bitapps.pro/bit-assist" rel="nofollow noreferrer noopener" target="_blank">by Bit Assist</a></span>
                </div>
            </div>
        </div>
    </body>
</html>
HTML;

        status_header(200);
        header('Content-Type: text/html');
        header('Content-Security-Policy: frame-ancestors ' . $frameAncestor);
        exit();
    }
}

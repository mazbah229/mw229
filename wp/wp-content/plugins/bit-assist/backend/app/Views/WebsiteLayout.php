<?php

namespace BitApps\Assist\Views;

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPKit\Hooks\Hooks;

class WebsiteLayout
{
    public function __construct()
    {
        Hooks::addAction('wp_enqueue_scripts', [$this, 'head'], 0);
        Hooks::addFilter('script_loader_tag', [$this, 'scriptTagFilter'], 0, 3);
    }

    /**
     * Load the asset libraries.
     *
     * @param string $currentScreen $top_level_page variable for current page
     */
    public function head($currentScreen)
    {
        $slug = Config::SLUG;
        $version = Config::VERSION;
        $rootURL = Config::get('ROOT_URI');

        if (Config::isDev()) {
            wp_enqueue_script($slug . '-widget-script-JAVASCRIPT-ASYNC', $rootURL . '/widget-iframe/bit-assist.js', [], $version, true);
        } else {
            wp_enqueue_script($slug . '-widget-script-JAVASCRIPT-ASYNC', $rootURL . '/iframe/bit-assist.js', [], $version, true);
        }

        wp_localize_script($slug . '-widget-script-JAVASCRIPT-ASYNC', Config::VAR_PREFIX, [
            'api'   => Config::get('API_URL'),
            'isDev' => Config::isDev(),
        ]);
    }

    /**
     * Modify script tags.
     *
     * @param string $html   script tag
     * @param mixed  $handle
     * @param mixed  $href
     *
     * @return string new script tag
     */
    public function scriptTagFilter($html, $handle, $href)
    {
        $slug = Config::SLUG;
        $newTag = $html;

        if (strpos($handle, 'ASYNC') !== false && strpos($handle, $slug) !== false) {
            $newTag = preg_replace('/<script /', '<script async ', $newTag);
        }
        if (strpos($handle, 'JAVASCRIPT') !== false && strpos($handle, $slug) !== false) {
            $newTag = preg_replace('/<script /', '<script type="text/javascript" ', $newTag);
        }

        return $newTag;
    }
}

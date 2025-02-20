<?php

namespace BitApps\Assist\HTTP\Controllers;

use BitApps\Assist\Deps\BitApps\WPKit\Http\Response;

class WPPostController
{
    public function getPostTypes()
    {
        $wpPostTypes = get_post_types(['public' => true], 'objects');

        $postTypes = [];

        foreach ($wpPostTypes as $wpPostType) {
            $postTypes[] = [
                'name'  => $wpPostType->name,
                'label' => $wpPostType->label,
            ];
        }

        return Response::success($postTypes);
    }
}

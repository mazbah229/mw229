<?php

namespace BitApps\Assist\HTTP\Requests;

use BitApps\Assist\Deps\BitApps\WPKit\Http\Request\Request;

class WidgetChannelStoreRequest extends Request
{
    public function rules()
    {
        return [
            'widget_id'    => ['required'],
            'channel_name' => ['required'],
            'config'       => ['required'],
            'sequence'     => ['nullable'],
        ];
    }
}

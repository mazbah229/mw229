<?php

namespace BitApps\Assist\HTTP\Requests;

use BitApps\Assist\Deps\BitApps\WPKit\Http\Request\Request;

class WidgetUpdateRequest extends Request
{
    public function rules()
    {
        return [
            'name'                 => ['required', 'string', 'max:255', 'sanitize:text'],
            'styles'               => ['nullable'],
            'domains.*'            => ['nullable', 'string', 'max:255', 'sanitize:text'],
            'business_hours'       => ['nullable', 'array'],
            'timezone'             => ['nullable', 'string', 'max:255', 'sanitize:text'],
            'exclude_pages'        => ['nullable', 'array'],
            'initial_delay'        => ['required', 'integer'],
            'page_scroll'          => ['required', 'integer'],
            'widget_behavior'      => ['required', 'integer'],
            'custom_css'           => ['nullable', 'string', 'sanitize:textarea'],
            'call_to_action.delay' => ['nullable', 'integer'],
            'call_to_action.text'  => ['nullable', 'string', 'sanitize:textarea'],
            'store_responses'      => ['required'],
            'delete_responses'     => ['nullable'],
            'integrations'         => ['nullable', 'array'],
            'status'               => ['required', 'boolean'],
        ];
    }
}

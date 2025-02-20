<?php

namespace BitApps\Assist\Model;

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPDatabase\Model;

class Widget extends Model
{
    protected $prefix = Config::VAR_PREFIX;
    
    protected $casts = [
        'styles'           => 'object',
        'call_to_action'   => 'object',
        'delete_responses' => 'object',
        'domains'          => 'array',
        'business_hours'   => 'array',
        'exclude_pages'    => 'array',
        'integrations'     => 'array',
        'status'           => 'int',
        'active'           => 'int',
        'hide_credit'      => 'int',
        'widget_behavior'  => 'int',
        'initial_delay'    => 'int',
        'page_scroll'      => 'int',
    ];

    protected $fillable = [
        'name',
        'styles',
        'domains',
        'business_hours',
        'timezone',
        'exclude_pages',
        'initial_delay',
        'page_scroll',
        'widget_behavior',
        'custom_css',
        'call_to_action',
        'store_responses',
        'delete_responses',
        'integrations',
        'status',
        'active',
        'hide_credit',
    ];

    public function widgetChannels()
    {
        return $this->hasMany(WidgetChannel::class, 'widget_id', 'id');
    }
}

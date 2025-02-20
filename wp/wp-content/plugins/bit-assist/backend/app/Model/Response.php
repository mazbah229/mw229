<?php

namespace BitApps\Assist\Model;

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPDatabase\Model;

/**
 * Undocumented class
 */
class Response extends Model
{
    protected $prefix = Config::VAR_PREFIX;

    protected $casts = [
        'response' => 'object'
    ];

    protected $fillable = [
        'widget_channel_id',
        'response',
    ];

    public function widgetChannel()
    {
        return $this->belongsTo(WidgetChannel::class);
    }
}

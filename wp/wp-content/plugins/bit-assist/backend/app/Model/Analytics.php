<?php

namespace BitApps\Assist\Model;

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPDatabase\Model;

class Analytics extends Model
{
    protected $prefix = Config::VAR_PREFIX;

    protected $table = 'analytics';

    protected $casts = [
        'id'        => 'int',
        'widget_id' => 'int',
        // 'channel_id' => 'int',
        'is_clicked' => 'int',
    ];

    protected $fillable = [
        'widget_id',
        'channel_id',
        'is_clicked',
    ];

    public function widget()
    {
        return $this->belongsTo(Widget::class, 'id', 'widget_id');
    }

    public function channel()
    {
        return $this->belongsTo(WidgetChannel::class, 'id', 'channel_id');
    }
}

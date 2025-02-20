<?php

namespace BitApps\Assist\HTTP\Controllers;

use BitApps\Assist\Model\WidgetChannel;

final class BitAssistAnalyticsController
{
    public function filterTrackingData($additional_data)
    {
        $channelData = WidgetChannel::get(['channel_name', 'status']);

        $additional_data['channels'] = json_decode(wp_json_encode($channelData));

        return $additional_data;
    }
}

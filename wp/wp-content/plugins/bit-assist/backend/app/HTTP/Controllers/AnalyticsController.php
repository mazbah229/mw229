<?php

namespace BitApps\Assist\HTTP\Controllers;

use AllowDynamicProperties;
use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Assist\Deps\BitApps\WPKit\Http\Response;
use BitApps\Assist\Model\Analytics;

#[AllowDynamicProperties]
final class AnalyticsController
{
    public function isAnalyticsActive()
    {
        $analyticsOption = Config::getOption('analytics_activate');

        return $analyticsOption ? (int)$analyticsOption : 0;
    }

    public function store(Request $request)
    {
        $validated = [
            'widget_id'  => $request->widget_id,
            'is_clicked' => $request->is_clicked,
        ];

        if ($request->channel_id) {
            $validated['channel_id'] = $request->channel_id;
        }

        Analytics::insert((array)$request->all());

        return 'success';
    }

    public function toggleAnalytics(Request $request)
    {
        Config::updateOption('analytics_activate', $request->widget_analytics);

        $analyticsOption = Config::getOption('analytics_activate');

        return ['widget_analytics' => (int)$analyticsOption];
    }

    public function getWidgetAnalytics($filterValue)
    {
        global $wpdb;

        $datePattern = '/\d{4}-\d{2}-\d{2}/';
        $isDate = preg_match($datePattern, $filterValue) === 1;

        $startDate = date('Y-m-d');
        $endDate = date('Y-m-d');
        $dateRange = [];

        if ($isDate) {
            $dateRange = explode(',', $filterValue);
        }

        $placeHolder = [0, 1, 0, 1, 1, 0, 0, 1];

        $dateCondition = '';
        if ($filterValue === '7days') {
            $dateCondition = 'DATE(analytics.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } elseif ($filterValue === '30days') {
            $dateCondition = 'DATE(analytics.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        } elseif ($filterValue === 'today') {
            $dateCondition = 'DATE(analytics.created_at) = CURDATE()';
        } elseif ($isDate && isset($dateRange[0]) && isset($dateRange[1])) {
            $startDate = $dateRange[0];
            $endDate = $dateRange[1];
            $placeHolder[] = $startDate;
            $placeHolder[] = $endDate;
            $dateCondition = 'DATE(analytics.created_at) BETWEEN %s AND %s';
        } elseif ($isDate && count($dateRange) !== 2) {
            $startDate = $dateRange[0];
            $placeHolder[] = $startDate;
            $dateCondition = 'DATE(analytics.created_at) = %s';
        } else {
            $dateCondition = 'DATE(analytics.created_at) IS NOT NULL';
        }

        $sql = $wpdb->prepare(
            "SELECT
                    analytics.widget_id, widgets.name,
                    SUM(CASE WHEN analytics.is_clicked = %d THEN %d ELSE %d END) AS visitor_count,
                    SUM(CASE WHEN analytics.is_clicked = %d THEN %d ELSE %d END) AS click_count
                    FROM 
                        {$wpdb->prefix}bit_assist_analytics analytics
                    INNER JOIN 
                        {$wpdb->prefix}bit_assist_widgets widgets ON analytics.widget_id = widgets.id
                    WHERE 
                        (analytics.channel_id IS NULL AND (analytics.is_clicked = %d OR analytics.is_clicked = %d))
                    AND
                        $dateCondition
                    GROUP BY 
                        analytics.widget_id, widgets.name",
            $placeHolder
        );

        $widgetAnalyticsData = $wpdb->get_results($sql);

        return ['data' => $widgetAnalyticsData];
    }

    public function getChannelAnalytics(Request $request)
    {
        global $wpdb;

        $widget_id = $request->widget_id;
        $filterValue = $request->filter;
        $datePattern = '/\d{4}-\d{2}-\d{2}/';
        $isDate = is_array($filterValue) ? preg_match($datePattern, $filterValue[0]) === 1 : false;

        $startDate = date('Y-m-d');
        $endDate = date('Y-m-d');

        $placeHolder = [1, 0, 1, 0, $widget_id, 1];

        $dateCondition = '';
        if ($filterValue === '7days') {
            $dateCondition = 'DATE(analytics.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } elseif ($filterValue === '30days') {
            $dateCondition = 'DATE(analytics.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        } elseif ($filterValue === 'today') {
            $dateCondition = 'DATE(analytics.created_at) = CURDATE()';
        } elseif ($isDate && isset($filterValue[0]) && isset($filterValue[1])) {
            $startDate = $filterValue[0];
            $endDate = $filterValue[1];
            $placeHolder[] = $startDate;
            $placeHolder[] = $endDate;
            $dateCondition = 'DATE(analytics.created_at) BETWEEN %s AND %s';
        } elseif ($isDate && count($filterValue) !== 2) {
            $startDate = $filterValue[0];
            $placeHolder[] = $startDate;
            $dateCondition = 'DATE(analytics.created_at) = %s';
        } else {
            $dateCondition = 'DATE(analytics.created_at) IS NOT NULL';
        }

        $sql = $wpdb->prepare(
            "SELECT
                c.id AS channel_id,
                JSON_UNQUOTE(JSON_EXTRACT(c.config, '$.title')) AS title,
                SUM(CASE WHEN analytics.channel_id IS NULL AND analytics.created_at >= c.created_at THEN %d ELSE %d END) AS visitor_count,
                SUM(CASE WHEN analytics.channel_id = c.id THEN %d ELSE %d END) AS click_count
                FROM
                    {$wpdb->prefix}bit_assist_widget_channels AS c
                LEFT JOIN
                    {$wpdb->prefix}bit_assist_analytics AS analytics
                ON
                    c.widget_id = analytics.widget_id
                WHERE
                    c.widget_id = %d
                AND
                    analytics.is_clicked = %d
                AND
                    $dateCondition
                GROUP BY
                    c.id",
            $placeHolder
        );

        $results = $wpdb->get_results($sql);

        return ['data' => $results];
    }

    public function destroy()
    {
        Analytics::delete();
        return Response::success('Analytics removed!');
    }
}

<?php

namespace BitApps\Assist\HTTP\Controllers;

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Assist\Deps\BitApps\WPKit\Http\Response;
use BitApps\Assist\HTTP\Requests\WidgetStoreRequest;
use BitApps\Assist\HTTP\Requests\WidgetUpdateRequest;
use BitApps\Assist\Model\Widget;
use BitApps\Assist\Model\WidgetChannel;
use BitApps\AssistPro\Config as ProConfig;

final class WidgetController
{
    public function index()
    {
        return Widget::get(['id', 'name', 'status', 'active', 'created_at']);
    }

    public function show(Widget $widget)
    {
        if ($widget->exists()) {
            return $widget;
        }

        return Response::error($widget);
    }

    public function store(WidgetStoreRequest $request)
    {
        $isPro = class_exists(ProConfig::class) && ProConfig::isPro();
        if (!$isPro && Widget::count() >= 1) {
            return Response::error('You can use 1 widget in free version.');
        }

        $newWidget = [
            'name'   => sanitize_text_field(trim($request->name)),
            'styles' => [
                'size'             => 60,
                'shape'            => 'semiRounded',
                'color'            => $request->color,
                'icon'             => 'widget-icon-1',
                'iconUrl'          => Config::get('ROOT_URI') . '/img/widget/widgetIcon1.svg',
                'position'         => 'bottom-right',
                'top'              => 10,
                'bottom'           => 10,
                'left'             => 10,
                'right'            => 10,
                'badge_active'     => 0,
                'badge_color'      => ['b' => 0, 'g' => 220, 'h' => 120, 'hex' => '00dc00', 'r' => 0, 's' => 100, 'str' => '#00dc00', 'v' => 86],
                'animation_active' => 0,
                'animation_type'   => 1,
                'widget_show_on'   => ['desktop', 'mobile'],
                'widget_style'     => 'widget_transparent',
                'google_analytics' => 0,
            ],
            'hide_credit' => 1
        ];

        $activeWidget = Config::getOption('widget_active');
        if (empty($activeWidget)) {
            $newWidget['active'] = 1;
        }

        $widget = Widget::insert($newWidget);
        if (isset($widget->id) && empty($activeWidget)) {
            Config::updateOption('widget_active', $widget->id);
        }

        return Response::success('Widget created successfully');
    }

    public function update(WidgetUpdateRequest $request, Widget $widget)
    {
        $request->name = sanitize_text_field(trim($request->name));

        $widget->update($request->validated());

        if ($widget->save()) {
            return Response::success('Widget updated');
        }

        return Response::error('Widget update failed');
    }

    public function destroy(Widget $widget)
    {
        $widget->delete();

        if (Config::getOption('widget_active') == $widget->id) {
            Config::updateOption('widget_active', null);
        }

        return Response::success('Widget deleted');
    }

    public function changeStatus(Request $request, Widget $widget)
    {
        $widget->update(['status' => $request->status]);

        if ($widget->save()) {
            if ($widget->active) {
                Config::updateOption('widget_active', ($request->status ? $widget->id : null));
            }

            return Response::success('Widget status changed');
        }

        return Response::error('Widget status not changed');
    }

    public function copy(Widget $widget)
    {
        $isPro = class_exists(ProConfig::class) && ProConfig::isPro();
        if (!$isPro && Widget::count() >= 1) {
            return Response::error('You can use 1 widget in free version.');
        }

        if ($widget->exists()) {
            $newWidget = $this->replicateWidget($widget);
            $result = Widget::insert((array) $newWidget);

            if ($result) {
                $widget->with('widgetChannels');
                $this->copyAllChannels($widget->widgetChannels, $result->id);

                return Response::success('Widget copied successfully');
            }
        }

        return Response::error('Something went wrong');
    }

    private function copyAllChannels($widgetChannels, $widgetId)
    {
        $maxSequence = WidgetChannel::where('widget_id', $widgetId)->max('sequence');
        foreach ($widgetChannels as $widgetChannel) {
            $newWidgetChannel = $this->replicateWidgetChannel($widgetChannel, $widgetId, $maxSequence);
            WidgetChannel::insert((array) $newWidgetChannel);
            ++$maxSequence;
        }
    }

    private function replicateWidget($widget)
    {
        $newWidget = (object) [];
        $newWidget->name = $widget->name . ' (copy)';
        $newWidget->styles = $widget->styles;
        $newWidget->business_hours = $widget->business_hours;
        $newWidget->timezone = $widget->timezone;
        $newWidget->exclude_pages = $widget->exclude_pages;
        $newWidget->initial_delay = $widget->initial_delay;
        $newWidget->page_scroll = $widget->page_scroll;
        $newWidget->widget_behavior = $widget->widget_behavior;
        $newWidget->custom_css = $widget->custom_css;
        $newWidget->call_to_action = $widget->call_to_action;
        $newWidget->store_responses = $widget->store_responses;
        $newWidget->delete_responses = $widget->delete_responses;
        $newWidget->status = $widget->status;

        return $newWidget;
    }

    private function replicateWidgetChannel($widgetChannel, $widgetId, $maxSequence)
    {
        $newWidgetChannel = (object) [];
        $newWidgetChannel->widget_id = $widgetId;
        $newWidgetChannel->channel_name = $widgetChannel->channel_name;
        $newWidgetChannel->config = $widgetChannel->config;
        $newWidgetChannel->sequence = $maxSequence + 1;
        $newWidgetChannel->status = $widgetChannel->status;

        return $newWidgetChannel;
    }
}

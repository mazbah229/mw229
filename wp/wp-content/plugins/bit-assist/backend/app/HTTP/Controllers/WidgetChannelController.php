<?php

namespace BitApps\Assist\HTTP\Controllers;

use BitApps\Assist\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Assist\Deps\BitApps\WPKit\Http\Response;
use BitApps\Assist\HTTP\Requests\WidgetChannelStoreRequest;
use BitApps\Assist\HTTP\Requests\WidgetChannelUpdateRequest;
use BitApps\Assist\Model\WidgetChannel;
use BitApps\AssistPro\Config as ProConfig;
use stdClass;

final class WidgetChannelController
{
    public function index(Request $request)
    {
        $widgetChannels = WidgetChannel::where('widget_id', $request->widgetId)->orderBy('sequence')->get();

        foreach ($widgetChannels as $channel) {
            $widgetChannel = $this->escapeAll($channel);
        }

        return $widgetChannels;
    }

    public function show(WidgetChannel $widgetChannel)
    {
        if ($widgetChannel->exists()) {
            return $this->escapeAll($widgetChannel);
        }

        return Response::error($widgetChannel);
    }

    public function store(WidgetChannelStoreRequest $request)
    {
        $validated = $this->sanitizeRequest($request->all());

        $isPro = class_exists(ProConfig::class) && ProConfig::isPro();

        if (!$isPro && !empty($validated['config']['hide_after_office_hours'])) {
            unset($validated['config']['hide_after_office_hours']);
        }
        if (!$isPro && $validated['channel_name'] === 'Custom-Form' && !empty($validated['config']['card_config']['webhook_url'])) {
            unset($validated['config']['card_config']['webhook_url']);
        }

        $result = WidgetChannel::insert($validated);

        if ($result) {
            return Response::success('Channel created successfully');
        }

        return Response::error('Something went wrong');
    }

    public function update(WidgetChannelUpdateRequest $request, WidgetChannel $widgetChannel)
    {
        $validated = $this->sanitizeRequest($request->all());

        $isPro = class_exists(ProConfig::class) && ProConfig::isPro();

        if (!$isPro && !empty($validated['config']['hide_after_office_hours'])) {
            unset($validated['config']['hide_after_office_hours']);
        }
        if (!$isPro && $validated['channel_name'] === 'Custom-Form' && !empty($validated['config']['card_config']['webhook_url'])) {
            unset($validated['config']['card_config']['webhook_url']);
        }

        $widgetChannel->update($validated);

        if ($widgetChannel->save()) {
            return Response::success('Channel updated successfully');
        }

        return Response::error('Something went wrong');
    }

    public function destroy(WidgetChannel $widgetChannel)
    {
        $widgetChannel->delete();

        return Response::success('Channel deleted');
    }

    public function updateSequence(Request $request)
    {
        foreach ($request->widgetChannels as $widgetChannel) {
            WidgetChannel::take(1)->find($widgetChannel['id'])
                ->update(['sequence' => $widgetChannel['sequence']])
                ->save();
        }

        return Response::success('Sequence ordered');
    }

    public function copy(WidgetChannel $widgetChannel)
    {
        $isPro = class_exists(ProConfig::class) && ProConfig::isPro();
        if (!$isPro && WidgetChannel::where('widget_id', $widgetChannel->widget_id)->count() >= 2) {
            return Response::error('You can use 2 channel in free version.');
        }

        if ($widgetChannel->exists()) {
            $newWidgetChannel = $this->replicate($widgetChannel);
            $result = WidgetChannel::insert((array) $newWidgetChannel);
            if ($result) {
                return Response::success('Channel copied successfully');
            }
        }

        return Response::error('Something went wrong');
    }

    private function replicate($widgetChannel)
    {
        $newWidgetChannel = (object) [];
        $newWidgetChannel->widget_id = $widgetChannel->widget_id;
        $newWidgetChannel->channel_name = $widgetChannel->channel_name;
        $newWidgetChannel->config = $widgetChannel->config;
        $newWidgetChannel->config->title = $widgetChannel->config->title . ' (Copy)';
        $newWidgetChannel->sequence = WidgetChannel::where('widget_id', $widgetChannel->widget_id)->max('sequence') + 1;
        $newWidgetChannel->status = $widgetChannel->status;

        return $newWidgetChannel;
    }

    private function sanitizeRequest($channelDetails)
    {
        $validated = $this->sanitizeChannelTitle($channelDetails);

        if ($validated['channel_name'] === 'Google-Map') {
            return $this->sanitizeIframe($validated);
        } elseif ($validated['channel_name'] === 'Custom-Channel') {
            return $this->sanitizeUrl($validated);
        } elseif ($validated['channel_name'] === 'Custom-Iframe') {
            return $this->sanitizeUrl($validated);
        } elseif ($validated['channel_name'] === 'FAQ' || $validated['channel_name'] === 'Knowledge-Base') {
            return $this->sanitizeFieldTitle($validated, $validated['channel_name']);
        }

        return $validated;
    }

    private function sanitizeIframe($validated)
    {
        $allowedAttributes = [
            'iframe' => [
                'src'             => [],
                'width'           => [],
                'height'          => [],
                'style'           => [],
                'allowfullscreen' => [],
                'loading'         => [],
                'referrerpolicy'  => [],
            ],
        ];

        if (\is_object($validated)) {
            $validated->config->unique_id = wp_kses($validated->config->unique_id, $allowedAttributes);
        } else {
            $validated['config']['unique_id'] = wp_kses($validated['config']['unique_id'], $allowedAttributes);
        }

        return $validated;
    }

    private function sanitizeUrl($validated)
    {
        $validated['config']['unique_id'] = sanitize_url($validated['config']['unique_id']);
        $validated['config']['url'] = sanitize_url($validated['config']['url']);

        return $validated;
    }

    private function sanitizeChannelTitle($validated)
    {
        $validated['config']['title'] = sanitize_text_field($validated['config']['title']);
        return $validated;
    }

    private function sanitizeFieldTitle($validated, $channelName)
    {
        $faqs = [];
        $kbs = [];

        if ($channelName === 'FAQ') {
            $faqs = &$validated['config']['card_config']['faqs'];

            foreach ($faqs as &$faq) {
                if (isset($faq['title'])) {
                    $faq['title'] = sanitize_text_field($faq['title']);
                }
            }
        } else {
            $kbs = &$validated['config']['card_config']['knowledge_bases'];

            foreach ($kbs as &$kb) {
                if (isset($kb['title'])) {
                    $kb['title'] = sanitize_text_field($kb['title']);
                }
            }
        }

        return $validated;
    }

    private function escapeAll($channel)
    {
        if ($channel->channel_name === 'Custom-Channel') {
            $channel->config->unique_id = esc_url_raw($channel->config->unique_id);
            $channel->config->url = esc_url_raw($channel->config->url);
        }

        if ($channel->channel_name === 'Google-Map') {
            $channel = $this->sanitizeIframe($channel);
        }

        if ($channel->channel_name === 'Custom-Iframe') {
            $channel->config->unique_id = esc_url_raw($channel->config->unique_id);
            $channel->config->url = esc_url_raw($channel->config->url);
        }

        if ($channel->channel_name === 'FAQ' || $channel->channel_name === 'Knowledge-Base') {
            $channel = $this->escapeTitle($channel);
        }

        return $channel;
    }

    private function escapeTitle($channel)
    {
        $channel->config->title = esc_html($channel->config->title);

        $faqs = new stdClass();
        $kbs = new stdClass();

        if ($channel->channel_name === 'FAQ') {
            $faqs = &$channel->config->card_config->faqs;

            foreach ($faqs as &$faq) {
                if (isset($faq->title)) {
                    $faq->title = esc_html($faq->title);
                }
            }
        } else {
            $kbs = &$channel->config->card_config->knowledge_bases;

            foreach ($kbs as &$kb) {
                if (isset($kb->title)) {
                    $kb->title = esc_html($kb->title);
                }
            }
        }

        return $channel;
    }
}

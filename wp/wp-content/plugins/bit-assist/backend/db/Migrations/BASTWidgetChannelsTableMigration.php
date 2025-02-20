<?php

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Assist\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Assist\Deps\BitApps\WPDatabase\Schema;

if (!\defined('ABSPATH')) {
    exit;
}

final class BASTWidgetChannelsTableMigration extends Migration
{
    public function up()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->create('widget_channels', function (Blueprint $table) {
            $table->id();
            $table->bigint('widget_id', 20)->unsigned()->foreign('widgets', 'id')->onDelete()->cascade();
            $table->string('channel_name');
            $table->longtext('config')->nullable();
            $table->integer('sequence')->nullable();
            $table->boolean('status')->defaultValue(1);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->drop('widget_channels');
    }
}

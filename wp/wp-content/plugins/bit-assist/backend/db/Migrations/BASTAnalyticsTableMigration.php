<?php

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Assist\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Assist\Deps\BitApps\WPDatabase\Schema;

if (!\defined('ABSPATH')) {
    exit;
}

final class BASTAnalyticsTableMigration extends Migration
{
    public function up()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->create('analytics', function (Blueprint $table) {
            $table->bigint('widget_id', 20)->unsigned()->foreign('widgets', 'id')->onDelete()->cascade();
            $table->bigint('channel_id', 20)->nullable()->unsigned()->foreign('widget_channels', 'id')->onDelete()->cascade();
            $table->tinyint('is_clicked')->defaultValue(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->drop('analytics');
    }
}

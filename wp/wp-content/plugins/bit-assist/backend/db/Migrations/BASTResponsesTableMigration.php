<?php

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Assist\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Assist\Deps\BitApps\WPDatabase\Schema;

if (!\defined('ABSPATH')) {
    exit;
}

final class BASTResponsesTableMigration extends Migration
{
    public function up()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->create('responses', function (Blueprint $table) {
            $table->id();
            $table->bigint('widget_channel_id', 20)->unsigned()->foreign('widget_channels', 'id')->onDelete()->cascade();
            $table->longtext('response');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->drop('responses');
    }
}

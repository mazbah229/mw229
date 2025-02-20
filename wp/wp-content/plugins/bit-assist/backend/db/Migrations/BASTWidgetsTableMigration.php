<?php

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPDatabase\Blueprint;
use BitApps\Assist\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Assist\Deps\BitApps\WPDatabase\Schema;

if (!\defined('ABSPATH')) {
    exit;
}

final class BASTWidgetsTableMigration extends Migration
{
    public function up()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->create('widgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->longtext('styles')->nullable();
            $table->longtext('domains')->nullable();
            $table->longtext('business_hours')->nullable();
            $table->string('timezone')->nullable();
            $table->longtext('exclude_pages')->nullable();
            $table->integer('initial_delay')->defaultValue(0);
            $table->integer('page_scroll')->defaultValue(0);
            $table->tinyint('widget_behavior')->defaultValue(1);
            $table->string('custom_css')->nullable();
            $table->longtext('call_to_action')->nullable();
            $table->boolean('store_responses')->defaultValue(1);
            $table->longtext('delete_responses')->nullable();
            $table->longtext('integrations')->nullable();
            $table->boolean('status')->defaultValue(1);
            $table->boolean('active')->defaultValue(0);
            $table->boolean('hide_credit')->defaultValue(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::withPrefix(Config::get('DB_PREFIX'))->drop('widgets');
    }
}

<?php

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPKit\Migration\Migration;

if (!\defined('ABSPATH')) {
    exit;
}

final class BASTUpdateCustomCssColumnInWidgetTableMigration extends Migration
{
    public function up()
    {
        // Schema::edit('widgets', function (Blueprint $table) {
        //     $table->longtext('custom_css')->nullable()->change();
        // });

        global $wpdb;
        $table_name = Config::withDBPrefix('widgets');
        $sql = "ALTER TABLE $table_name MODIFY COLUMN custom_css LONGTEXT NULL;";
        $wpdb->query($sql);
    }

    public function down()
    {
        // Schema::edit('widgets', function (Blueprint $table) {
        //     $table->string('custom_css')->nullable()->change();
        // });

        global $wpdb;
        $table_name = Config::withDBPrefix('widgets');
        $sql = "ALTER TABLE $table_name MODIFY COLUMN custom_css VARCHAR(255) NULL;";
        $wpdb->query($sql);
    }
}

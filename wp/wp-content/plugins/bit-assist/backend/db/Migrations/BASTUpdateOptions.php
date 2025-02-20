<?php

use BitApps\Assist\Config;
use BitApps\Assist\Deps\BitApps\WPKit\Migration\Migration;

if (!\defined('ABSPATH')) {
    exit;
}

final class BASTUpdateOptions extends Migration
{
    public function up()
    {
        Config::updateOption('db_version', Config::DB_VERSION, true);
        Config::updateOption('version', Config::VERSION, true);
    }

    public function down()
    {
        return;
    }
}

<?php

namespace Essential_Addons_Elementor\Pro\Classes;

if (!defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

class Migration
{
    use \Essential_Addons_Elementor\Pro\Traits\Library;
    use \Essential_Addons_Elementor\Pro\Traits\Core;

    /**
     * Plugin activation hook
     *
     * @since 3.0.0
     */
    public function plugin_activation_hook()
    {
        // remove old cache files
        if (defined('EAEL_ASSET_PATH')) {
            $this->empty_dir(EAEL_ASSET_PATH);
        }

        // save default options value
        $this->set_default_values();

        // make lite version available
        set_transient('eael_install_lite', true, 1800);
    }

    /**
     * Plugin deactivation hook
     *
     * @since 3.0.0
     */
    public function plugin_deactivation_hook()
    {
        // remove old cache files
        if (defined('EAEL_ASSET_PATH')) {
            $this->empty_dir(EAEL_ASSET_PATH);
        }
    }

    /**
     * Plugin upgrade hook
     *
     * @since 3.0.0
     */
	public function plugin_upgrade_hook( $upgrader_object, $options ) {
		if ( isset( $options['action'], $options['type'] ) && $options['action'] === 'update' && $options['type'] === 'plugin' ) {
			if ( isset( $options['plugins'][ EAEL_PRO_PLUGIN_BASENAME ] ) ) {
				// remove old cache files
				if ( defined( 'EAEL_ASSET_PATH' ) ) {
					$this->empty_dir( EAEL_ASSET_PATH );
				}
			}
		}
	}

    /**
     * Plugin migrator
     *
     * @since 3.0.0
     */
    public function migrator()
    {
        // migration trick
        if (get_option('eael_pro_version') != EAEL_PRO_PLUGIN_VERSION) {
            // set current version to db
            update_option('eael_pro_version', EAEL_PRO_PLUGIN_VERSION);

            /**
             * Tricky update here
             *
             * @since 3.0.4
             */

            // make lite version available
            if(function_exists('wp_get_environment_type')){
                if (wp_get_environment_type() !== 'development') {
                    set_transient('eael_install_lite', true, 1800);
                }
            }
        }

        // check for lite version
        if ((boolean) get_transient('eael_install_lite') === true) {
            // install lite version
            $this->make_lite_available();

            // disabled temporarily
            // if ($this->make_lite_available()) {
            //     // redirect to plugin dashboard
            //     die(wp_redirect("admin.php?page=eael-settings"));
            // }
        }
    }
}

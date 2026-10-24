<?php
/** Plugin Name: UNimpossible server isolation */
// Website enquiries use the existing browser-to-Core integration, not WordPress mail.
add_filter('pre_wp_mail', '__return_false');
add_filter('pre_http_request', function ($result) {
 if (defined('WP_CLI') && WP_CLI) return $result;
 return new WP_Error('website_isolated', 'External WordPress requests are disabled.');
});
add_filter('xmlrpc_enabled', '__return_false');
add_filter('wp_is_application_passwords_available', '__return_false');

<?php
remove_filter('the_content', 'wpautop');
remove_filter('the_content', 'wptexturize');
remove_action('wp_head', 'rel_canonical');
add_filter('use_block_editor_for_post', '__return_false');
add_filter('show_admin_bar', '__return_false');
add_filter('wp_robots', function($robots) {
    if (is_page(5)) { $robots['noindex'] = true; }
    return $robots;
});

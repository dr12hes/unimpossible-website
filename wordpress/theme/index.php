<!doctype html>
<html lang="en-GB"><head><?php
if (is_front_page() || is_page(5)) {
    readfile(__DIR__ . (is_front_page() ? '/home-head.html' : '/privacy-head.html'));
} else {
    echo '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . esc_html(wp_get_document_title()) . '</title><link rel="stylesheet" href="/site.css">';
}
wp_head(); ?></head><body>
<?php while (have_posts()) { the_post(); the_content(); } wp_footer(); ?>
</body></html>

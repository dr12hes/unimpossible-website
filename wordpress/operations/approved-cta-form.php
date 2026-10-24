<?php
// One approved own-site copy update. No validation, metadata or plugin policy changes.
if (home_url() !== 'https://unimpossible.co.uk') throw new Exception('Wrong site');
$id = 4;
$p = get_post($id);
if (!$p || $p->post_status !== 'publish') throw new Exception('Homepage missing');
$changes = [
 '>Book a free 30-minute conversation</a>' => '>Request a free 30-minute conversation</a>',
 '>Book a conversation</button>' => '>Request a conversation</button>',
 '<label>Name<input' => '<label>Name (required)<input',
 '<label>Email<input' => '<label>Email (required)<input',
 '<label>Company<input' => '<label>Company (optional)<input',
 "<label>What takes up too much of your team's time?<textarea" => "<label>What takes up too much of your team's time? (optional)<textarea",
];
$before = $p->post_content;
$after = $before;
foreach ($changes as $old => $new) {
 $start = str_starts_with($old, '<label>') ? strpos($after, '<form class="contact" id="contact-form"') : 0;
 if ($start === false) throw new Exception('Contact form missing');
 $end = str_starts_with($old, '<label>') ? strpos($after, '</form>', $start) : strlen($after);
 if ($end === false) throw new Exception('Contact form end missing');
 $section = substr($after, $start, $end-$start);
 if (substr_count($section, $old) !== 1 || str_contains($section, $new)) throw new Exception('Content changed: '.$old);
 $after = substr_replace($after, str_replace($old, $new, $section), $start, $end-$start);
}
$meta = get_post_meta($id);
$indexing = get_option('blog_public');
$stamp = gmdate('Ymd\THis\Z');
$backup = '/root/unimp-cta-form-'.$stamp.'.json';
$record = ['page_id'=>$id,'at'=>gmdate('c'),'approval'=>'User: Ok continue - dont bother with staging', 'before'=>$before,'after'=>$after,'before_sha256'=>hash('sha256',$before),'after_sha256'=>hash('sha256',$after),'changes'=>$changes];
if (file_put_contents($backup, wp_json_encode($record, JSON_PRETTY_PRINT)) === false) throw new Exception('Backup failed');
chmod($backup,0600);
if (get_post($id)->post_content !== $before) throw new Exception('Concurrent edit');
wp_save_post_revision($id);
kses_remove_filters();
$result = wp_update_post(wp_slash(['ID'=>$id,'post_content'=>$after]),true);
if (is_wp_error($result)) throw new Exception($result->get_error_message());
if (get_post($id)->post_content !== $after || get_option('blog_public') !== $indexing) throw new Exception('Verification failed');
foreach ($meta as $key=>$value) {
 if (get_post_meta($id,$key) !== $value) throw new Exception('Metadata changed: '.$key);
}
add_post_meta($id,'_unimp_approved_copy_event',wp_slash(wp_json_encode(['at'=>$record['at'],'approval'=>$record['approval'],'before_sha256'=>$record['before_sha256'],'after_sha256'=>$record['after_sha256'],'changes'=>$changes,'backup'=>$backup,'status'=>'published; public verification pending'])));
echo wp_json_encode(['at'=>$record['at'],'page_id'=>$id,'backup'=>$backup,'before_sha256'=>$record['before_sha256'],'after_sha256'=>$record['after_sha256'],'changes'=>$changes,'blog_public'=>$indexing],JSON_PRETTY_PRINT);

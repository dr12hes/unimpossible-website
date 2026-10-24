<?php
// Run only when rollback is authorised. Refuse to overwrite subsequent edits.
if (home_url() !== 'https://unimpossible.co.uk') throw new Exception('Wrong site');
$record = json_decode(file_get_contents('/root/unimp-cta-form-20261024T192706Z.json'),true,512,JSON_THROW_ON_ERROR);
$p = get_post($record['page_id']);
if (hash('sha256',$p->post_content) !== $record['after_sha256']) throw new Exception('Later edit exists; review manually');
if (hash('sha256',$record['before']) !== $record['before_sha256']) throw new Exception('Backup mismatch');
wp_save_post_revision($p->ID);
kses_remove_filters();
$r = wp_update_post(wp_slash(['ID'=>$p->ID,'post_content'=>$record['before']]),true);
if (is_wp_error($r) || get_post($p->ID)->post_content !== $record['before']) throw new Exception('Undo failed');
add_post_meta($p->ID,'_unimp_approved_copy_event',wp_slash(wp_json_encode(['at'=>gmdate('c'),'status'=>'undone','publication_at'=>$record['at']])));
echo "Original homepage body restored; metadata untouched.\n";

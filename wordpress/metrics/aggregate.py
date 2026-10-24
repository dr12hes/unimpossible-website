#!/usr/bin/python3
"""Small append-only referral baseline; counts requests, never unique visitors."""
import gzip,grp,json,os,sys
from collections import Counter
from datetime import datetime,timedelta,timezone
from pathlib import Path

def tally(lines):
 counts=Counter()
 for line in lines:
  row=json.loads(line)
  if row['test']:continue
  day=datetime.fromisoformat(row['at']).astimezone(timezone.utc).date().isoformat()
  counts[(day,row['source'],row['page'])]+=1
 return counts

def main():
 root=Path('/var/lib/unimpossible-metrics');root.mkdir(mode=0o750,exist_ok=True);root.chmod(0o750);os.chown(root,0,grp.getgrnam('www-data').gr_gid)
 dest=root/'referrals.json';now=datetime.now(timezone.utc)
 previous=json.loads(dest.read_text()) if dest.exists() else {'started_at':now.isoformat(),'days':[]}
 counts=Counter()
 for path in Path('/var/log/nginx').glob('unimpossible-referrals.jsonl*'):
  with (gzip.open(path,'rt') if path.suffix=='.gz' else path.open()) as f:counts.update(tally(f))
 old={(r['date'],r['source'],r['page']):r['requests'] for r in previous['days']}
 # Rotated logs age out; totals are monotonic, not re-added on every run.
 for key,value in counts.items():old[key]=max(old.get(key,0),value)
 cutoff=(now-timedelta(days=400)).date().isoformat()
 value={'started_at':previous['started_at'],'updated_at':now.isoformat(),'metric':'attributed_page_requests','timezone':'UTC','days':[{'date':k[0],'source':k[1],'page':k[2],'requests':v} for k,v in sorted(old.items()) if k[0]>=cutoff],'limitations':'Recognised referrers only. Not unique visitors, verified humans, rankings or AI citations. Missing referrers are not measurable; bots can evade filtering. Current day is incomplete.'}
 temp=dest.with_suffix('.tmp');temp.write_text(json.dumps(value,indent=2));temp.chmod(0o640);os.chown(temp,0,grp.getgrnam('www-data').gr_gid);os.replace(temp,dest)
 print(json.dumps(value))

if __name__=='__main__':
 if '--check' in sys.argv:
  row={'at':'2026-10-24T15:00:00+01:00','page':'/','source':'chatgpt','test':False}
  assert tally([json.dumps(row),json.dumps({**row,'test':True})])=={('2026-10-24','chatgpt','/'):1}
  print('PASS: UTC daily counting; synthetic checks excluded.')
 else:main()

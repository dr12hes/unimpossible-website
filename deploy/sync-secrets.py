#!/usr/bin/env python3
"""Resolve 1Password references in memory and atomically install the scanner environment over SSH."""
import argparse
import os
import shlex
import subprocess
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True)
    parser.add_argument("--key", default="")
    parser.add_argument("--remote-dir", default="/home/docker/unimpossible")
    args = parser.parse_args()
    template = Path(__file__).with_name("scanner.env.1password")
    try:
        result = subprocess.run(["op", "inject", "--in-file", str(template)], capture_output=True, text=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        sys.exit("Could not resolve scanner credentials. Unlock 1Password and check CLI access.")
    values = dict(line.split("=", 1) for line in result.stdout.splitlines() if line and not line.startswith("#"))
    required = ["ANTHROPIC_API_KEY", "POSTMARK_SERVER_TOKEN", "SCANNER_ADMIN_KEY", "SCANNER_SECRET"]
    provider = values.get("SEARCH_PROVIDER", "")
    required.append({"serper": "SERPER_API_KEY", "brave": "BRAVE_API_KEY", "tavily": "TAVILY_API_KEY"}.get(provider, "SEARCH_PROVIDER"))
    if any(not values.get(k) or "op://" in values[k] for k in required):
        sys.exit("Scanner credentials are incomplete; nothing was sent to the server.")
    writer = """import os,sys,tempfile
from pathlib import Path
root=Path(sys.argv[1]); root.mkdir(parents=True,exist_ok=True)
fd,path=tempfile.mkstemp(prefix='.env-',dir=root)
try:
 with os.fdopen(fd,'wb') as f: f.write(sys.stdin.buffer.read())
 os.chmod(path,0o600)
 os.replace(path,root/'.env')
finally:
 if os.path.exists(path): os.unlink(path)
"""
    ssh = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10"]
    if args.key and os.path.isfile(args.key):
        ssh += ["-o", "IdentitiesOnly=yes", "-i", args.key]
    command = "python3 -c " + shlex.quote(writer) + " " + shlex.quote(args.remote_dir)
    try:
        subprocess.run(ssh + [args.host, command], input=result.stdout, text=True, capture_output=True, check=True)
    except subprocess.CalledProcessError:
        sys.exit("Could not install the scanner environment over SSH (output suppressed).")
    print("Scanner credentials synced from 1Password; server environment mode is 0600.")


if __name__ == "__main__":
    main()

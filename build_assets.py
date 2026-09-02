"""Download pinned browser assets at deploy time.

This keeps Phaser on the same origin as the Flask site, avoiding browser/network
blocks against public CDNs. The script tries several official mirrors and exits
with an error only when no valid Phaser build can be obtained.
"""
from __future__ import annotations

from pathlib import Path
import hashlib
import os
import sys
import tempfile
import urllib.request

VERSION = "3.90.0"
TARGET = Path(__file__).resolve().parent / "static" / "vendor" / "phaser.min.js"
SOURCES = [
    f"https://cdnjs.cloudflare.com/ajax/libs/phaser/{VERSION}/phaser.min.js",
    f"https://cdn.jsdelivr.net/npm/phaser@{VERSION}/dist/phaser.min.js",
    f"https://unpkg.com/phaser@{VERSION}/dist/phaser.min.js",
    f"https://github.com/phaserjs/phaser/releases/download/v{VERSION}/phaser.min.js",
]


def looks_valid(data: bytes) -> bool:
    # Phaser 3.90 minified build is > 1 MB raw. Keep a generous lower bound.
    return len(data) > 900_000 and (b"Phaser" in data[:100_000] or b"phaser" in data[:100_000].lower())


def download(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "OlympicHoaHoc-Build/1.0 (+Flask Render deploy)"},
    )
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read()


def main() -> int:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    if TARGET.exists():
        data = TARGET.read_bytes()
        if looks_valid(data):
            print(f"Phaser already present: {TARGET} ({len(data):,} bytes)")
            return 0

    errors = []
    for url in SOURCES:
        try:
            print(f"Downloading Phaser {VERSION} from {url}")
            data = download(url)
            if not looks_valid(data):
                raise RuntimeError(f"downloaded file looks invalid ({len(data):,} bytes)")
            fd, temp_name = tempfile.mkstemp(prefix="phaser-", suffix=".js", dir=TARGET.parent)
            os.close(fd)
            temp = Path(temp_name)
            temp.write_bytes(data)
            temp.replace(TARGET)
            digest = hashlib.sha256(data).hexdigest()
            print(f"Saved {TARGET} ({len(data):,} bytes, sha256={digest})")
            return 0
        except Exception as exc:
            errors.append(f"{url}: {exc}")
            print(f"Failed: {exc}", file=sys.stderr)

    print("Could not download Phaser from any configured source:", file=sys.stderr)
    for err in errors:
        print(" - " + err, file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())

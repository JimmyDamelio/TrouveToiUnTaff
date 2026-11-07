"""Search and download openly licensed audio and images from Openverse (api.openverse.org, no key needed).

  python3 openverse.py search audio "whoosh" --license cc0 --max-duration 3000 -n 10
  python3 openverse.py search images "watercolor leaves" --license cc0,by -n 10
  python3 openverse.py get audio <id> [<id> ...] --out sounds/      # downloads + appends CREDITS.csv
"""
import argparse, csv, json, os, sys, urllib.parse, urllib.request

API = "https://api.openverse.org/v1"
UA = {"User-Agent": "edunos-claude-toolkit/1.0 (openverse skill)"}


def call(path, params=None):
    url = f"{API}/{path}" + ("?" + urllib.parse.urlencode(params) if params else "")
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)


def search(kind, q, license_, n, max_duration):
    p = {"q": q, "page_size": n}
    if license_:
        p["license"] = license_
    if kind == "audio" and max_duration:
        p["duration"] = "short" if max_duration <= 30000 else None
        p = {k: v for k, v in p.items() if v}
    res = call(f"{kind}/", p)["results"]
    out = []
    for r in res:
        if kind == "audio" and max_duration and (r.get("duration") or 0) > max_duration:
            continue
        out.append({k: r.get(k) for k in ("id", "title", "creator", "license", "license_version", "duration", "filetype", "url", "foreign_landing_url", "provider")})
        out[-1]["tags"] = [t["name"] for t in (r.get("tags") or [])][:8]
    print(json.dumps(out, indent=1, ensure_ascii=False))


def get(kind, ids, out):
    os.makedirs(out, exist_ok=True)
    credits = os.path.join(out, "CREDITS.csv")
    new = not os.path.exists(credits)
    with open(credits, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["file", "title", "creator", "license", "source", "attribution"])
        for i in ids:
            r = call(f"{kind}/{i}/")
            ext = (r.get("filetype") or os.path.splitext(urllib.parse.urlparse(r["url"]).path)[1].lstrip(".") or "bin")
            safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in (r.get("title") or i))[:50]
            path = os.path.join(out, f"{safe}_{i[:8]}.{ext}")
            with urllib.request.urlopen(urllib.request.Request(r["url"], headers=UA), timeout=60) as src, open(path, "wb") as dst:
                dst.write(src.read())
            w.writerow([os.path.basename(path), r.get("title"), r.get("creator"), f"{r.get('license')} {r.get('license_version') or ''}".strip(), r.get("foreign_landing_url"), r.get("attribution")])
            print(path)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("search"); s.add_argument("kind", choices=["audio", "images"]); s.add_argument("q")
    s.add_argument("--license", default="cc0"); s.add_argument("-n", type=int, default=10); s.add_argument("--max-duration", type=int, help="ms")
    g = sub.add_parser("get"); g.add_argument("kind", choices=["audio", "images"]); g.add_argument("ids", nargs="+"); g.add_argument("--out", default=".")
    a = ap.parse_args()
    search(a.kind, a.q, a.license, a.n, a.max_duration) if a.cmd == "search" else get(a.kind, a.ids, a.out)

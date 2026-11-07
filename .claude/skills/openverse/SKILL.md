---
name: openverse
description: Find and download openly licensed sound effects, music and images (CC0, CC BY…) from Openverse — 800M+ works from Freesound, Wikimedia, Flickr, museums. Use when a video, site or document needs real recordings (whoosh, hit, ambience, foley) or images the user may legally use, to build a sound library for real-sfx, or when the user asks for free/royalty-free/CC0 media. Keeps a CREDITS.csv with attributions.
---

# Openverse

Public API, no key: `python3 ~/.claude/skills/openverse/scripts/openverse.py …`

1. `search audio "soft whoosh" --license cc0 --max-duration 3000 -n 15` (JSON: id, title, creator, license, duration ms, tags, url). Images: `search images "…"`.
2. Pick candidates by title/tags/duration; when earshot is installed, download a few and rank them with `earshot rank "<description>" files…` instead of guessing.
3. `get audio <id> <id> --out <project>/sounds` downloads the files and appends `CREDITS.csv` (title, creator, licence, source, attribution string).

Licences: prefer `cc0` (no attribution needed). `by` / `by-sa` need the attribution line in the credits of whatever is published; avoid `nc` for anything sold or promoting a product. Previews from Freesound are MP3; the WAV (`alt_files`) may need a Freesound login.

To feed the real-sfx skill: download into a folder per type (`sounds/whoosh`, `sounds/hit`, …) then `python3 ~/.claude/skills/real-sfx/scripts/setup.py add-library openverse <folder> --index`.

---
name: video-in-code
description: Make a video (MP4) entirely in code — trailer, promo, teaser, social clip (9:16, 1:1, 16:9), animated explainer, lyric video, animated cover — with music and optional voice-over. Use when the user asks for a video, film, trailer, ad, reel, TikTok, short or animation. Picture is drawn in a browser (Canvas/SVG/Three.js or Remotion), music synthesised in Python, voice from Kokoro/Piper, ffmpeg joins them.
---

# Videos made in code

No video-generation model: write a page that can draw any moment `renderAt(t)`, capture every frame in headless Chromium, synthesise the soundtrack, join with ffmpeg. Good at motion design, hand-drawn/ink/watercolour, explainers, product launches, lyric videos; not at photorealistic people.

Tools come from this toolkit's `install.sh` (run it if `agent-reach`, `/root/tts-models` or `kokoro_onnx` are missing). Templates: `~/.claude/toolkit/templates/canvas-film` (hand-made look, full example) and `~/.claude/toolkit/templates/remotion` (React/Remotion, text-led and social formats).

## Workflow
1. **Facts and brand.** Get real copy from the user or their store/site; never invent claims or numbers. If the project has a brand guide (CLAUDE.md, a skill), follow it.
2. **Storyboard first**: time → scene → on-screen text → sound cue, 4–7 scenes, one idea each. Show it when the brief is open. Read the `motion-design` skill for timing/easing/choreography.
3. **Voice-over (optional) before timing**: generate it, measure each line's duration, then set scene times to the voice.
4. **Build** from a template in a new folder. Everything deterministic: seeded RNG, no `Math.random`, no wall clock. GSAP timelines can be driven with `tl.seek(t)` inside `renderAt(t)`.
5. **Check stills before the full render**: `node render.mjs stills 1 4 8 …`, tile with ffmpeg (`-vf scale=640:-1,tile=3x4`) and look. Fix empty beats, overlaps, low contrast, hard gradient edges.
6. **Render** frames (`node render.mjs frames 30 6`), audio (`python3 audio.py`), then:
   `ffmpeg -framerate 30 -i frames/f_%05d.png -i audio.wav -c:v libx264 -crf 18 -pix_fmt yuv420p -tune animation -c:a aac -b:a 192k -movflags +faststart -shortest out.mp4`
7. Check a contact sheet of the final MP4 (`fps=1/2.5,tile=4x3`), send the file to the user, commit sources (not frames/, audio.wav).

## Voice-over
- Kokoro (most natural): `from kokoro_onnx import Kokoro; k = Kokoro('/root/tts-models/kokoro-v1.0.onnx', '/root/tts-models/voices-v1.0.bin'); samples, sr = k.create(text, voice='af_heart', speed=.95, lang='en-us')`. Voices: `af_heart`, `af_bella`, `bf_emma` (en-gb), `ff_siwis` (lang `fr-fr`), and ~50 more (`k.get_voices()`).
- Piper (fast): `echo "texte" | python3 -m piper -m /root/tts-models/fr_FR-siwis-medium.onnx -f out.wav`.
- Mix the voice over the music with ducking (music −8 dB under speech).

## Remotion
`cd templates/remotion copy && npm install && npx remotion render src/index.ts <Comp> out.mp4`. `remotion.config.ts` points Remotion at Playwright's Chromium (Remotion's own browser download host may be unreachable in cloud sessions).

## Gotchas
- Canvas gradients must fade to the same colour at alpha 0 (`rgba(r,g,b,0)`), never `rgba(0,0,0,0)`, or soft areas turn grey.
- Drawing helpers should multiply the current `globalAlpha` so group fades work.
- Load fonts locally (woff2) and wait for `document.fonts.load` before rendering.
- ~1.5 min for 900 frames at 1080p with 6 workers on 4 CPUs.

## Style libraries for inspiration
lemomo-ai/lemo-opuscar (59 film styles), Vincentwei1021/mg-styles-15, JohnHeibel/ClaudeAnimationBase (p5.brush characters), mexicat/pdoom-video (Three.js lyric video), joeseesun/opus-video-prompts, yihui-dev/awesome-opus5-5-videos, athemeroy/awesome-claude-5-5-videos. Clone to the scratchpad when a style is needed.

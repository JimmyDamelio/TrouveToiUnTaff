"""Soundtrack of the TikTok ad (21.5 s), no voice: a real track cut to the picture + effects on every move.

Music: "Funkorama", Kevin MacLeod (incompetech.com), CC BY 4.0 - credit it in the post.
The excerpt starts at 121.10 s so the full band comes back (122.95 s) exactly on the GRATUIT stamp (1.85 s).
Effects: earshot's shipped bank (`earshot sfx render`), each placed by its measured onset or peak and set
against the music's level around it (effects ride a few dB over the bed). Tonal effects are tuned to D.
-> audio/takes/*.wav, audio.wav
"""
import json
import os
import subprocess
import wave
import numpy as np
import soundfile as sf

SR, DUR = 44100, 21.5
N = int(SR * DUR)
MUSIC, M_START, M_GAIN_DB = 'sounds/music/Funkorama.mp3', 121.10, -3.0
EARSHOT = os.path.expanduser('~/.local/bin/earshot')
os.makedirs('audio/takes', exist_ok=True)

# (time in the film, bank sound, align on 'onset' or 'peak', dB over the music bed, options)
TYPE_NAME = [7.05 + (6 + 2 * k) / 30 for k in range(11)]   # « Inès Diallo », 2 frames a key (capture.mjs)
TYPE_JOB = [7.05 + (36 + 2 * k) / 30 for k in range(8)]    # « Vendeuse »
CARDS = [11.95 + k * 0.18 for k in range(10)]              # the ten CV sheets (film.html sceneModels)
KEYS = ['fit/key/lubed', 'fit/key/medium', 'fit/key/thock']
CUES = [
    # hook: the paywall pops, buzzes « no », the stamp hits as the band comes in
    (0.05, 'whoosh_fast/crisp', 'peak', 4, {'pan': -.2}),
    (0.42, 'pro_pop_in/round', 'onset', 6, {}),
    (1.15, 'glitch/mid', 'onset', -6, {'cap': -12}),
    (1.45, 'glitch/mid', 'onset', -8, {'seed': 3, 'cap': -13}),
    (1.85, 'cut_hit/punch', 'onset', 18, {'cap': -2}),
    (1.86, 'pro_pop_in/deep', 'onset', 14, {'cap': -4}),
    # the real site
    (2.50, 'whoosh_fast/sleeve', 'peak', 3, {'pan': .3}),
    (2.62, 'ui_pop/soft', 'onset', -4, {'pitch': 'D5'}),
    (2.85, 'pro_shimmer/m1', 'onset', -6, {}),
    (3.90, 'ui_pop/wide', 'onset', -2, {'pitch': 'A5'}),
    (5.25, 'pro_zip/down', 'onset', -4, {}),
    (5.45, 'ui_pop/wide', 'onset', -2, {'pitch': 'D5'}),
    # writing: keys, a check when each field fills, the click, the page turning
    (7.05, 'whoosh_fast/crisp', 'peak', 2, {'pan': -.3, 'seed': 2}),
    *[(t, KEYS[k % 3], 'onset', -5, {'seed': k, 'cap': -13}) for k, t in enumerate(TYPE_NAME + TYPE_JOB)],
    (TYPE_NAME[0] + .03, 'pro_pop/tink', 'onset', -4, {'cap': -16}),
    (TYPE_JOB[0] + .03, 'pro_pop/tink', 'onset', -4, {'cap': -16}),
    (9.25, 'pro_click/mouse', 'onset', -4, {}),
    (9.30, 'fit/whoosh.short/bamboo_swish', 'peak', 3, {'pan': -.4}),
    (9.45, 'ui_pop/wide', 'onset', 1, {'pitch': 'A5'}),
    # 26 templates: each sheet slides in with a soft swish and a tick
    (11.95, 'whoosh_fast/sleeve', 'peak', 3, {'pan': .3, 'seed': 4}),
    *[(t, 'pro_hover_tick/detent', 'onset', -6, {'cap': -15}) for t in CARDS],
    *[(t + .02, 'whoosh_fast/crisp', 'peak', -9, {'seed': 10 + k, 'pan': .5 - k * .1}) for k, t in enumerate(CARDS[1:])],
    # the end of the book: click, page, confetti burst, « 0 € »
    (13.85, 'whoosh_fast/sleeve', 'peak', 3, {'pan': -.3, 'seed': 5}),
    (14.08, 'pro_click/mouse', 'onset', -4, {'seed': 2}),
    (14.12, 'fit/whoosh.short/bamboo_swish', 'peak', 2, {'pan': -.4, 'seed': 2}),
    (14.42, 'pro_pop/double', 'onset', 4, {}),
    (14.44, 'pro_shimmer/m3', 'onset', 0, {}),
    (14.50, 'mallet/flourish', 'onset', 2, {'pitch': 'D6'}),
    (15.00, 'ui_pop/wide', 'onset', -1, {'pitch': 'D5'}),
    (15.04, 'pro_notify/ding_2296', 'onset', 0, {}),
    # call to action: the logo lands, three checks climb, the button
    (17.20, 'pro_whoosh_big/swell', 'peak', 2, {}),
    (17.28, 'pro_pop_in/deep', 'onset', 5, {}),
    (17.72, 'mallet/marimba', 'onset', 2, {'pitch': 'A4'}),
    (18.07, 'mallet/marimba', 'onset', 2, {'pitch': 'C5'}),
    (18.42, 'mallet/marimba', 'onset', 2, {'pitch': 'D5'}),
    (19.02, 'pro_pop_in/round', 'onset', 5, {}),
    (19.05, 'mallet/glock', 'onset', 2, {'pitch': 'D6'}),
]


def render(sound, opts):
    key = sound.replace('/', '_') + ''.join(f'_{k}{v}' for k, v in sorted(opts.items()) if k in ('pitch', 'seed'))
    wav, js = f'audio/takes/{key}.wav', f'audio/takes/{key}.json'
    if not os.path.exists(js):
        cmd = [EARSHOT, 'sfx', 'render', sound, '-o', wav, '--out', js]
        for k in ('pitch', 'seed'):
            if k in opts:
                cmd += [f'--{k}', str(opts[k])]
        subprocess.run(cmd, check=True, capture_output=True, env={**os.environ, 'EARSHOT_HOME': os.path.expanduser('~/.earshot')})
    info = json.load(open(js))
    x, sr = sf.read(wav, always_2d=True)
    if sr != SR:
        x = np.stack([np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x[:, c]) for c in range(x.shape[1])], 1)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, 1)
    return x, info['meta']['onset_s'], info['meta']['peak_s']


def db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


# music excerpt, faded out at the end
tmp = 'audio/music_excerpt.wav'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(M_START), '-t', str(DUR), '-i', MUSIC, '-ac', '2', '-ar', str(SR), tmp], check=True)
music, _ = sf.read(tmp, always_2d=True)
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N] * 10 ** (M_GAIN_DB / 20)
music *= np.minimum(1, (DUR - np.arange(N) / SR) / 0.8)[:, None]


def bed_db(t):  # the music's median 50 ms level around the cue (1.5 s before, 0.5 s after): funk has short stops
    a, h = int(max(0, t - 1.5) * SR), int(.05 * SR)
    lv = [db(music[i:i + h]) for i in range(a, min(N, int((t + .5) * SR)) - h + 1, h)]
    return float(np.median(lv)) if lv else -40.0


fx = np.zeros((N, 2))
report = []
for t, sound, align, over, opts in CUES:
    x, onset, peak = render(sound, opts)
    start = t - (peak if align == 'peak' else onset)
    h = int(.1 * SR)  # loudness of the take = its loudest 100 ms
    loud = max(db(x[k:k + h]) for k in range(0, max(1, len(x) - h), h // 4))
    gain = min(10 ** ((max(bed_db(t), -38) + over - loud) / 20), 10 ** (opts.get('cap', -3) / 20) / np.abs(x).max())  # peak cap per cue
    report.append((t, sound, round(bed_db(t), 1), round(20 * np.log10(gain * np.abs(x).max()), 1)))
    pan = opts.get('pan', 0)
    x = x * gain * np.sqrt(2) * np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)])  # constant-power pan
    i = int(start * SR)
    if i < 0:
        x, i = x[-i:], 0
    x = x[:N - i]
    fx[i:i + len(x)] += x

mixed = music + fx
for r in report: print('  %6.2f  %-32s bed %6.1f dB  take peak %5.1f dBFS' % r)
peak = np.abs(mixed).max()
mixed *= 0.89 / peak  # -1 dBFS ceiling; loudness checked with ebur128 after encoding
sf.write('audio_fx.wav', fx * 0.89 / peak, SR, subtype='PCM_16')
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mixed, -1, 1) * 32767).astype('<i2').tobytes())
print(f'audio.wav {DUR} s, {len(CUES)} cues, peak normalised from {20 * np.log10(peak):.1f} dBFS')

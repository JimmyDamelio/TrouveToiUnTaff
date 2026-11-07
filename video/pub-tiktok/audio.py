"""Soundtrack of the TikTok ad (21.5 s): 120 BPM groove, sound cues on the picture, French voice-over with ducking -> audio.wav"""
import json
import wave
import numpy as np
import soundfile as sf

SR, DUR = 44100, 21.5
N = int(SR * DUR)
rng = np.random.default_rng(11)
L, R = np.zeros(N), np.zeros(N)
MUS_L, MUS_R = np.zeros(N), np.zeros(N)
BEAT = 0.5


def hz(note):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440.0 * 2 ** ((names[note[:-1]] + 12 * (int(note[-1]) + 1) - 69) / 12)


def add(sig, start, pan=0.0, gain=1.0, music=True):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[:N - i] * gain
    tl, tr = (MUS_L, MUS_R) if music else (L, R)
    tl[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    tr[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def t_(d):
    return np.arange(int(SR * d)) / SR


def kick():
    t = t_(0.35)
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9


def noise_hit(d, decay, lo, hi):
    n = rng.standard_normal(int(SR * d))
    spec = np.fft.rfft(n)
    fr = np.fft.rfftfreq(len(n), 1 / SR)
    spec *= (fr > lo) & (fr < hi)
    s = np.fft.irfft(spec, len(n))
    return s / (np.abs(s).max() + 1e-9) * np.exp(-t_(d) * decay)


def pluck(f, d=0.4, vel=0.3):
    t = t_(d)
    s = sum((1 / k) * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (6 + 3 * k)) for k in range(1, 6))
    return s * np.minimum(1, t / 0.004) * vel


def bass(f, d=0.24, vel=0.4):
    t = t_(d)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return s * np.minimum(1, t / 0.005) * np.minimum(1, (d - t) / 0.03) * vel


def whoosh(start, d=0.45, vel=0.35):
    s = noise_hit(d, 0, 400, 6000) * np.sin(np.pi * np.linspace(0, 1, int(SR * d))) ** 2
    add(s, start - d / 2, pan=-0.3, gain=vel, music=False)
    add(s[::-1], start - d / 2, pan=0.3, gain=vel * 0.6, music=False)


def pop(start, f=900, vel=0.3):
    t = t_(0.12)
    add(np.sin(2 * np.pi * (f + 700 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * vel, start, music=False)


def chime(start, notes, vel=0.22):
    for k, n in enumerate(notes):
        t = t_(1.6)
        s = sum(a * np.sin(2 * np.pi * hz(n) * r * t) * np.exp(-t * dc) for r, a, dc in [(1, 1, 2.5), (2, .4, 4), (3.01, .2, 6)])
        add(s * np.minimum(1, t / 0.003) * vel, start + k * 0.07, pan=-.3 + .3 * k, music=False)


# ---- music: C G Am F, one chord per bar (2 s)
CHORDS = [('C3', ['C5', 'E5', 'G5']), ('G2', ['B4', 'D5', 'G5']), ('A2', ['C5', 'E5', 'A5']), ('F2', ['A4', 'C5', 'F5'])]
for b in range(int(DUR / BEAT)):
    t0 = b * BEAT
    root, triad = CHORDS[int(t0 // 2) % 4]
    if t0 < 4.2:  # hook: tense, filtered pulse and ticking hats
        add(bass(hz(root) / 2, 0.2, 0.25), t0)
        add(noise_hit(0.05, 60, 7000, 14000), t0 + BEAT / 2, pan=.3, gain=.07)
        continue
    if t0 < 4.6 or t0 >= 21.0:  # drop after STOP, and the final ring
        continue
    add(kick(), t0, gain=.8)
    if b % 2:
        add(noise_hit(0.18, 22, 900, 7000), t0, gain=.28)  # clap
    add(noise_hit(0.04, 70, 7000, 15000), t0 + BEAT / 2, pan=.35, gain=.09)  # offbeat hat
    add(noise_hit(0.03, 90, 7000, 15000), t0, pan=-.35, gain=.04)
    for e in (0, .25):
        add(bass(hz(root), 0.22, .32), t0 + e)
    for k, n in enumerate(triad):
        add(pluck(hz(n), 0.35, .07), t0 + BEAT / 2, pan=-.4 + .4 * k)
# riser into STOP
d = 1.0
s = noise_hit(d, 0, 500, 9000) * np.linspace(0, 1, int(SR * d)) ** 3
add(s, 3.2, gain=.3)
# final chord
for k, n in enumerate(['C4', 'E4', 'G4', 'C5']):
    add(pluck(hz(n), 1.6, .12), 21.0 - 1.4 + k * .02)

# ---- sound cues on the picture
t = t_(0.6)
add((np.sin(2 * np.pi * 55 * t) * np.exp(-t * 7) + 0.6 * noise_hit(0.6, 9, 80, 3000)) * .9, 4.2, music=False)  # STOP stamp
for f, st in ((330, 2.1), (262, 2.22)):  # paywall "bonk"
    tt = t_(0.18)
    add(np.sign(np.sin(2 * np.pi * f * tt)) * np.exp(-tt * 18) * .08, st, music=False)
for at in (7.05, 11.95, 13.85, 17.2):
    whoosh(at)
for at in (5.6, 9.45, 15.0):
    pop(at)
for k in range(10):
    pop(11.95 + k * 0.18, f=1300, vel=.12)
chime(14.15, ['E6', 'G6', 'C7'])  # confetti
chime(19.0, ['C6', 'E6', 'G6'], vel=.18)  # Lien en bio
for k in range(3):
    pop(17.7 + k * .35, f=700, vel=.18)

# ---- voice-over, with the music ducked 8 dB under it
STARTS = [0.25, 4.2, 7.15, 12.05, 13.9, 17.3]
vo = np.zeros(N)
for i, st in enumerate(STARTS):
    s, sr = sf.read(f'vo/l{i}.wav')
    assert sr == 24000 or sr == SR
    if sr != SR:
        s = np.interp(np.arange(int(len(s) * SR / sr)) * sr / SR, np.arange(len(s)), s)
    j = int(st * SR)
    vo[j:j + len(s)] += s[:N - j]
env = np.convolve(np.abs(vo) > 0.01, np.ones(int(SR * 0.15)) / int(SR * 0.15), mode='same')
duck = 1 - (1 - 10 ** (-8 / 20)) * np.clip(env * 3, 0, 1)
L += MUS_L * duck + vo * 1.15
R += MUS_R * duck + vo * 1.15

mixed = np.stack([L, R], 1)
mixed *= 0.89 / np.abs(mixed).max()
fade = np.minimum(1, (DUR - np.arange(N) / SR) / 0.3)[:, None]
mixed *= fade
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mixed * 32767).astype('<i2').tobytes())
print('audio.wav', DUR, 's, rms', round(float(np.sqrt((mixed ** 2).mean())), 3))

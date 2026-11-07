"""Voice-over (Kokoro, voix ff_siwis) -> vo/l<n>.wav + vo/durations.json"""
import json, soundfile as sf
from kokoro_onnx import Kokoro
LINES = [
    "Ton CV est fini… et là, on te demande de payer pour le télécharger ?",
    "Stop. Sur Trouve-toi un taf, c'est gratuit. Vraiment.",
    "Tu écris ton CV comme un livre, chapitre par chapitre, avec un guide à chaque étape.",
    "Tu choisis parmi vingt-six modèles,",
    "et tu télécharges ton PDF, propre, au format A4.",
    "Sans compte, et tes infos restent sur ton téléphone. Lien en bio !",
]
k = Kokoro('/root/tts-models/kokoro-v1.0.onnx', '/root/tts-models/voices-v1.0.bin')
d = []
for i, text in enumerate(LINES):
    s, sr = k.create(text, voice='ff_siwis', speed=1.08, lang='fr-fr')
    sf.write(f'vo/l{i}.wav', s, sr)
    d.append(round(len(s) / sr, 2))
json.dump(d, open('vo/durations.json', 'w'))
print(d, sum(d))

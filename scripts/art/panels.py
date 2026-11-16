# Graphic-novel panels for any Section on the local 4060 (ComfyUI :8188, Flux.2 Klein, $0 per image).
#   python scripts/art/panels.py musashi [keys...]   -> art-src/<id>/<key>.png   (existing panels are skipped)
# One house style across the Hall: bold ink, halftone, sepia + gold. AI-generated art is labelled on the site.
import subprocess, sys, os, random
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PY = r"C:\Users\scnun\Projects\_monorepos\ContentStudioAI\contentcreate\engine\tools\comfyui\venv\Scripts\python.exe"
CLIENT = os.environ.get("HOB_CLIENT") or r"C:\Users\scnun\Projects\_monorepos\MRS\games\babble\tools\comfy_client_run.py"
STEPS, CFG, GUIDE = os.environ.get("HOB_STEPS", "28"), os.environ.get("HOB_CFG", "4.0"), os.environ.get("HOB_GUIDANCE", "4.0")
STYLE = ("graphic novel comic book panel, bold black ink linework, cross-hatching and halftone dot shading, "
         "limited palette of deep sepia brown, warm cream paper and burnished gold highlights, dramatic cinematic lighting, "
         "strong composition, highly detailed historical illustration")
NEG = ("text, speech bubble, letters, caption, watermark, signature, logo, modern clothing, modern objects, "
       "photorealistic photo, 3D render, blurry, lowres, deformed hands, extra fingers, extra limbs, cropped face, gore, blood, United States Capitol building, Washington DC, red cross emblem, duplicate person, Victorian clothing, frock coat, Georgian architecture")

MUSASHI = "a lean Japanese swordsman of the early 1600s with long unkempt black hair tied back, a rough dark kimono and hakama, a long and a short sword at his hip, calm fierce eyes"
AURELIUS = "a Roman man with short curly hair and a full curly beard, thoughtful calm face"
SETS = {
 "musashi": {
  "01-harima": "a small mountain village in feudal Japan around 1584, thatched farmhouses, terraced rice fields, morning mist, wide establishing shot, Japanese ink landscape feeling, early 17th century",
  "02-firstduel": "a thirteen-year-old Japanese boy with a wooden staff facing a grown samurai swordsman in a dusty village square, onlookers, tense moment before a duel, feudal Japan",
  "03-road": f"{MUSASHI} walking alone on a mountain road through cedar forest and fog, straw sandals, a long journey, feudal Japan",
  "04-kyoto": f"{MUSASHI} standing calmly before a large group of samurai of a rival fencing school at dawn under a pine tree in Kyoto, 1604, tense standoff",
  "05-ganryujima": f"{MUSASHI} in a small wooden rowing boat approaching a tiny rocky island at sunrise in 1612, carving a long wooden sword from a boat oar, a lone tall swordsman with a very long sword waiting on the beach",
  "06-twoswords": f"{MUSASHI} in a dojo demonstrating a stance holding a long sword and a short sword at the same time, students kneeling and watching, early 1600s Japan",
  "07-brush": f"{MUSASHI} kneeling at a low table painting a shrike bird on a bare branch with an ink brush on a paper scroll, quiet room, focus",
  "08-kumamoto": f"an older {MUSASHI} with grey streaks in his hair received respectfully at Kumamoto castle in 1640 by a daimyo lord and his retainers, dignified",
  "09-reigando": f"an old {MUSASHI} with grey hair writing a scroll by candlelight inside the Reigando rock cave, Buddhist stone carvings on the walls, 1643, solitude",
  "10-dokkodo": f"a frail old {MUSASHI} handing a scroll and his swords to a kneeling young disciple in a simple room, 1645, farewell, dignity",
 },
 "aurelius": {
  "01-rome": "ancient Rome in 121 AD at golden hour, marble temples, forum, hills, crowds in tunics and togas, wide establishing shot",
  "02-student": "a Roman teenage boy in a simple tunic studying a papyrus scroll with an older bearded Stoic philosopher teacher in a sunlit Roman villa courtyard, 2nd century",
  "03-adoption": f"a young {AURELIUS} in a toga being formally presented in an imperial palace hall by an older Roman emperor, senators watching, 138 AD",
  "04-coemperors": f"two Roman emperors side by side on a marble dais, {AURELIUS} and a younger Roman co-emperor, both in purple-trimmed togas, crowd of senators below, 161 AD",
  "05-plague": "a worried Roman city street during an epidemic in 166 AD, physicians in tunics tending the sick under arches, smoke from braziers, somber mood, not graphic",
  "06-danube": f"{AURELIUS} in Roman military armour and a red cloak on horseback leading legions along the wide cold Danube river, wooden forts, winter forest, 170s AD",
  "07-meditations": f"{AURELIUS} in a military tent at night by an oil lamp writing private notes in Greek on a wax tablet and parchment by the light of a small flat terracotta Roman oil lamp with a single open flame, armour hung behind him, Carnuntum 170s AD, quiet reflection",
  "08-triumph": f"{AURELIUS} in a triumphal chariot entering Rome in 176 AD, cheering crowds, laurel wreaths, triumphal arch, celebration",
  "09-farewell": f"an aged {AURELIUS} with a grey beard lying on a camp bed in a frontier fortress in 180 AD surrounded by respectful officers, calm and dignified, not sad",
  "10-legacy": "a bronze equestrian statue of a bearded Roman emperor raising his right hand, on a stone pedestal in the centre of the Piazza del Campidoglio in Rome, oval star-patterned stone paving, flat-roofed Renaissance palazzo facades with giant pilasters on three sides, no domes, golden evening light, timeless",
 },
}

def load_set(sid):
    """Built-in sets above, or scripts/art/sets/<id>.json: {"subject": "...", "panels": {"01-key": "scene with {S} for the subject"}}."""
    if sid in SETS: return SETS[sid]
    import json
    d = json.load(open(os.path.join(ROOT, "scripts", "art", "sets", sid + ".json"), encoding="utf8"))
    return {k: v.replace("{S}", d.get("subject", "")) for k, v in d["panels"].items()}

if __name__ == "__main__":
    sid, only = sys.argv[1], sys.argv[2:]
    out_dir = os.path.join(ROOT, "art-src", sid); os.makedirs(out_dir, exist_ok=True)
    for key, scene in load_set(sid).items():
        if only and key not in only: continue
        out = os.path.join(out_dir, key + ".png")
        if os.path.exists(out) and os.path.getsize(out) > 0 and not only: print("skip", key, flush=True); continue
        r = subprocess.run([PY, CLIENT, "--prompt", f"{scene}, {STYLE}", "--negative", NEG, "--out", out, "--steps", STEPS,
                            "--cfg", CFG, "--width", "1216", "--height", "832", "--seed", str(random.randint(0, 2**31 - 1)), "--guidance", GUIDE],
                           capture_output=True, text=True)
        print(sid, key, "ok" if r.returncode == 0 and os.path.exists(out) else "FAILED " + (r.stdout + r.stderr)[-300:], flush=True)

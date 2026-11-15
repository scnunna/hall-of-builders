# Generate the Nikola Tesla graphic-novel panels on the local 4060 (ComfyUI :8188, Flux.2 Klein). $0 per image.
# Run:  python scripts/art/tesla_panels.py [keys...]   -> public/art/tesla/<key>.jpg (webp/jpg converted by the caller)
# One house style for every Section: bold ink, halftone, sepia + gold. AI-generated art is labelled on the site.
import subprocess, sys, os, random
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PY = r"C:\Users\scnun\Projects\_monorepos\ContentStudioAI\contentcreate\engine\tools\comfyui\venv\Scripts\python.exe"
CLIENT = r"C:\Users\scnun\Projects\_monorepos\MRS\games\babble\tools\comfy_client_run.py"
OUT = os.path.join(ROOT, "art-src", "tesla")
os.makedirs(OUT, exist_ok=True)

STYLE = ("graphic novel comic book panel, bold black ink linework, cross-hatching and halftone dot shading, "
         "limited palette of deep sepia brown, warm cream paper and electric gold highlights, dramatic cinematic lighting, "
         "strong composition, highly detailed historical illustration, 19th century setting")
NEG = ("text, speech bubble, letters, caption, watermark, signature, logo, modern clothing, cars, smartphones, "
       "photorealistic photo, 3D render, blurry, lowres, deformed hands, extra fingers, extra limbs, cropped face")
TESLA = "a tall very thin young man with dark hair parted in the middle, a neat dark mustache and intense deep-set eyes, wearing a dark 1890s suit"

P = {
 "01-smiljan": "a small stone village church and wooden houses in the mountains of Lika at night, a violent summer lightning storm overhead, a single lit window, wide establishing shot",
 "02-books": "a young boy with dark hair reading a book at night by the light of a small homemade candle, cloth stuffed under the door, cosy 1860s room, close shot",
 "03-graz": f"a lecture hall at a technical university in the 1870s, a professor demonstrating a direct-current dynamo machine that throws bright sparks from its brushes, a thin dark-haired student {TESLA} leaning forward intently",
 "04-budapest": f"{TESLA} in a city park at sunset, drawing a circle with rotating arrows in the sand with a walking stick, a friend watching, golden light, moment of sudden insight",
 "05-newyork": f"{TESLA} standing on the deck of a 1880s steamship arriving in New York harbor, holding one small suitcase, crowded docks and masts, morning haze",
 "06-machineworks": f"{TESLA} working late at night on large dynamo machines in a gritty 1884 New York machine shop, gas lamps, sleeves rolled up",
 "07-acmotor": f"{TESLA} in his own small laboratory in 1888 beside an early alternating current induction motor with copper coils around a spinning iron rotor, glowing lines showing a rotating magnetic field",
 "08-lecture": f"{TESLA} on a stage in 1891 holding a long glowing gas-filled tube that lights up without wires, a stunned audience of engineers in a dark lecture hall, rays of light",
 "09-fair": "the 1893 World's Columbian Exposition in Chicago at night, white neoclassical palaces outlined with thousands of electric lights reflected in a lagoon, crowds in Victorian dress, awe and wonder",
 "10-niagara": "Niagara Falls in the 1890s with a stone hydroelectric power house beside the river, power lines stretching away toward a distant glowing city, mist and spray",
 "11-colorado": f"{TESLA} sitting calmly reading in a chair inside a barn-like laboratory at Colorado Springs in 1899 while huge artificial lightning bolts arc from a giant coil above him",
 "12-wardenclyffe": "a tall unfinished wooden tower with a mushroom-shaped dome on top beside a brick laboratory building on Long Island around 1903, dusk sky, lonely and ambitious",
}

only = sys.argv[1:]
for key, scene in P.items():
    if only and key not in only: continue
    out = os.path.join(OUT, key + ".png")
    if os.path.exists(out) and not only: print("skip", key); continue
    seed = random.randint(0, 2**31 - 1)
    r = subprocess.run([PY, CLIENT, "--prompt", f"{scene}, {STYLE}", "--negative", NEG, "--out", out, "--steps", "28",
                        "--cfg", "4.0", "--width", "1216", "--height", "832", "--seed", str(seed), "--guidance", "4.0"],
                       capture_output=True, text=True)
    print(key, "ok" if r.returncode == 0 and os.path.exists(out) else "FAILED " + (r.stdout + r.stderr)[-300:], flush=True)

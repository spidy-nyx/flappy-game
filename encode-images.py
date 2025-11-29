import base64
import os

# Convert images to base64
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Get base64 for all images
images = {
    'run1': 'assets/player_run1.png',
    'run2': 'assets/player_run2.png',
    'jump': 'assets/player_jump.png',
    'meme': 'assets/meme.png'
}

print("// PASTE THIS INTO game.js (replace the image loading section)\n")
print("// Base64 encoded images - much harder to extract!\n")

for key, path in images.items():
    if os.path.exists(path):
        base64_data = image_to_base64(path)
        ext = path.split('.')[-1]
        print(f"images.player{key.capitalize() if key != 'meme' else 'Meme'}.src = 'data:image/{ext};base64,{base64_data}';\n")
    else:
        print(f"// {path} not found!")

print("\n// Copy everything above and replace the image loading section in game.js")

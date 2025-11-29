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

# Create JavaScript file
with open('images-data.js', 'w') as f:
    f.write('// Base64 encoded images - embedded directly in code\n')
    f.write('const BASE64_IMAGES = {\n')
    
    for key, path in images.items():
        if os.path.exists(path):
            base64_data = image_to_base64(path)
            ext = path.split('.')[-1]
            f.write(f"    {key}: 'data:image/{ext};base64,{base64_data}',\n")
        else:
            f.write(f"    // {path} not found!\n")
    
    f.write('};\n')

print("✓ Created images-data.js with base64 encoded images!")
print("✓ Now update game.js to use BASE64_IMAGES instead of loading from assets/")

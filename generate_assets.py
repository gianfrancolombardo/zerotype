import os
from PIL import Image, ImageDraw

def add_corners(im, rad):
    """Adds rounded corners to an image."""
    mask = Image.new('L', im.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0) + im.size, radius=rad, fill=255)
    result = im.copy()
    result.putalpha(mask)
    return result

def generate_assets():
    source_logo = "logo.png"
    if not os.path.exists(source_logo):
        print(f"Error: {source_logo} not found in root.")
        return

    # Define targets: (path, size, should_round)
    targets = [
        ("landing/public/favicon.png", (32, 32), True),
        ("landing/public/favicon-192.png", (192, 192), True),
        ("landing/public/favicon-512.png", (512, 512), True),
        ("landing/public/apple-touch-icon.png", (180, 180), True),
        ("landing/public/logo-nav.png", (128, 128), True),
        ("frontend/public/favicon.png", (32, 32), False),
        ("frontend/assets/icon.png", (512, 512), False),
    ]

    img = Image.open(source_logo)
    
    # Ensure transparency if converting to RGBA
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    for path, size, should_round in targets:
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Resize using Lanczos for high quality
        resized_img = img.resize(size, Image.Resampling.LANCZOS)
        
        if should_round:
            # Rounding radius: ~15% of the size
            radius = int(min(size) * 0.15)
            resized_img = add_corners(resized_img, radius)
            
        resized_img.save(path, "PNG", optimize=True)
        print(f"Generated: {path}")

    # Generate .ico for Windows (usually not rounded unless desired, but we keep it standard)
    ico_path = "frontend/assets/icon.ico"
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    img.save(ico_path, format='ICO', sizes=ico_sizes)
    print(f"Generated: {ico_path}")

if __name__ == "__main__":
    generate_assets()

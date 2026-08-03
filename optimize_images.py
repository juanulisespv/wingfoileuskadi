import os
from PIL import Image

def process_image(filepath, max_width=1600, quality=82):
    if not (filepath.endswith('.png') or filepath.endswith('.jpg') or filepath.endswith('.jpeg')):
        return
    
    # Don't re-process if webp already exists or if it's already a webp
    webp_path = os.path.splitext(filepath)[0] + '.webp'
    
    try:
        with Image.open(filepath) as img:
            # Convert RGBA to RGB with white background if needed, or keep RGBA for webp
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                # WebP supports transparency
                converted = img.convert('RGBA')
            else:
                converted = img.convert('RGB')
            
            # Resize if width exceeds max_width
            width, height = converted.size
            if width > max_width:
                new_height = int((max_width / width) * height)
                converted = converted.resize((max_width, new_height), Image.Resampling.LANCZOS)
                print(f"Resized {filepath}: {width}x{height} -> {max_width}x{new_height}")
            
            converted.save(webp_path, 'WEBP', quality=quality, optimize=True)
            orig_size = os.path.getsize(filepath) / 1024
            new_size = os.path.getsize(webp_path) / 1024
            print(f"Done: {filepath} ({orig_size:.1f} KB) -> {os.path.basename(webp_path)} ({new_size:.1f} KB) [-{100 - (new_size/orig_size*100):.1f}%]")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    base_dir = '/Volumes/SSD/FILUX/_ Herramientas Importantes/FOIL/img'
    
    # Specific logo resize (84px display size -> max 300px for retina quality)
    logo_path = os.path.join(base_dir, 'logo_wingfoileuskadi.png')
    if os.path.exists(logo_path):
        process_image(logo_path, max_width=400, quality=85)
        
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if f.endswith(('.png', '.jpg', '.jpeg')) and not f.startswith('.'):
                full_path = os.path.join(root, f)
                # Max width: 1400px for general site photos
                if f == 'logo_wingfoileuskadi.png':
                    continue # Already processed
                process_image(full_path, max_width=1400, quality=80)

if __name__ == '__main__':
    main()

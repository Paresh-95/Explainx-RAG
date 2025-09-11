import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple

def find_image_references(file_path: str) -> Set[str]:
    """Extract image paths from file content."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    patterns = [
        r'src=[\'"]/([^\'"]+\.(?:jpg|jpeg|png|gif|svg|webp))[\'"]',  # HTML/JSX src
        r'[\'"]/?([^\'"\s]+\.(?:jpg|jpeg|png|gif|svg|webp))[\'"]',   # String literals
        r'import\s+.*?from\s+[\'"]/?([^\'"\s]+\.(?:jpg|jpeg|png|gif|svg|webp))[\'"]'  # imports
    ]
    
    images = set()
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            img_path = match.group(1)
            if not img_path.startswith(('http://', 'https://', 'data:')):
                images.add(img_path)
    
    return images

def scan_directory(base_path: str) -> Tuple[Dict[str, List[str]], Set[str]]:
    """Scan directory for image references and actual images."""
    image_refs: Dict[str, List[str]] = {}  # image path -> list of files referencing it
    actual_images: Set[str] = set()
    
    # Find all images in public directory
    public_dir = os.path.join(base_path, 'public')
    if os.path.exists(public_dir):
        for root, _, files in os.walk(public_dir):
            for file in files:
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp')):
                    rel_path = os.path.relpath(os.path.join(root, file), public_dir)
                    actual_images.add(rel_path)

    # Scan for image references
    exclude_dirs = {'.next', '.turbo', 'node_modules', 'public'}
    for root, dirs, files in os.walk(base_path):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.md', '.mdx')):
                file_path = os.path.join(root, file)
                try:
                    images = find_image_references(file_path)
                    rel_file_path = os.path.relpath(file_path, base_path)
                    
                    for img in images:
                        img = img.lstrip('/')
                        if img not in image_refs:
                            image_refs[img] = []
                        image_refs[img].append(rel_file_path)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    return image_refs, actual_images

def main():
    base_path = 'apps/landing'
    
    print(f"Scanning {base_path}...")
    image_refs, actual_images = scan_directory(base_path)
    
    # Find missing images
    missing_images = {
        img: refs for img, refs in image_refs.items()
        if img not in actual_images
    }
    
    # Output results
    if missing_images:
        print("\nMissing images and their references:")
        for img, refs in missing_images.items():
            print(f"\n{img}:")
            for ref in refs:
                print(f"  - {ref}")
        
        # Save results to JSON
        output = {
            'missing_images': {
                img: refs for img, refs in missing_images.items()
            }
        }
        
        with open('missing_images_report.json', 'w') as f:
            json.dump(output, f, indent=2)
            
        print(f"\nFound {len(missing_images)} missing images.")
        print("Detailed report saved to missing_images_report.json")
    else:
        print("\nNo missing images found!")

if __name__ == '__main__':
    main()
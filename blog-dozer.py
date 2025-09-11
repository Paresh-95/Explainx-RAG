import os
import shutil
from pathlib import Path
from collections import defaultdict
class MigrationSummary:
    def __init__(self):
        self.successful_files = defaultdict(list)
        self.failed_files = defaultdict(list)
        self.existing_files = defaultdict(list)
        
    def add_success(self, file_type, filename):
        self.successful_files[file_type].append(filename)
        
    def add_failure(self, file_type, filename, reason):
        self.failed_files[file_type].append((filename, reason))
        
    def add_existing(self, file_type, filename):
        self.existing_files[file_type].append(filename)
        
    def print_summary(self):
        print("\n=== Migration Summary ===")
        
        print("\nSuccessfully Moved Files:")
        for file_type, files in self.successful_files.items():
            print(f"\n{file_type}:")
            for file in files:
                print(f"  ✓ {file}")
            print(f"  Total: {len(files)}")
            
        print("\nSkipped (Already Existing) Files:")
        for file_type, files in self.existing_files.items():
            print(f"\n{file_type}:")
            for file in files:
                print(f"  ⊙ {file}")
            print(f"  Total: {len(files)}")
            
        print("\nFailed Files:")
        for file_type, files in self.failed_files.items():
            print(f"\n{file_type}:")
            for file, reason in files:
                print(f"  ✗ {file} - {reason}")
            print(f"  Total: {len(files)}")

def move_blog_files(blocks_path, landing_path, summary):
    """Move blog files from blocks to landing structure"""
    block_dirs = [d for d in os.listdir(blocks_path) 
                 if os.path.isdir(os.path.join(blocks_path, d))]
    
    for dir_name in block_dirs:
        if dir_name.startswith('.'):
            continue
            
        source_dir = os.path.join(blocks_path, dir_name)
        target_dir_name = '(en)' if dir_name == 'en' else dir_name
        target_dir = os.path.join(landing_path, 'app/blog/_posts', target_dir_name)
        
        if not os.path.exists(target_dir):
            summary.add_failure('Directories', target_dir, 'Target directory does not exist')
            continue
        
        for file in os.listdir(source_dir):
            if file.endswith('.mdx'):
                source_file = os.path.join(source_dir, file)
                target_file = os.path.join(target_dir, file)
                
                try:
                    if os.path.exists(target_file):
                        summary.add_existing('Blog Posts', f"{dir_name}/{file}")
                        continue
                        
                    shutil.copy2(source_file, target_file)
                    summary.add_success('Blog Posts', f"{dir_name}/{file}")
                except Exception as e:
                    summary.add_failure('Blog Posts', f"{dir_name}/{file}", str(e))

def move_images(blocks_path, landing_path, summary):
    """Move images from blocks to landing public images directory"""
    images_dir = os.path.join(landing_path, 'public/images/blog')
    
    if not os.path.exists(images_dir):
        summary.add_failure('Directories', images_dir, 'Images directory does not exist')
        return
    
    for file in os.listdir(blocks_path):
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
            source_file = os.path.join(blocks_path, file)
            target_file = os.path.join(images_dir, file)
            
            try:
                if os.path.exists(target_file):
                    summary.add_existing('Images', file)
                    continue
                    
                shutil.copy2(source_file, target_file)
                summary.add_success('Images', file)
            except Exception as e:
                summary.add_failure('Images', file, str(e))

def cleanup_blocks(blocks_path, summary):
    """Remove all files from blocks directory after successful migration"""
    try:
        shutil.rmtree(blocks_path)
        print("\nBlocks directory cleaned up successfully")
    except Exception as e:
        print(f"\nFailed to cleanup blocks directory: {str(e)}")

def main():
    blocks_path = 'blocks'
    landing_path = 'apps/landing'
    
    if not os.path.exists(blocks_path):
        print(f"Error: Source directory '{blocks_path}' does not exist")
        return
    
    summary = MigrationSummary()
    
    # Move files
    move_blog_files(blocks_path, landing_path, summary)
    move_images(blocks_path, landing_path, summary)
    
    # Print summary
    summary.print_summary()
    
    # Only cleanup if there were no failures
    if not summary.failed_files:
        cleanup_blocks(blocks_path, summary)
    else:
        print("\nSkipping cleanup due to migration failures")

if __name__ == "__main__":
    main()
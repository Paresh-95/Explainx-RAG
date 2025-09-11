import os
import pathlib

def rename_mdx_files(root_dir):
    # Walk through all directories and files
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            # Check if file ends with .mdx.md
            if file.endswith('.mdx.md'):
                # Create full file paths
                old_path = os.path.join(root, file)
                # Create new filename by replacing .mdx.md with .mdx
                new_filename = file.replace('.mdx.md', '.mdx')
                new_path = os.path.join(root, new_filename)
                
                try:
                    # Rename the file
                    os.rename(old_path, new_path)
                    print(f"Renamed: {old_path} -> {new_path}")
                except Exception as e:
                    print(f"Error renaming {old_path}: {str(e)}")

def main():
    # Define the root directory
    root_dir = 'apps/landing/app/blog/_posts'
    
    # Check if directory exists
    if not os.path.exists(root_dir):
        print(f"Directory not found: {root_dir}")
        return
    
    # Process the files
    rename_mdx_files(root_dir)
    print("Processing complete!")

if __name__ == "__main__":
    main()
import os
import glob

replacements = {
    "Academic": "Athletic",
    "academic": "athletic",
    "Acad Council": "Athletic Council",
    "Acad ": "Athletic ",
    "acad_logo": "athletic_logo",
    "acadLogo": "athleticLogo",
    "r_acad": "r_athletic",
    "ACAD SGT": "ATHLETIC SGT",
    "ACAD CPL": "ATHLETIC CPL",
    "Acad": "Athletic",
}

def process_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        orig_content = content
        for k, v in replacements.items():
            content = content.replace(k, v)
        
        if content != orig_content:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Updated {filepath}")
    except Exception as e:
        print(f"Skipping {filepath}: {e}")

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'venv' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith(('.js', '.jsx', '.html', '.json', '.md', '.css')):
            process_file(os.path.join(root, file))

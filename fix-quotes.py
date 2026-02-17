#!/usr/bin/env python3
import os
import glob

def fix_curly_quotes(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    # Replace curly apostrophes and quotes with straight ones
    content = content.replace('\u2018', "'")  # Left single quote
    content = content.replace('\u2019', "'")  # Right single quote
    content = content.replace('\u201C', '"')  # Left double quote
    content = content.replace('\u201D', '"')  # Right double quote
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed: {filepath}')

# Find all .ts and .tsx files
for pattern in ['**/*.ts', '**/*.tsx']:
    for filepath in glob.glob(pattern, recursive=True):
        if 'node_modules' not in filepath and '.next' not in filepath:
            fix_curly_quotes(filepath)
            
print('Done fixing curly quotes')

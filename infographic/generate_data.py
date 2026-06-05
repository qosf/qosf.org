#!/usr/bin/env python3
"""Read projects.yaml and generate projects-data.js."""
import json, os, sys, yaml

YAML_FILE = 'projects.yaml'
OUTPUT_FILE = 'projects-data.js'
IMG_DIR = 'images'

def find_image(key):
    if not os.path.isdir(IMG_DIR):
        return f'images/{key}.svg'
    for f in os.listdir(IMG_DIR):
        if f.startswith(key + '.'):
            return f'images/{f}'
    return f'images/{key}.svg'

with open(YAML_FILE) as f:
    raw = yaml.safe_load(f)

projects = {}
for key, p in raw['projects'].items():
    projects[key] = {
        'id': key,
        'name': p.get('name', key),
        'ecosystem_role': p.get('ecosystem_role', ''),
        'type': p.get('type', ''),
        'category': p.get('category', p.get('type', '')),
        'hardware_backends': p.get('hardware_backends', []),
        'img': find_image(key),
    }

relationships = raw.get('relationships', {})

output = (
    '// Auto-generated from projects.yaml\n'
    'const PROJECTS_DATA = ' +
    json.dumps(projects, indent=2, ensure_ascii=False) +
    ';\n\n'
    'const RELATIONSHIPS_DATA = ' +
    json.dumps(relationships, indent=2, ensure_ascii=False) +
    ';\n'
)

with open(OUTPUT_FILE, 'w') as f:
    f.write(output)

print(f"Generated {OUTPUT_FILE} ({len(projects)} projects, {sum(len(v) for v in relationships.values())} rel entries)")

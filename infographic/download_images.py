#!/usr/bin/env python3
"""Download project logos from projects.yaml into images/ directory."""

import os
import sys
import urllib.request
import urllib.error
import yaml

YAML_FILE = 'projects.yaml'
IMG_DIR = 'images'

def get_mime_type(url):
    """Guess MIME type from URL."""
    url_lower = url.lower()
    if url_lower.endswith('.svg'):
        return 'image/svg+xml'
    elif url_lower.endswith('.png'):
        return 'image/png'
    elif url_lower.endswith('.jpg') or url_lower.endswith('.jpeg'):
        return 'image/jpeg'
    elif url_lower.endswith('.gif'):
        return 'image/gif'
    elif url_lower.endswith('.webp'):
        return 'image/webp'
    return None

def download_image(url, output_path):
    """Download image from URL, return True on success."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; QOSF-Infographic/1.0)'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) == 0:
                print(f"  ✗ Empty response")
                return False
            with open(output_path, 'wb') as f:
                f.write(data)
            print(f"  ✓ Saved ({len(data)} bytes)")
            return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    # Load YAML
    if not os.path.exists(YAML_FILE):
        print(f"Error: {YAML_FILE} not found")
        sys.exit(1)

    with open(YAML_FILE, 'r') as f:
        data = yaml.safe_load(f)

    projects = data.get('projects', {})
    if not projects:
        print("Error: no projects found in YAML")
        sys.exit(1)

    # Create images directory
    os.makedirs(IMG_DIR, exist_ok=True)

    print(f"Downloading {len(projects)} project logos to '{IMG_DIR}/'...\n")

    success_count = 0
    for key, proj in projects.items():
        logo = proj.get('logo', {})
        url = logo.get('logo_url') or logo.get('fallback_url')
        fmt = (logo.get('format') or '').lower()

        if not url:
            print(f"  [{key}] No logo URL found, skipping")
            continue

        # Determine extension
        ext = 'svg'  # default
        if fmt == 'png' or '.png' in url.lower():
            ext = 'png'
        elif fmt == 'jpg' or '.jpg' in url.lower() or '.jpeg' in url.lower():
            ext = 'jpg'
        elif fmt == 'gif' or '.gif' in url.lower():
            ext = 'gif'
        elif fmt == 'webp' or '.webp' in url.lower():
            ext = 'webp'

        output_path = os.path.join(IMG_DIR, f"{key}.{ext}")

        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            print(f"  [{key}] Already exists, skipping")
            success_count += 1
            continue

        print(f"  [{key}] Downloading {url}")
        if download_image(url, output_path):
            success_count += 1
        else:
            # Try fallback
            fallback = logo.get('fallback_url')
            alt_url = logo.get('alternate_url')
            for fb in [fallback, alt_url]:
                if fb and fb != url:
                    print(f"  [{key}] Trying fallback: {fb}")
                    if download_image(fb, output_path):
                        success_count += 1
                        break

    print(f"\nDone! {success_count}/{len(projects)} images downloaded successfully.")

if __name__ == '__main__':
    main()

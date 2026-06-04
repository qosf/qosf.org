#!/usr/bin/env python3
"""Tiny zero-dep HTTP server for the quantum ecosystem infographic.

Usage:
    python3 serve.py          # serves on http://localhost:8080
    python3 serve.py 9090     # serves on a custom port
"""

import http.server
import os
import subprocess
import sys
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIR = Path(__file__).parent

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """Log only errors, not every request."""
    def log_message(self, fmt, *args):
        # args = (request_line, status_code, size)
        # Only log errors (status >= 400)
        if len(args) >= 2:
            try:
                if int(args[1]) >= 400:
                    super().log_message(fmt, *args)
            except (ValueError, IndexError):
                pass

    def guess_type(self, path):
        """Ensure correct MIME types for important file extensions."""
        if path.endswith('.svg'):
            return 'image/svg+xml'
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.mjs'):
            return 'application/javascript'
        return super().guess_type(path)

def main():
    os.chdir(DIR)

    server = http.server.HTTPServer(('0.0.0.0', PORT), QuietHandler)
    url = f'http://localhost:{PORT}'

    # Try to open browser (works on WSL if 'wslview' or 'cmd.exe' is available)
    for opener in ['wslview', 'cmd.exe /c start', 'xdg-open', 'open']:
        try:
            subprocess.Popen(f'{opener} {url}'.split(), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            break
        except FileNotFoundError:
            continue

    print(f'╔══════════════════════════════════════════╗')
    print(f'║   Quantum Ecosystem Infographic          ║')
    print(f'╠══════════════════════════════════════════╣')
    print(f'║  Open in your browser:                   ║')
    print(f'║                                          ║')
    print(f'║  →  {url:<31s}║')
    print(f'║                                          ║')
    print(f'║  Press Ctrl+C to stop the server         ║')
    print(f'╚══════════════════════════════════════════╝')
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
        server.server_close()

if __name__ == '__main__':
    main()

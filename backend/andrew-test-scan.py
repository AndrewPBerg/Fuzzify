import requests
import json
import dnstwist
import time
import subprocess
import os


# data = dnstwist.run(domain='domain.name', registered=True, format='null')
# print(data)

root_domain = 'googel.com'
mode = 'phash'
if mode == 'phash':
    command = [
        'dnstwist', 
        '--phash', 
        '--mx', 
        '--banner', 
        '--format', 'json',
        f'https://{root_domain}'
    ]
else:  # lsh mode
    command = [
        'dnstwist',
        '--lsh', 'tlsh',
        '--phash',
        '--mx',
        '--registered',
        '--banner',
        '--format', 'json',
        root_domain
    ]

try:
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    print(result.stdout)
except subprocess.CalledProcessError as e:
    print(f"Error occurred: {e.stderr}")

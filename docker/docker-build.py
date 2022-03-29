#!/usr/bin/env python3

import argparse
import os
import shutil
import requests
import sys
import json
from pathlib import Path

## Configure command-line options
parser = argparse.ArgumentParser()
parser.add_argument('action', help="Action to execute", choices=["build", "push", "delete"], default="build")
parser.add_argument('--organisation', help="Organisation, e.g. opencb", default="opencb")
parser.add_argument('--images', help="comma separated list of images to be made, e.g. app", default="app")
parser.add_argument('--tag', help="the tag for this code, e.g. v2.0.0")
parser.add_argument('--build-folder', help="the location of the build folder, if not default location")
parser.add_argument('--username', help="credentials for dockerhub (REQUIRED if deleting from DockerHub)")
parser.add_argument('--password', help="credentials for dockerhub (REQUIRED if deleting from DockerHub)")

## Some ANSI colors to print shell output
shell_colors = {
    'red': '\033[91m',
    'green': '\033[92m',
    'blue': '\033[94m',
    'magenta': '\033[95m',
    'bold': '\033[1m',
    'reset': '\033[0m'
}

def error(message):
    sys.stderr.write(shell_colors['red'] + 'ERROR: %s\n' % message + shell_colors['reset'])
    sys.exit(2)

def run(command):
    print(shell_colors['bold'] + command + shell_colors['reset'])
    code = os.system(command)
    if code != 0:
        error("Error executing: " + command)

def print_header(str):
    print(shell_colors['magenta'] + "*************************************************" + shell_colors['reset'])
    print(shell_colors['magenta'] + str + shell_colors['reset'])
    print(shell_colors['magenta'] + "*************************************************" + shell_colors['reset'])

def package_json():
    basedir = str(Path(__file__).resolve().parents[1])
    p = Path(basedir + "/package.json")
    with open(p, "r") as package_json:
        data=package_json.read()
    return json.loads(data)

# def login(loginRequired=False):
#     if args.username is None or args.password is None:
#         if loginRequired:
#             error("Username and password are required")
#         else:
#             return
#
#     code = os.system("docker login -u " + args.username + " --password " + args.password)
#     if code != 0:
#         error("Error executing: docker login")


def build():
    print_header('Building docker images: ' + ', '.join(images))

    ## IMPORTANT: we cannot build Docker images using directories outside the file context.
    ## A simple solution is to copy 'custom-sites' into 'build' folder and the run 'docker build' from there.
    if os.path.exists('custom-sites'):
        print(shell_colors['blue'] + "Copying 'custom-sites' folder into 'build' ...\n" + shell_colors['reset'])
        shutil.rmtree("build/custom-sites", ignore_errors=True)
        shutil.copytree("custom-sites", "build/custom-sites")

    for image in images:
        if image == "app":
            site = "src/sites"
        else:
            ## We must create 'img' if not exist, otherwise Dockerfile build will fail
            Path("build/custom-sites/" + image + "/iva/img").mkdir(exist_ok=True)
            site = "build/custom-sites" + "/" + image

        print(shell_colors['blue'] + "Building " + organisation + "/iva-" + image + ":" + tag + " ..." + shell_colors['reset'])
        run("docker build -t " + organisation + "/iva-" + image + ":" + tag + " --build-arg SITE=" + site + " -f " + build_folder + "/docker/iva-app/Dockerfile " + build_folder)

def tag_latest(image):
    latest_tag = os.popen(("curl -s https://registry.hub.docker.com/v1/repositories/" + organisation + "/iva-" + image + "/tags"
                           + " | jq -r .[].name"
                           + " | grep -v latest"
                           + " | sort -h"
                           + " | head"))
    if tag >= latest_tag.read():
        print(shell_colors['blue'] + "Pushing " + organisation + "/iva-" + image + ":latest" + shell_colors['reset'])
        run("docker tag " + organisation + "/iva-" + image + ":" + tag + " " + organisation + "/iva-" + image + ":latest")
        run("docker push " + organisation + "/iva-" + image + ":latest")


def push():
    print_header('Pushing to DockerHub: ' + ', '.join(images))
    for image in images:
        print()
        print(shell_colors['blue'] + "Pushing " + organisation + "/iva-" + image + ":" + tag + " ..." + shell_colors['reset'])
        run("docker push " + organisation + "/iva-" + image + ":" + tag)
        tag_latest(image)


def delete():
    print_header('Deleting from DockerHub: ' + ', '.join(images))
    if args.username is None or args.password is None:
        error("Username and password are required")
    headers = {
        'Content-Type': 'application/json',
    }
    data = '{"username": "' + args.username + '", "password": "' + args.password + '"}'
    response = requests.post('https://hub.docker.com/v2/users/login/', headers=headers, data=data)
    json_response = json.loads(response.content)
    if response.status_code != 200:
        error("dockerhub login failed")
    for i in images:
        print()
        print(shell_colors['blue'] + "Deleting image on Docker hub for " + organisation + "/iva-" + i + ":" + tag + shell_colors['reset'])
        headers = {
            'Authorization': 'JWT ' + json_response["token"]
        }
        requests.delete("https://hub.docker.com/v2/repositories/" + organisation + "/iva-" + i + "/tags/" + tag + "/", headers=headers)


## Parse command-line parameters and init basedir, tag and build_folder
args = parser.parse_args()

# 1. init basedir: root of the iva repo
basedir = str(Path(__file__).resolve().parents[1])

# 2. init tag: set tag to default value if not set
if args.organisation is not None:
    organisation = args.organisation
else:
    organisation = "opencb"

# 2. init tag: set tag to default value if not set
if args.tag is not None:
    tag = args.tag
else:
    tag = package_json()["version"]

# 3. init build_folder: set build folder to default value if not set
if args.build_folder is not None:
    build_folder = args.build_folder
else:
    build_folder = basedir

if not os.path.isdir(build_folder):
    error("Build folder does not exist: " + build_folder)

# 4. init images: get a list with all images
if args.images is None:
    images = ["app"]
elif args.images == "all":
    if not os.path.isdir('custom-sites'):
        error("Custom sites folder does not exist (required if images is set to 'all')")
    # Get all folders in 'custom-sites'
    images = [d for d in os.listdir("custom-sites") if os.path.isdir(os.path.join("custom-sites", d)) and not d.startswith(".")]
else:
    images = args.images.split(",")


## Execute the action
if args.action == "build":
    # login(loginRequired=False)
    build()
elif args.action == "push":
    # login(loginRequired=False)
    build()
    push()
elif args.action == "delete":
    delete()
else:
    error("Unknown action: " + args.action)

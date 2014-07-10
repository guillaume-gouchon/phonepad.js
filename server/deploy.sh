#!/bin/bash

# Get last version
git checkout .;
git pull;

# Restart server
sudo forever stop phonepad;
sudo forever --uid "phonepad" -a -l node.log -o node.log -e node.log start app.js;

#!/bin/bash

# Get last version
git checkout .;
git pull;

# Restart server
sudo forever stop phonepad;
sudo forever --uid "phonepad" -a -l phonepad.log -o phonepad.log -e phonepad.log start app.js;

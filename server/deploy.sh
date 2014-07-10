#!/bin/bash
git checkout .;
git pull;

# Restart server
sudo forever stop machines;
sudo forever --uid "machines" -a -l node.log -o node.log -e node.log start app.js;

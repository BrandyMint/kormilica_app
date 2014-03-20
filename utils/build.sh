#!/bin/sh

npm install
bower install --force
./node_modules/.bin/grunt version
./node_modules/.bin/grunt build

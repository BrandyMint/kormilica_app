#!/bin/sh

git branch -D build
git checkout -b build
./build
git add .
git commit -am 'lib build'
git push -f origin build:build

#!/bin/sh

mkdir dist
git branch -D build
git checkout -b build
./build
git add .
git commit -am 'build lib'
git push -f origin build:build

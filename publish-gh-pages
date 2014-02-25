#!/usr/bin/env bash

git branch -D gh-pages
git checkout --orphan gh-pages
git rm -rf .
git clean -fd -e dist
shopt -s dotglob
mv dist/* ./
rmdir dist
git add .
git commit -am 'build gh-pages'
git push -u -f origin gh-pages:gh-pages


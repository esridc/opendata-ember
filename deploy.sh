#!/bin/bash
git branch -D gh-pages
git push origin --delete gh-pages
git checkout -b gh-pages
ember build --environment production
git rm -rf app config tests
git rm -rf ember-cli-build.js bower.json package.json testem.json
git rm -rf .bowerrc .editorconfig .jshintrc .travis.yml
mv dist/* .
rm -rf dist
git add .
git commit -m "deploy to gh-pages"
git push origin gh-pages
git checkout master

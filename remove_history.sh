#! /usr/bin/env bash

git pull
git checkout --orphan latest_branch
git add -A
git commit -am "Squash history"
git branch -D master
git branch -m master
git push --force --set-upstream origin master
git gc --aggressive
git gc --prune=all

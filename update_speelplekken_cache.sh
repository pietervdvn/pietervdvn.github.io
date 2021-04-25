#! /bin/bash

cd /home/pietervdvn/git/pietervdvn.github.io
rm speelplekken_cache/*.json
cd ../MapComplete
git pull
npm run generate:cache:speelplekken

cd ../pietervdvn.github.io
git pull
git commit -am "Update of the speelplekken cache"

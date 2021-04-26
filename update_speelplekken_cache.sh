#! /bin/bash
echo "cd pietervdvn.github.io"
date
whoami
cd /home/pietervdvn/git/pietervdvn.github.io
rm speelplekken_cache/*.json
cd ../MapComplete
git pull
echo "Starting the caching script"
npm run generate:cache:speelplekken
echo "Caching done, commiting now"
cd ../pietervdvn.github.io
git status
git pull
git commit -am "Update of the speelplekken cache"
echo "All done!"

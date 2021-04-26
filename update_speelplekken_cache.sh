#! /bin/bash
echo "cd pietervdvn.github.io"
cd /home/pietervdvn/git/pietervdvn.github.io
rm speelplekken_cache/*.json
cd ../MapComplete
git pull
echo "Starting the caching script"
npm run generate:cache:speelplekken
echo "Caching done, commiting now"
cd ../pietervdvn.github.io
git pull
git commit -am "Update of the speelplekken cache"
echo "All done!"

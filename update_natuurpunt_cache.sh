#! /bin/bash
echo "cd pietervdvn.github.io"
date
whoami
PATH=/home/pietervdvn/.local/bin:/home/pietervdvn/.nvm/versions/node/v16.0.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/pietervdvn/.dotnet/tools
# rm speelplekken_cache/*.json
cd ../MapComplete
# git pull # The CD-script should be doing the pull and deploying!
echo "Starting the caching script"
npm run generate:cache:natuurpunt
echo "Caching done, commiting now"
cd ../pietervdvn.github.io
git status
git pull
git add *
git commit -am "Update of the speelplekken cache"
git push
echo "All done!"

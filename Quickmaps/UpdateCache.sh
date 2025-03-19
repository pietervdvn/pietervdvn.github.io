#! /bin/bash

function update { # search area, relId, tags
    mkdir "$1"
    cd "$1"
    pwd
    QUERY="[out:json][timeout:25];area($2)->.searchArea;(node$3(area.searchArea);way$3(area.searchArea);relation$3(area.searchArea););out body;>;out skel qt;"
    wget -O "$3.json" "https://overpass-api.de/api/interpreter?data=$QUERY"
    cd ..
    sleep 10

}



echo "Updating map..."
date

cd cache

#update Name    Relation-ID, prefixed with 3600 (should be equal length)
update "West-Vlaanderen" "3600416271" '["name"="De Leiemeersen"]["leisure"="nature_reserve"]'

update "De Leiemeersen" "3609118029" '["natural"]'
update "Brugge" "3600562654" '["amenity"="public_bookcase"]'
update "Belgie" "3600052411" '["amenity"="public_bookcase"]'

update "Brugge" "3600562654" '["leisure"="nature_reserve"]["operator"="Natuurpunt Brugge"]'
update "Brugge" "3600562654" '["tourism"="information"]["operator"="Natuurpunt Brugge"]'
update "Brugge" "3600562654" '["leisure"="bird_hide"]["operator"="Natuurpunt Brugge"]'

update "Gent"   "3602524008" '["natural"="tree"]["species"]'
update "Gent"   "3602524008" '["natural"="tree"]["species:nl"]'
update "Gent"   "3602524008" '["landuse"="orchard"]'

update "Belgie" "3600052411" '["religion"="muslim"]'







git add .
git commit -m "Update of the cache"
git push

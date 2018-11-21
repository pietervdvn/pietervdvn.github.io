#! /bin/bash

wget -O  Natuurgebieden.json 'https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["operator"="Natuurpunt Brugge"]["leisure"="nature_reserve"](49.5,2.367,51.683,6.4);way["operator"="Natuurpunt Brugge"]["leisure"="nature_reserve"](49.5,2.367,51.683,6.4);relation["operator"="Natuurpunt Brugge"]["leisure"="nature_reserve"](49.5,2.367,51.683,6.4););out body;>;out skel qt;'

git add Natuurgebieden.json
git commit -m "Update of cache"
git push

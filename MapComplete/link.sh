#! /bin/bash

for f in ./*.html
do
    echo "$f"
    cat redirect.txt > $f
done

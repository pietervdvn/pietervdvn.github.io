#! /bin/bash
echo "Copying routing.xml"
adb push ../routing.xml /sdcard/Android/data/net.osmand.plus/files
echo "Copying rendering"
adb push default.render.xml /sdcard/Android/data/net.osmand.plus/files/rendering

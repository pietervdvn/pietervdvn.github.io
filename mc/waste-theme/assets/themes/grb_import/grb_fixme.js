parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"eyml":[function(require,module,exports) {
module.exports={id:"grb_fixme",title:{nl:"GRB Fixup"},shortDescription:{nl:"Grb Fixup"},description:{nl:"Gebouwen met een FIXME - wss GRB-import die gefixed moeten worden"},language:["nl","en"],maintainer:"",icon:"./assets/svg/bug.svg",version:"0",startLat:51.2132,startLon:3.231,startZoom:14,widenFactor:2,socialImage:"",clustering:{maxZoom:15},overrideAll:{source:{maxCacheAge:0}},layers:[{id:"osm-buildings-fixme",name:"OSM-buildings with a fixme",source:{osmTags:{and:["building~*","fixme~*"]},maxCacheAge:0},calculatedTags:["_grbNumber=(feat.properties.fixme?.match(/GRB thinks that this has number ([0-9a-zA-Z;]+)/) ?? ['','none']) [1]"],mapRendering:[{width:{render:"2",mappings:[{if:"fixme~*",then:"5"}]},color:{render:"#00c",mappings:[{if:"fixme~*",then:"#ff00ff"},{if:"building=house",then:"#a00"},{if:"building=shed",then:"#563e02"},{if:{or:["building=garage","building=garages"]},then:"#f9bfbb"},{if:"building=yes",then:"#0774f2"}]}},{location:["point","centroid"],label:{mappings:[{if:"addr:housenumber~*",then:"<div style='background-color: white; font: large; width: 1.5em; height: 1.5em; border-radius: 100%'>{addr:housenumber}</div>"}]},iconSize:{render:"40,40,center"}}],title:"OSM-gebouw",tagRenderings:[{id:"building type",freeform:{key:"building"},render:"The building type is <b>{building}</b>",question:{en:"What kind of building is this?"},mappings:[{if:"building=house",then:"A normal house"},{if:"building=detached",then:"A house detached from other building"},{if:"building=semidetached_house",then:"A house sharing only one wall with another house"},{if:"building=apartments",then:"An apartment building - highrise for living"},{if:"building=office",then:"An office building - highrise for work"},{if:"building=apartments",then:"An apartment building"},{if:"building=shed",then:"A small shed, e.g. in a garden"},{if:"building=garage",then:"A single garage to park a car"},{if:"building=garages",then:"A building containing only garages; typically they are all identical"},{if:"building=yes",then:"A building - no specification"}]},{id:"grb-housenumber",render:{nl:"Het huisnummer is <b>{addr:housenumber}</b>"},question:{nl:"Wat is het huisnummer?"},freeform:{key:"addr:housenumber"},mappings:[{if:{and:["not:addr:housenumber=yes","addr:housenumber="]},then:{nl:"Geen huisnummer"}},{if:{and:["addr:housenumber:={_grbNumber}","fixme="]},then:"Het huisnummer is <b>{_grbNumber}</b>, wat overeenkomt met het GRB",hideInAnswer:{or:["_grbNumber=","_grbNumber=none","_grbNumber=no number"]}},{if:{and:["addr:housenumber=","not:addr:housenumber=yes","fixme="]},then:"Dit gebouw heeft geen nummer, net zoals in het GRB",hideInAnswer:"_grbNumber!=no number"}]},{id:"grb-unit",question:"Wat is de wooneenheid-aanduiding?",render:{nl:"De wooneenheid-aanduiding is <b>{addr:unit}</b> "},freeform:{key:"addr:unit"},mappings:[{if:"addr:unit=",then:"Geen wooneenheid-nummer"}]},{id:"grb-street",render:{nl:"De straat is <b>{addr:street}</b>"},freeform:{key:"addr:street"},question:{nl:"Wat is de straat?"}},{id:"grb-fixme",render:{nl:"De fixme is <b>{fixme}</b>"},question:{nl:"Wat zegt de fixme?"},freeform:{key:"fixme"},mappings:[{if:{and:["fixme="]},then:{nl:"Geen fixme"}}]},{id:"grb-min-level",render:{nl:"Dit gebouw begint maar op de {building:min_level} verdieping"},question:{nl:"Hoeveel verdiepingen ontbreken?"},freeform:{key:"building:min_level",type:"pnat"}},{id:"fix_verdieping",render:"{tag_apply(fixme=;building:min_level=1,De eerste verdieping ontbreekt)}",condition:"fixme=verdieping, correct the building tag, add building:level and building:min_level before upload in JOSM!"},"all_tags"],minzoom:14},{builtin:"address",override:{minzoom:18}},{builtin:"crab_address",override:{minzoom:18,"+tagRenderings":[{id:"import-button",render:"{import_button(address, addr:street=$STRAATNM; addr:housenumber=$HUISNR,Import this address)}"}]}}],hideFromOverview:!0,defaultBackgroundId:"AGIVFlandersGRB",overpassMaxZoom:15,osmApiTileSize:17};
},{}]},{},["eyml"], null)
//# sourceMappingURL=assets/themes/grb_import/grb_fixme.js.map
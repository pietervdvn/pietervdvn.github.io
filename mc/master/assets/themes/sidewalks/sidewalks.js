parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"TNpq":[function(require,module,exports) {
module.exports={id:"sidewalks",title:{en:"Sidewalks",ru:"Тротуары"},shortDescription:{en:"Sidewalk mapping"},description:{en:"Experimental theme",ru:"Экспериментальная тема"},language:["en","ru"],maintainer:"",icon:"./assets/svg/bug.svg",version:"0",startLat:0,startLon:0,startZoom:1,widenFactor:.05,socialImage:"",hideFromOverview:!0,layers:[{id:"sidewalks",name:{en:"Sidewalks",ru:"Тротуары"},minzoom:12,source:{osmTags:{or:["highway=residential","highway=unclassified","highway=tertiary","highway=secondary"]}},title:{render:{en:"{name}",ru:"{name}"},mappings:[{if:"name=",then:"Nameless street"}]},description:{en:"Layer showing sidewalks of highways"},tagRenderings:[{id:"streetname",render:{en:"This street is named {name}"}},{rewrite:{sourceString:"left|right",into:["left","right"]},renderings:[{id:"sidewalk_minimap",render:"{sided_minimap(left|right):height:8rem;border-radius:0.5rem;overflow:hidden}"},{id:"has_sidewalk",question:"Is there a sidewalk on this side of the road?",mappings:[{if:"sidewalk:left|right=yes",then:"Yes, there is a sidewalk on this side of the road"},{if:"sidewalk:left|right=no",then:"No, there is no seperated sidewalk to walk on"}]},{id:"sidewalk_width",question:"What is the width of the sidewalk on this side of the road?",render:"This sidewalk is {sidewalk:left|right:width}m wide",condition:"sidewalk:left|right=yes",freeform:{key:"sidewalk:left|right:width",type:"length",helperArgs:["21","map"]}}]}],mapRendering:[{location:["start","end"],icon:"circle:#ccc",iconSize:"3,3,center"},{"#":"The center line",color:"#ffffff55",width:8,lineCap:"butt"},{"#":"left",color:{render:"#888"},dashArray:{render:"",mappings:[{if:"sidewalk:left=",then:"1,12"}]},width:{render:6,mappings:[{if:{or:["sidewalk:left=no","sidewalk:left=separate"]},then:0}]},offset:-6,lineCap:"butt"},{color:"#888",dashArray:{render:"",mappings:[{if:"sidewalk:right=",then:"1,12"}]},width:{render:6,mappings:[{if:{or:["sidewalk:right=no","sidewalk:right=separate"]},then:0}]},lineCap:"butt",offset:6}],allowSplit:!0}]};
},{}]},{},["TNpq"], null)
//# sourceMappingURL=assets/themes/sidewalks/sidewalks.js.map
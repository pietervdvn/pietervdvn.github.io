parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"W5u2":[function(require,module,exports) {
module.exports={id:"extinguisher",name:{en:"Map of fire extinguishers.",ja:"消火器の地図です。",nb_NO:"Kart over brannhydranter",ru:"Карта огнетушителей.",fr:"Couche des extincteurs.",de:"Karte mit Feuerlöschern.",it:"Cartina degli estintori."},minzoom:14,source:{osmTags:{and:["emergency=fire_extinguisher"]}},title:{render:{en:"Extinguishers",ru:"Огнетушители",ja:"消火器",nb_NO:"Brannslokkere",fr:"Exctincteurs",de:"Feuerlöscher",it:"Estintori"}},description:{en:"Map layer to show fire hydrants.",ja:"消火栓を表示するマップレイヤ。",zh_Hant:"顯示消防栓的地圖圖層。",nb_NO:"Kartlag for å vise brannslokkere.",ru:"Слой карты, отображающий огнетушители.",fr:"Couche des lances à incendie.",de:"Kartenebene zur Anzeige von Hydranten.",it:"Livello della mappa che mostra gli idranti antincendio."},tagRenderings:[{id:"extinguisher-location",render:{en:"Location: {location}",ja:"場所:{location}",ru:"Местоположение: {location}",fr:"Emplacement : {location}",de:"Standort: {location}",eo:"Loko: {location}",it:"Posizione: {location}"},question:{en:"Where is it positioned?",ja:"どこにあるんですか?",ru:"Где это расположено?",fr:"Où est-elle positionnée ?",de:"Wo befindet er sich?",it:"Dove è posizionato?"},mappings:[{if:{and:["location=indoor"]},then:{en:"Found indoors.",ja:"屋内にある。",ru:"Внутри.",fr:"Intérieur.",de:"Im Innenraum vorhanden.",it:"Si trova all’interno."}},{if:{and:["location=outdoor"]},then:{en:"Found outdoors.",ja:"屋外にある。",ru:"Снаружи.",fr:"Extérieur.",de:"Im Außenraum vorhanden.",it:"Si trova all’esterno."}}],freeform:{key:"location"}},"images"],presets:[{tags:["emergency=fire_extinguisher"],title:{en:"Fire extinguisher",ja:"消火器",nb_NO:"Brannslukker",ru:"Огнетушитель",fr:"Extincteur",de:"Feuerlöscher",it:"Estintore"},description:{en:"A fire extinguisher is a small, portable device used to stop a fire",ja:"消火器は、火災を止めるために使用される小型で携帯可能な装置である",ru:"Огнетушитель - небольшое переносное устройство для тушения огня",fr:"Un extincteur est un appareil portatif servant à éteindre un feu",de:"Ein Feuerlöscher ist ein kleines, tragbares Gerät, das dazu dient, ein Feuer zu löschen",it:"Un estintore è un dispositivo portatile di piccole dimensioni usato per spegnere un incendio"}}],mapRendering:[{icon:{render:"./assets/themes/hailhydrant/Twemoji12_1f9ef.svg"},iconSize:{render:"20,20,center"},location:["point","centroid"]}]};
},{}]},{},["W5u2"], null)
//# sourceMappingURL=assets/layers/extinguisher/extinguisher.js.map
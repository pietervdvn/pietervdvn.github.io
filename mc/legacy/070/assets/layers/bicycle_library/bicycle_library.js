parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"vu1m":[function(require,module,exports) {
module.exports={id:"bicycle_library",name:{en:"Bicycle library",nl:"Fietsbibliotheek",fr:"Vélothèque",it:"Bici in prestito",ru:"Велосипедная библиотека",zh_Hant:"單車圖書館"},minzoom:8,source:{osmTags:"amenity=bicycle_library"},title:{render:{en:"Bicycle library",nl:"Fietsbibliotheek",fr:"Vélothèque",it:"Bici in prestito",ru:"Велосипедная библиотека",zh_Hant:"單車圖書館"},mappings:[{if:"name~*",then:"<i>{name}</i>"}]},titleIcons:[{condition:{or:["service:bicycle:pump=yes","service:bicycle:pump=separate"]},render:"<img src='./assets/layers/bike_shop/pump.svg'/>"},"defaults"],description:{en:"A facility where bicycles can be lent for longer period of times",nl:"Een plaats waar men voor langere tijd een fiets kan lenen",fr:"Un lieu où des vélos peuvent être empruntés pour un temps plus long",hu:"Létesítmény, ahonnan kerékpár kölcsönözhető hosszabb időre",it:"Una struttura dove le biciclette possono essere prestate per periodi di tempo più lunghi",de:"Eine Einrichtung, in der Fahrräder für längere Zeit geliehen werden können",ru:"Учреждение, где велосипед может быть арендован на более длительный срок",zh_Hant:"能夠長期租用單車的設施"},tagRenderings:["images",{question:{en:"What is the name of this bicycle library?",nl:"Wat is de naam van deze fietsbieb?",fr:"Quel est le nom de cette vélothèque ?",it:"Qual è il nome di questo “bici in prestito”?",ru:"Как называется эта велосипедная библиотека?",nb_NO:"Hva heter dette sykkelbiblioteket?",zh_Hant:"這個單車圖書館的名稱是？"},render:{en:"This bicycle library is called {name}",nl:"Deze fietsbieb heet {name}",fr:"Cette vélothèque s'appelle {name}",it:"Il “bici in prestito” è chiamato {name}",ru:"Эта велосипедная библиотека называется {name}",nb_NO:"Dette sykkelbiblioteket heter {name}",zh_Hant:"這個單車圖書館叫做 {name}"},freeform:{key:"name"}},"website","phone","email","opening_hours",{question:{en:"How much does lending a bicycle cost?",nl:"Hoeveel kost het huren van een fiets?",fr:"Combien coûte l'emprunt d'un vélo ?",hu:"Mennyibe kerül egy kerékpár kölcsönzése?",it:"Quanto costa il prestito di una bicicletta?",ru:"Сколько стоит прокат велосипеда?",de:"Wie viel kostet das Ausleihen eines Fahrrads?",nb_NO:"Hvor mye koster det å leie en sykkel?",zh_Hant:"租用單車的費用多少？"},render:{en:"Lending a bicycle costs {charge}",nl:"Een fiets huren kost {charge}",fr:"Emprunter un vélo coûte {charge}",hu:"Egy kerékpár kölcsönzése {charge}",it:"Il prestito di una bicicletta costa {charge}",ru:"Стоимость аренды велосипеда {charge}",de:"Das Ausleihen eines Fahrrads kostet {charge}",nb_NO:"Sykkelleie koster {charge}",zh_Hant:"租借單車需要 {charge}"},freeform:{key:"charge",addExtraTags:["fee=yes"]},mappings:[{if:{and:["fee=no","charge="]},then:{en:"Lending a bicycle is free",nl:"Een fiets huren is gratis",fr:"L'emprunt de vélo est gratuit",hu:"A kerékpárkölcsönzés ingyenes",it:"Il prestito di una bicicletta è gratuito",de:"Das Ausleihen eines Fahrrads ist kostenlos",ru:"Прокат велосипедов бесплатен",nb_NO:"Det er gratis å leie en sykkel",zh_Hant:"租借單車免費"}},{if:{and:["fee=yes","charge=€20warranty + €20/year"]},then:{en:"Lending a bicycle costs €20/year and €20 warranty",nl:"Een fiets huren kost €20/jaar en €20 waarborg",fr:"Emprunter un vélo coûte 20 €/an et 20 € de garantie",it:"Il prestito di una bicicletta costa 20 €/anno più 20 € di garanzia",de:"Das Ausleihen eines Fahrrads kostet 20€ pro Jahr und 20€ Gebühr",zh_Hant:"租借單車價錢 €20/year 與 €20 保證金"}}]},{question:{en:"Who can lend bicycles here?",nl:"Voor wie worden hier fietsen aangeboden?",fr:"Qui peut emprunter des vélos ici ?",hu:"Ki kölcsönözhet itt kerékpárt?",it:"Chi può prendere in prestito le biciclette qua?",zh_Hans:"谁可以从这里借自行车？",de:"Wer kann hier Fahrräder ausleihen?",ru:"Кто здесь может арендовать велосипед?",zh_Hant:"誰可以在這裡租單車？"},multiAnswer:!0,mappings:[{if:"bicycle_library:for=child",then:{nl:"Aanbod voor kinderen",en:"Bikes for children available",fr:"Vélos pour enfants disponibles",hu:"",it:"Sono disponibili biciclette per bambini",de:"Fahrräder für Kinder verfügbar",ru:"Доступны детские велосипеды",zh_Hant:"提供兒童單車"}},{if:"bicycle_library:for=adult",then:{nl:"Aanbod voor volwassenen",en:"Bikes for adult available",fr:"Vélos pour adultes disponibles",it:"Sono disponibili biciclette per adulti",de:"Fahrräder für Erwachsene verfügbar",ru:"Доступны велосипеды для взрослых",zh_Hant:"有提供成人單車"}},{if:"bicycle_library:for=disabled",then:{nl:"Aanbod voor personen met een handicap",en:"Bikes for disabled persons available",fr:"Vélos pour personnes handicapées disponibles",it:"Sono disponibili biciclette per disabili",de:"Fahrräder für Behinderte verfügbar",ru:"Доступны велосипеды для людей с ограниченными возможностями",zh_Hant:"有提供行動不便人士的單車"}}]},"description"],hideUnderlayingFeaturesMinPercentage:1,presets:[{title:{en:"Fietsbibliotheek",nl:"Bicycle library",ru:"Велосипедная библиотека",zh_Hant:"自行車圖書館 ( Fietsbibliotheek)"},tags:["amenity=bicycle_library"],description:{nl:"Een fietsbieb heeft een collectie fietsen die leden mogen lenen",en:"A bicycle library has a collection of bikes which can be lent",fr:"Une vélothèque a une collection de vélos qui peuvent être empruntés",it:"Una ciclo-teca o «bici in prestito» ha una collezione di bici che possno essere prestate",ru:"В велосипедной библиотеке есть велосипеды для аренды",zh_Hant:"單車圖書館有一大批單車供人租借"}}],icon:{render:"pin:#22ff55;./assets/layers/bicycle_library/bicycle_library.svg"},iconOverlays:[{if:"opening_hours~*",then:"isOpen",badge:!0},{if:"service:bicycle:pump=yes",then:"circle:#e2783d;./assets/layers/bike_repair_station/pump.svg",badge:!0}],width:{render:"1"},iconSize:{render:"50,50,bottom"},color:{render:"#c00"},wayHandling:2};
},{}]},{},["vu1m"], null)
//# sourceMappingURL=assets/layers/bicycle_library/bicycle_library.js.map
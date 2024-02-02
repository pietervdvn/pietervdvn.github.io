import{C as m,F as g,J as h,Q as e}from"./SvelteUIElement-65e2316e.js";import{S as u,D as c,a as p}from"./DashboardGui-2a21c1bf.js";import"./ToSvelte-f31dc93e.js";/* empty css                        *//* empty css                     *//* empty css                  */import{A as b}from"./ChartJs-67377275.js";import{M as f,A as k,L as w,D as r}from"./theme_overview-a86fbb0c.js";import{S as i}from"./MoreScreen-ffc396af.js";import"./LanguagePicker-6f35b94e.js";import"./List-1747898b.js";import"./SubtleButton-eb81d210.js";import"./language_native-373a312a.js";import"./language_translations-d2c4c2fc.js";import"./UserInformation-cb7582d0.js";import"./defineProperty-bf1f4e26.js";import"./_commonjsHelpers-edff4021.js";import"./BBox-aa5284c9.js";import"./ContactLink-5ac5344d.js";import"./BackToIndex-6df98ec5.js";const _="grb_fixme",v={nl:"GRB Fixup",_context:"themes:grb_fixme.title"},x={nl:"Grb Fixup",_context:"themes:grb_fixme.shortDescription"},y={nl:"Gebouwen met een FIXME - wss GRB-import die gefixed moeten worden",_context:"themes:grb_fixme.description"},R="./assets/svg/bug.svg",A=51.2132,S=3.231,z=14,q=2,D={maxZoom:15},N=[{id:"named_streets",description:"This layer is needed by address because a calculated tag loads features from this layer (at calculatedTag[0] which calculates the value for _closest_3_street_names)",minzoom:18,source:{osmTags:{and:["highway~*","name~*"]}},mapRendering:[{color:{render:"#ccc"},width:{render:"3"}}],shownByDefault:!1,titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}],forceLoad:!0,passAllFeatures:!0},{id:"osm-buildings-fixme",name:"OSM-buildings with a fixme",source:{osmTags:{and:["building~*","fixme~*"]},maxCacheAge:0},calculatedTags:["_grbNumber=(feat.properties.fixme?.match(/GRB thinks that this has number ([0-9a-zA-Z;]+)/) ?? ['','none']) [1]"],mapRendering:[{width:{render:"2",mappings:[{if:"fixme~*",then:"5"}]},color:{render:"#00c",mappings:[{if:"fixme~*",then:"#ff00ff"},{if:"building=house",then:"#a00"},{if:"building=shed",then:"#563e02"},{if:{or:["building=garage","building=garages"]},then:"#f9bfbb"},{if:"building=yes",then:"#0774f2"}]}},{location:["point","centroid"],label:{mappings:[{if:"addr:housenumber~*",then:"<div style='background-color: white; font: large; width: 1.5em; height: 1.5em; border-radius: 100%'>{addr:housenumber}</div>"}]},iconSize:{render:"40,40,center"}}],title:"OSM-gebouw",tagRenderings:[{id:"building type",freeform:{key:"building"},render:"The building type is <b>{building}</b>",question:{en:"What kind of building is this?",de:"Was ist das für ein Gebäude?",es:"¿Qué tipo de este edificio es este?",nl:"Wat voor soort gebouw is dit?",fr:"De quel type de bâtiment s’agit-il ?",nb_NO:"Hva slags bygning er dette?",da:"Hvad er det for en bygning?",cs:"Jaký druh budovy je toto?",ca:"Quin tipus d'edifici és aquest?",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.building type.question"},mappings:[{if:"building=house",then:"A normal house"},{if:"building=detached",then:"A house detached from other building"},{if:"building=semidetached_house",then:"A house sharing only one wall with another house"},{if:"building=apartments",then:"An apartment building (a highrise building for living)"},{if:"building=office",then:"An office building - highrise for work"},{if:"building=shed",then:"A small shed, e.g. in a garden"},{if:"building=garage",then:"A single garage to park a car"},{if:"building=garages",then:"A building containing only garages; typically they are all identical"},{if:"building=yes",then:"A building - no specification"}]},{id:"grb-housenumber",render:{nl:"Het huisnummer is <b>{addr:housenumber}</b>",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-housenumber.render"},question:{nl:"Wat is het huisnummer?",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-housenumber.question"},freeform:{key:"addr:housenumber"},mappings:[{if:{and:["not:addr:housenumber=yes","addr:housenumber="]},then:{nl:"Geen huisnummer",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-housenumber.mappings.0.then"}},{if:{and:["addr:housenumber:={_grbNumber}","fixme="]},then:"Het huisnummer is <b>{_grbNumber}</b>, wat overeenkomt met het GRB",hideInAnswer:{or:["_grbNumber=","_grbNumber=none","_grbNumber=no number"]}},{if:{and:["addr:housenumber=","not:addr:housenumber=yes","fixme="]},then:"Dit gebouw heeft geen nummer, net zoals in het GRB",hideInAnswer:"_grbNumber!=no number"}]},{id:"grb-unit",question:"Wat is de wooneenheid-aanduiding?",render:{nl:"De wooneenheid-aanduiding is <b>{addr:unit}</b> ",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-unit.render"},freeform:{key:"addr:unit"},mappings:[{if:"addr:unit=",then:"Geen wooneenheid-nummer"}]},{id:"grb-street",render:{nl:"De straat is <b>{addr:street}</b>",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-street.render"},freeform:{key:"addr:street"},question:{nl:"Wat is de straat?",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-street.question"}},{id:"grb-fixme",render:{nl:"De fixme is <b>{fixme}</b>",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-fixme.render"},question:{nl:"Wat zegt de fixme?",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-fixme.question"},freeform:{key:"fixme"},mappings:[{if:{and:["fixme="]},then:{nl:"Geen fixme",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-fixme.mappings.0.then"}}]},{id:"grb-min-level",render:{nl:"Dit gebouw begint maar op de {building:min_level} verdieping",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-min-level.render"},question:{nl:"Hoeveel verdiepingen ontbreken?",_context:"themes:grb_fixme.layers.osm-buildings-fixme.tagRenderings.grb-min-level.question"},freeform:{key:"building:min_level",type:"pnat"}},{id:"fix_verdieping",render:"{tag_apply(fixme=;building:min_level=1,De eerste verdieping ontbreekt)}",condition:"fixme=verdieping, correct the building tag, add building:level and building:min_level before upload in JOSM!"},{description:"Shows a table with all the tags of the feature",render:"{all_tags()}",id:"all_tags",source:"shared-questions"},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],minzoom:14,titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"address",name:{en:"Known addresses in OSM",de:"Bekannte Adressen in OSM",zh_Hant:"OSM 上已知的地址",hu:"Ismert címek az OSM-en",nl:"Bekende adressen in OSM",fr:"Adresses connues d’OpenStreetMap",ru:"Известные адреса в OSM",id:"Alamat yang dikenal di OSM",es:"Direcciones conocidas en OSM",zh_Hans:"OSM中已知的地址",nb_NO:"Kjente adresser i OSM",da:"Kendte adresser i OSM",pt:"Endereços conhecidos no OSM",eo:"Konataj adresoj en OSM",cs:"Známé adresy v OSM",pa_PK:"او‌ایس‌ایم وچ جاݨ پچھاݨے پتے",ca:"Adreces conegudes a OSM",zgh:"ⴰⵏⵙⵉⵡⵏ ⵉⵜⵜⵡⴰⵙⵙⵏⵏ ⴳ OSM",pt_BR:"Endereços conhecidos no OSM"},minzoom:18,source:{osmTags:{and:[{or:["addr:housenumber~*","addr:street~*"]}]},maxCacheAge:0},calculatedTags:["_closest_3_street_names=feat.closestn('named_streets',3, 'name').map(f => f.feat.properties.name)","_closest_street:0:name=JSON.parse(feat.properties._closest_3_street_names)[0]","_closest_street:1:name=JSON.parse(feat.properties._closest_3_street_names)[1]","_closest_street:2:name=JSON.parse(feat.properties._closest_3_street_names)[2]"],title:{render:{en:"Known address",de:"Bekannte Adresse",hu:"Ismert cím",nl:"Bekend adres",fr:"Adresse connue",pl:"Znany adres",ru:"Известный адрес",es:"Domicilio conocido",zh_Hans:"已知的地址",id:"Alamat yang diketahui",nb_NO:"Kjent adresse",da:"Kendt adresse",cs:"Známá adresa",ca:"Adreça coneguda",pt:"Endereço conhecido",pt_BR:"Endereço conhecido"}},description:{en:"Addresses",nl:"Adressen",de:"Adressen",ru:"Адреса",zh_Hant:"地址",hu:"Címek",fr:"Adresses",pl:"Adresy",id:"Alamat",es:"Direcciones",zh_Hans:"地址",ca:"Adreces",nb_NO:"Adresser",da:"Adresser",pt:"Endereços",eo:"Adresoj",cs:"Adresy",pa_PK:"پتے",zgh:"ⴰⵏⵙⵉⵡⵏ",pt_BR:"Endereços"},tagRenderings:[{id:"housenumber",render:{en:"The house number is <b>{addr:housenumber}</b>",nl:"Het huisnummer is <b>{addr:housenumber}</b>",de:"Die Hausnummer ist <b>{addr:housenumber}</b>",hu:"A házszám: <b>{addr:housenumber}</b>",fr:"Son numéro est le <b>{addr:housenumber}</b>",pl:"Numer tego domu to <b>{addr:housenumber}</b>",ru:"Номер дома <b>{addr:housenumber}</b>",zh_Hans:"门牌号是 <b>{addr:housenumber}</b>",id:"Nomor rumah ini <b>{addr:housenumber}</b>",es:"El número de puerta es <b>{addr:housenumber}</b>",da:"Husnummeret er <b>{addr:housenumber}</b>",cs:"Číslo domu je <b>{addr:housenumber}</b>",pt:"O número da casa é <b>{addr:housenumber}</b>",nb_NO:"Husnummeret er <b>{addr:housenumber}</b>",ca:"El número de porta és <b>{addr:housenumber}</b>",pt_BR:"O número da casa é <b>{addr:housenumber}</b>"},question:{en:"What is the number of this house?",de:"Wie lautet die Nummer dieses Hauses?",hu:"Mi ennek az épületnek a házszáma?",nl:"Wat is het huisnummer van dit huis?",fr:"Quel est le numéro de ce bâtiment ?",pl:"Jaki jest numer tego domu?",ru:"Какой номер у этого дома?",es:"¿Cuál es el número de esta casa?",zh_Hans:"这个屋子的门牌号是多少？",id:"Berapa nomor rumah ini?",da:"Hvad er nummeret på dette hus?",cs:"Jaké je číslo tohoto domu?",pt:"Qual é o número desta casa?",nb_NO:"Hvilket husnummer har dette huset?",ca:"Quin és el número d'aquesta casa?",pt_BR:"Qual é o número desta casa?"},freeform:{key:"addr:housenumber",addExtraTags:["nohousenumber="]},mappings:[{if:{and:["nohousenumber=yes"]},then:{en:"This building has no house number",nl:"Dit gebouw heeft geen huisnummer",de:"Dieses Gebäude hat keine Hausnummer",hu:"Ennek az épületnek nincs házszáma",fr:"Ce bâtiment n’a pas de numéro",pl:"Ten budynek nie ma numeru",ru:"У этого здания нет номера",id:"Bangunan ini tidak memiliki nomor rumah",es:"Esta edificación no tiene número",zh_Hans:"这个建筑物没有门牌号",da:"Denne bygning har intet husnummer",zh_Hant:"這棟建築沒有門牌",cs:"Tato budova nemá číslo domu",pt:"Este prédio não tem número",nb_NO:"Denne bygningen har ikke noe husnummer",ca:"Aquest edifici no té número",pt_BR:"Este prédio não tem número"}}]},{id:"street",render:{en:"This address is in street <b>{addr:street}</b>",de:"Diese Adresse befindet sich in der Straße <b>{addr:street}</b>",hu:"Ez a cím a következő utcában van: <b>{addr:street}</b>",nl:"Dit adres bevindt zich in de straat <b>{addr:street}</b>",fr:"Le nom de la voie est <b>{addr:street}</b>",pl:"Ten adres znajduje się na ulicy <b>{addr:street}</b>",zh_Hans:"这个地址位于<b>{addr:street}</b>街",id:"Alamat ini ada di jalan <b>{addr:street}</b>",es:"La dirección está en esta calle <b>{addr:street}</b>",da:"Denne adresse er på gaden <b>{addr:street}</b>",cs:"Tato adresa se nachází v ulici <b>{addr:street}</b>",ca:"L'adreça està a aquest carrer <b>{addr:street}</b>",pt:"Este endereço é na rua <b>{addr:street}</b>",pt_BR:"Este endereço fica na rua <b>{addr:street}</b>"},question:{en:"What street is this address located in?",de:"In welcher Straße befindet sich diese Adresse?",hu:"Melyik utcában található ez a cím?",nl:"In welke straat bevindt dit adres zich?",fr:"Dans quelle rue est située l’adresse ?",pl:"Na jakiej ulicy znajduje się ten adres?",ru:"Какая эта улица?",es:"¿En qué calle se encuentra esta dirección?",zh_Hans:"这个地址位于哪条街道？",id:"Alamat ini di jalan apa?",da:"Hvilken gade ligger denne adresse på?",cs:"V jaké ulici se nachází tato adresa?",ca:"A quin carrer es troba l'adreça?",pt:"Em que rua fica esse endereço?",pt_BR:"Em que rua fica esse endereço?"},freeform:{key:"addr:street"},mappings:[{if:"addr:street:={_closest_street:0:name}",then:"Located in <b>{_closest_street:0:name}</b>",hideInAnswer:"_closest_street:0:name="},{if:"addr:street:={_closest_street:1:name}",then:"Located in <b>{_closest_street:1:name}</b>",hideInAnswer:"_closest_street:1:name="},{if:"addr:street:={_closest_street:2:name}",then:"Located in <b>{_closest_street:2:name}</b>",hideInAnswer:"_closest_street:2:name="}],condition:{and:["nohousenumber!~yes"]}},{id:"fixme",render:"<b>Fixme description</b>{fixme}",question:{en:"What should be fixed here? Please explain",zh_Hant:"這裡需要修什麼？請直接解釋",de:"Was sollte hier korrigiert werden? Bitte erläutern",hu:"Mit kellene itt kijavítani? Légy szíves, magyarázd el",fr:"Précisez ce qui devrait être corrigé ici",pl:"Co wymaga naprawy? Proszę wytłumaczyć",id:"Apa yang harus diperbaiki di sini? Tolong jelaskan",es:"¿Qué debe corregirse aquí? Expóngalo",nl:"Wat moet hier gecorrigeerd worden? Leg het uit",zh_Hans:"这里应被如何修复？请做出解释",da:"Hvad skal rettes her? Forklar venligst",cs:"Co by se zde mělo opravit? Vysvětlete to, prosím",pt:"O que deve ser corrigido aqui? Explique",nb_NO:"Hva bør fikses her? Forklar.",ca:"Què s’hauria de corregir aquí? Exposa-ho",pt_BR:"O que deve ser corrigido aqui? Explique"},freeform:{key:"fixme"},mappings:[{if:"fixme=",then:"No fixme - write something here to explain complicated cases"}]},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],mapRendering:[{label:{render:"<div style='margin-top: -42px; color: white' class='rounded-full p-1 font-bold relative'>{addr:housenumber}</div>",condition:"addr:housenumber~*"},iconSize:"50,50,center",icon:{render:"./assets/layers/address/housenumber_blank.svg",mappings:[{if:{or:[{and:["addr:housenumber=","nohousenumber!=yes"]},"addr:street="]},then:"./assets/themes/uk_addresses/housenumber_unknown.svg"}]},location:["point","centroid"]},{color:{render:"#00f",mappings:[{if:{or:[{and:["addr:housenumber=","nohousenumber!=yes"]},"addr:street="]},then:"#ff0"}]},width:{render:"8"}}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}],forceLoad:!0},{id:"crab_address",description:"Address data for Flanders by the governement, suited for import into OpenStreetMap. Datadump from 2021-10-26. This layer contains only visualisation logic. Import buttons should be added via an override. Note that HNRLABEL contains the original value, whereas _HNRLABEL contains a slightly cleaned version",source:{osmTags:{and:["HUISNR~*"]},geoJson:"https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/CRAB_2021_10_26/tile_{z}_{x}_{y}.geojson",geoJsonZoomLevel:18,maxCacheAge:0},name:"CRAB-addressen",title:"CRAB-adres",mapRendering:[{location:["point","centroid"],iconSize:"50,50,center",icon:{render:"./assets/layers/crab_address/housenumber_blank.svg",id:"assetslayerscrabaddresshousenumberblanksvg"},label:{render:"<div style='margin-top: -42px; color: white' class='rounded-full p-1 font-bold relative'>{_HNRLABEL}</div>"}}],calculatedTags:["_HNRLABEL=(() => {const lbl = feat.properties.HNRLABEL?.split('-')?.map(l => Number(l))?.filter(i => !isNaN (i)) ;if(lbl?.length != 2) {return feat.properties.HNRLABEL}; const addresses = []; for(let i = lbl[0]; i <= lbl[1]; i += 1){addresses.push(''+i);}; return addresses.join(';')        })()"],tagRenderings:[{id:"import-button",render:"{import_button(address, addr:street=$STRAATNM; addr:housenumber=$HUISNR,Import this address)}"},{id:"render_crab",render:{nl:"Volgens het CRAB ligt hier <b>{STRAATNM}</b> {HUISNR} (label: {HNRLABEL})"}},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}],minzoom:18},{id:"selected_element",description:{en:"Highlights the currently selected element. Override this layer to have different colors",nl:"Toont het geselecteerde element",de:"Hebt das aktuell ausgewählte Element hervor. Überschreiben Sie diese Ebene, um unterschiedliche Farben zu erhalten",fr:"Met en surbrillance l'élément actuellement sélectioné. Surcharger cette couche pour avoir d'autres couleurs.",ca:"Ressalta l'element seleccionat actualment. Anul·leu aquesta capa per tenir diferents colors"},source:{osmTags:{and:["selected=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:red",id:"circlered"},iconSize:"1,1,center",location:["point","projected_centerpoint"],css:"box-shadow: red 0 0 20px 20px; z-index: -1; height: 1px; width: 1px;",cssClasses:"block relative rounded-full"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location",description:"Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) (except latitude and longitude) returned by the browser, such as `speed`, `altitude`, `heading`, ....",minzoom:0,source:{osmTags:{and:["id=gps"]},maxCacheAge:0},mapRendering:[{icon:{render:"crosshair:var(--catch-detail-color)",mappings:[{if:"speed>2",then:"gps_arrow"}]},iconSize:"40,40,center",rotation:{render:"0deg",mappings:[{if:{and:["speed>2","heading!=NaN"]},then:"{heading}deg"}]},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location_history",description:"Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object",minzoom:1,name:null,source:{osmTags:{and:["user:location=yes"]},"#":"Cache is disabled here as these points are kept seperately",maxCacheAge:0},shownByDefault:!1,mapRendering:[{location:["point","centroid"],icon:{render:"square:red",id:"squarered"},iconSize:"5,5,center"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"home_location",description:"Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.",minzoom:0,source:{osmTags:{and:["user:home=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:white;./assets/svg/home.svg"},iconSize:{render:"20,20,center"},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_track",description:"Meta layer showing the previous locations of the user as single line with controls, e.g. to erase, upload or download this track. Add this to your theme and override the maprendering to change the appearance of the travelled track.",minzoom:0,source:{osmTags:{and:["id=location_track"]},maxCacheAge:0},title:{render:"Your travelled path"},shownByDefault:!1,tagRenderings:[{id:"Privacy notice",render:{en:"This is the path you've travelled since this website is opened. Don't worry - this is only visible to you and no one else. Your location data is never sent off-device.",nl:"Dit is waar je was sinds je deze website hebt geopend. Dit is enkel zichtbaar voor jou en niemand anders. Je locatie wordt niet verstuurd buiten je apparaat.",de:"Dies ist der Weg, den Sie seit dem Besuch dieser Webseite zurückgelegt haben. Keine Sorge - diese Daten sind nur für Sie sichtbar und für niemanden sonst. Ihre Standortdaten werden niemals an ein anderes Gerät gesendet.",fr:"C'est le chemin que vous avez parcouru depuis l'ouverture de ce site. Ne vous inquiétez pas - ceci n'est visible que pour vous et personne d'autre. Vos données de localisation ne sont jamais envoyées hors de l'appareil.",ca:"Aquest és el camí que heu recorregut des que s'ha obert aquest lloc web. No et preocupis: això només és visible per a tu i ningú més. Les vostres dades d'ubicació mai s'envien fora del dispositiu."}},{description:"Shows a button to export this feature as GPX. Especially useful for route relations",render:"{export_as_gpx()}",id:"export_as_gpx",source:"shared-questions"},{description:"Shows a button to export this feature as geojson. Especially useful for debugging or using this in other programs",render:"{export_as_geojson()}",id:"export_as_geojson",source:"shared-questions"},{id:"upload_to_osm",render:"{upload_to_osm()}"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"},{id:"delete",render:"{clear_location_history()}"}],name:{en:"Your travelled track",nl:"Jouw afgelegde route",de:"Zurückgelegte Strecke",fr:"Votre chemin parcouru",da:"Dit tilbagelagte spor",ca:"La teva traça recorreguda"},mapRendering:[{width:3,color:"#bb000077"}],syncSelection:"global",titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]}],B=!0,L="AGIVFlandersGRB",O=15,H=17,I="assets/SocialImage.png",o={id:_,title:v,shortDescription:x,description:y,icon:R,startLat:A,startLon:S,startZoom:z,widenFactor:q,clustering:D,layers:N,hideFromOverview:B,defaultBackgroundId:L,overpassMaxZoom:O,osmApiTileSize:H,socialImage:I};document.getElementById("decoration-desktop").remove();new m(["Initializing... <br/>",new g("<a>If this message persist, something went wrong - click here to try again</a>").SetClass("link-underline small").onClick(()=>{localStorage.clear(),window.location.reload(!0)})]).AttachTo("centermessage");f.initialize();b.implement(new k);u.Implement();h.DisableLongPresses();new URLSearchParams(window.location.search).get("test")==="true"&&console.log(o);const a=new w(o);if((a==null?void 0:a.id)==="cyclofix"){const s=e.GetQueryParameter("layer-bike_shops","true","Legacy - keep De Fietsambassade working"),n=e.GetQueryParameter("layer-bike_shop","true","Legacy - keep De Fietsambassade working");s.data!=="true"&&n.setData(s.data),console.log("layer-bike_shop toggles: legacy:",s.data,"new:",n.data);const d=e.GetQueryParameter("layer-bike_cafes","true","Legacy - keep De Fietsambassade working"),l=e.GetQueryParameter("layer-bike_cafe","true","Legacy - keep De Fietsambassade working");d.data!=="true"&&l.setData(s.data)}const t=new r;i.state=new i(a);r.state=t;window.mapcomplete_state=i.state;const M=e.GetQueryParameter("mode","map","The mode the application starts in, e.g. 'map' or 'dashboard'");M.data==="dashboard"?new c(i.state,t).setup():new p(i.state,t).setup();
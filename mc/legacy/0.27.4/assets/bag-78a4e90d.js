import{C as l,F as m,J as p,Q as e}from"./SvelteUIElement-65e2316e.js";import{S as b,D as c,a as h}from"./DashboardGui-2a21c1bf.js";import"./ToSvelte-f31dc93e.js";/* empty css                        *//* empty css                     *//* empty css                  */import{A as u}from"./ChartJs-67377275.js";import{M as _,A as f,L as k,D as o}from"./theme_overview-a86fbb0c.js";import{S as i}from"./MoreScreen-ffc396af.js";import"./LanguagePicker-6f35b94e.js";import"./List-1747898b.js";import"./SubtleButton-eb81d210.js";import"./language_native-373a312a.js";import"./language_translations-d2c4c2fc.js";import"./UserInformation-cb7582d0.js";import"./defineProperty-bf1f4e26.js";import"./_commonjsHelpers-edff4021.js";import"./BBox-aa5284c9.js";import"./ContactLink-5ac5344d.js";import"./BackToIndex-6df98ec5.js";const w="bag",v={nl:"BAG import helper",en:"BAG import helper",de:"BAG-Importhilfe",fr:"Facilitateur d'import BAG",nb_NO:"BAG-importhjelper",ca:"Assistent d'importació del BAG",es:"Ayudante de importación BAG",cs:"Pomocník pro import BAG",_context:"themes:bag.title"},y={nl:"BAG import helper tool",en:"BAG import helper tool",de:"BAG-Import-Hilfswerkzeug",fr:"Outil de facilitation d'import BAG",ca:"Ferramenta d'ajuda per a importar el BAG",es:"Herramienta de ayuda a la importación BAG",cs:"Pomocný nástroj pro import BAG",_context:"themes:bag.shortDescription"},j={nl:"Dit thema helpt het importeren van BAG data",en:"This theme helps with importing data from BAG",cs:"Toto téma pomáhá s importem dat ze systému BAG",de:"Dieses Thema hilft beim Importieren von BAG-Daten",fr:"Ce thème aide à l'importation de données depuis BAG",ca:"Aquest tema ajuda amb la importació de dades del BAG",zgh:"ⵉⵜⵜⴰⵡⵙ ⵉⵎⵔⵙⵉ ⴰⴷ ⴳ ⵡⴰⵎⵎⴰⵥ ⵏ ⵜⵎⵓⵛⴰ ⵙⴳ BAG",es:"Este tema ayuda a importar datos de BAG",_context:"themes:bag.description"},x="Wouter van der Wal",A="./assets/themes/bag/logo.svg",B=53.1726,G=7.04545,R=9,S=[{id:"type_node",description:"This layer is needed by bag:pand because a tagrendering needs this layer (at Import button)",minzoom:18,source:{osmTags:{and:["id~node/.*"]},maxCacheAge:0},mapRendering:null,name:"All OSM Nodes",title:"OSM node {id}",tagRendering:[],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}],forceLoad:!0,passAllFeatures:!0},{id:"osm:buildings",name:"OSM Buildings",title:"OSM Building",description:"Layer showing buildings that are in OpenStreetMap",source:{osmTags:"building~*",maxCacheAge:0},minzoom:19,calculatedTags:["_surface:strict:=feat.get('_surface')"],mapRendering:[{width:{render:"2",mappings:[{if:"fixme~*",then:"5"}]},color:{render:"#00c",mappings:[{if:"fixme~*",then:"#ff00ff"},{if:"building=house",then:"#a00"},{if:"building=shed",then:"#563e02"},{if:{or:["building=garage","building=garages"]},then:"#f9bfbb"},{if:"building=yes",then:"#0774f2"}]}}],tagRenderings:[{id:"Reference",render:{en:"The reference in BAG is <b>{ref:bag}</b>",de:"Die Referenz in BAG ist <b>{ref:bag}</b>",nl:"De referentie in BAG is <b>{ref:bag}</b>",fr:"La référence dans le BAG est <b>{ref:bag}</b>",ca:"La referència al BAG és <b>{ref:bag}</b>",zgh:"ⵜⴳⴰ ⵜⵙⴰⵖⵓⵍⵜ ⴳ BAG <b>{ref:bag}</b>",es:"La referencia de BAG es <b>{ref:bag}</b>",cs:"Reference v BAG je <b>{ref:bag}</b>",_context:"themes:bag.layers.osm:buildings.tagRenderings.Reference.render"},mappings:[{if:"ref:bag=",then:{en:"This building has no reference in the BAG",cs:"Tato budova nemá v BAG žádný odkaz",de:"Dieses Gebäude hat keinen Verweis im BAG",nl:"Dit gebouw heeft geen referentie in de BAG",fr:"Ce bâtiment n'a pas de référence dans le BAG",ca:"Aquest edifici no té referència al BAG",zgh:"ⵜⵓⵚⴽⴰ ⴰⴷ ⵓⵔ ⵖⵓⵔⵙ ⵜⴰⵙⴰⵖⵓⵍⵜ ⴳ BAG",es:"Este edificio no tiene referencia en el BAG",_context:"themes:bag.layers.osm:buildings.tagRenderings.Reference.mappings.0.then"}}]},{id:"Building type",freeform:{key:"building",type:"string",addExtraTags:["construction="]},render:"This building is a <b>{building}</b>",question:"What kind of building is this?"},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}],forceLoad:!0},{id:"osm:adresses",name:"OSM Adresses",title:"OSM Adress",description:"Layer showing adresses that are in OpenStreetMap",source:{osmTags:{and:["source=BAG","addr:city~*","addr:housenumber~*","addr:postcode~*","addr:street~*"]},maxCacheAge:0},minzoom:19,mapRendering:[{label:{render:"<div style='color: black' class='rounded-full p-1 font-bold relative'>{addr:housenumber}</div>",condition:"addr:housenumber~*"},location:["point","centroid"]},{width:{render:1}}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}],forceLoad:!0},{id:"bag:pand",name:"BAG Buildings",title:"BAG Building",description:{en:"Buildings from BAG register",de:"Gebäude aus dem BAG-Register",nl:"Gebouw uit de BAG",fr:"Bâtiments du registre BAG",ca:"Edificis del registre BAG",zgh:"ⵜⵓⵚⴽⴰⵡⵉⵏ ⵙⴳ ⵡⴰⵔⵔⴰ ⵏ BAG",es:"Edificios del registro BAG",cs:"Budovy z registru BAG",_context:"themes:bag.layers.bag:pand.description"},source:{geoJson:"https://service.pdok.nl/lv/bag/wfs/v2_0?request=GetFeature&service=WFS&version=2.0.0&outputFormat=application%2Fjson%3B%20subtype%3Dgeojson&typeName=bag%3Apand&bbox={x_min}%2C{y_min}%2C{x_max}%2C{y_max}%2CCRS84&srsName=EPSG%3A4326",geoJsonZoomLevel:18,osmTags:"identificatie~*",maxCacheAge:0},minzoom:19,calculatedTags:["_overlaps_with_buildings=feat.overlapWith('osm:buildings').filter(f => f.feat.properties.id.indexOf('-') < 0)","_overlaps_with=feat.get('_overlaps_with_buildings').find(f => f.overlap > 1 /* square meter */ )","_overlaps_with_properties=feat.get('_overlaps_with')?.feat?.properties","_overlap_percentage=Math.round(100 * (feat.get('_overlaps_with')?.overlap / feat.get('_overlaps_with_properties')['_surface:strict']))","_reverse_overlap_percentage=Math.round(100 * (feat.get('_overlaps_with')?.overlap / feat.get('_surface')))","_bag_obj:in_construction=feat.properties.status.startsWith('Bouwvergunning verleend') || feat.properties.status.startsWith('Bouw gestart')","_bag_obj:construction=(feat.properties.gebruiksdoel == 'woonfunctie') ? ((Number(feat.properties.aantal_verblijfsobjecten) == 1) ? 'house' : 'apartments') : 'yes'","_bag_obj:building=(feat.properties.status.startsWith('Bouwvergunning verleend') || feat.properties.status.startsWith('Bouw gestart')) ? 'construction' : feat.properties['_bag_obj:construction']","_bag_obj:ref:bag=Number(feat.properties.identificatie)","_bag_obj:source:date=new Date().toISOString().split('T')[0]","_bag_obj:start_date=feat.properties.bouwjaar","_osm_obj:id=feat.get('_overlaps_with_properties')?.id","_osm_obj:building=feat.get('_overlaps_with_properties')?.building","_imported_osm_object_found:=Number(feat.properties.identificatie)==Number(feat.get('_overlaps_with_properties')['ref:bag'])"],mapRendering:[{width:{render:5,mappings:[{if:"_imported_osm_object_found=true",then:"1"}]},color:{render:"#00a",mappings:[{if:"_imported_osm_object_found=true",then:"#0f0"}]}}],tagRenderings:[{id:"Import button",render:"{import_way_button(osm:buildings, building=$_bag_obj:building; ref:bag=$_bag_obj:ref:bag; source=BAG; source:date=$_bag_obj:source:date; start_date=$_bag_obj:start_date, Upload this building to OpenStreetMap)}",mappings:[{"#":"Something went wrong calculating the tags - don't show an import button",if:{or:["_bag_obj:building=","_bag_obj:ref:bag="]},then:{en:"Didn't calculate the correct values yet. Refresh this page",de:"Richtige Werte noch nicht berechnet. Aktualisieren Sie diese Seite",nl:"Correcte waarden nog niet berekend. Herlaad deze pagina",fr:"Les valeurs correctes n'ont pas encore été calculées. Rafraichissez la page",ca:"El valors correctes encara no s'ha calculat. Refresca la pàgina",cs:"Zatím nebyly vypočteny správné hodnoty. Aktualizujte stránku",nb_NO:"Har ikke regnet ut riktige verdier enda. Gjenoppfrisk siden.",es:"Aún no se han calculado los valores correctos. Actualice esta página",_context:"themes:bag.layers.bag:pand.tagRenderings.Import button.mappings.0.then"}},{if:"_overlaps_with!=",then:"{conflate_button(osm:buildings, building=$_bag_obj:building; ref:bag=$_bag_obj:ref:bag; source=BAG; source:date=$_bag_obj:source:date; start_date=$_bag_obj:start_date, Replace the geometry in OpenStreetMap, , _osm_obj:id)}"},{if:{and:["_bag_obj:building~*","_bag_obj:ref:bag~*","_bag_obj:in_construction=true"]},then:"{import_way_button(osm:buildings, building=$_bag_obj:building; construction=$_bag_obj:construction; ref:bag=$_bag_obj:ref:bag; source=BAG; source:date=$_bag_obj:source:date; start_date=$_bag_obj:start_date, Upload this building to OpenStreetMap)}"}]},{id:"Reference",render:{en:"The reference in BAG is <b>{_bag_obj:ref:bag}</b>",de:"Die Referenz in BAG ist <b>{_bag_obj:ref:bag}</b>",nl:"De referentie in BAG is <b>{_bag_obj:ref:bag}</b>",fr:"La référence dans BAG est <b>{_bag_obj:ref:bag}</b>",ca:"La referència a BAG és <b>{_bag_obj:ref:bag}</b>",es:"La referencia en BAG es <b>{_bag_obj:ref:bag}</b>",cs:"Reference v BAG je <b>{_bag_obj:ref:bag}</b>",_context:"themes:bag.layers.bag:pand.tagRenderings.Reference.render"}},{id:"Build year",render:{en:"This building was built in <b>{_bag_obj:start_date}</b>",de:"Dieses Gebäude wurde gebaut in <b>{_bag_obj:start_date}</b>",pt_BR:"Esta construção é de <b>{_bag_obj:start_date}</b>",nl:"Dit gebouw is gebouwd in <b>{_bag_obj:start_date}</b>",fr:"Le bâtiment a été construit en <b>{_bag_obj:start_date}</b>",ca:"L’edifici va ser construït al <b> {_bag_obj:start_date}4</b>",es:"El edificio fue construido en <b>{_bag_obj:start_date}</b>",cs:"Tato budova byla postavena v <b>{_bag_obj:start_date}</b>",nb_NO:"Bygning oppført <b>{_bag_obj:start_date}</b>",_context:"themes:bag.layers.bag:pand.tagRenderings.Build year.render"},mappings:[{if:"_bag_obj:in_construction=true",then:{en:"The building was started in <b>{_bag_obj:start_date}</b>",de:"Der Bau wurde in <b>{_bag_obj:start_date}</b> begonnen",nl:"De bouw van dit gebouw is gestart in <b>{_bag_obj:start_date}</b>",fr:"Le bâtiment a été commencé en <b>{_bag_obj:start_date}</b>",ca:"L’edifici es va començar al <b> {_bag_obj:start_date}</b>",cs:"Stavba byla zahájena v <b>{_bag_obj:start_date}</b>",nb_NO:"Oppføring startet <b>{_bag_obj:start_date}</b>",es:"Este edificio se empezó a construir en <b>{_bag_obj:start_date}</b>",_context:"themes:bag.layers.bag:pand.tagRenderings.Build year.mappings.0.then"}}]},{id:"Building type",render:{en:"The building type is a <b>{_bag_obj:building}</b>",de:"Der Gebäudetyp ist ein <b>{_bag_obj:building}</b>",nl:"Het gebouwtype is <b>{_bag_obj:building}</b>",fr:"Le type de bâtiment est <b>{_bag_obj:building}</b>",ca:"El tipus d'edifici és <b>{_bag_obj:building}</b>",cs:"Typ budovy je <b>{_bag_obj:building}.</b>",nb_NO:"Dette er en bygning av typen <b>{_bag_obj:building}</b>",es:"El edificio es de tipo <b>{_bag_obj:building}</b>",_context:"themes:bag.layers.bag:pand.tagRenderings.Building type.render"},mappings:[{if:"_bag_obj:in_construction=true",then:{en:"The building type will be a <b>{_bag_obj:construction}</b>",de:"Der Gebäudetyp ist ein <b>{_bag_obj:construction}</b>",nl:"Het gebouwtype wordt <b>{_bag_obj:construction}</b>",fr:"Le type de bâtiment sera <b>{_bag_obj:construction}</b>",ca:"El tipus d'edifici serà <b>{_bag_obj:construction}</b>",cs:"Typ budovy bude <b>{_bag_obj:construction}</b>",es:"El tipo de edificio será un <b>{_bag_obj:construction}</b>",_context:"themes:bag.layers.bag:pand.tagRenderings.Building type.mappings.0.then"}}]},{id:"Overlapping building",render:"<div>The overlapping <a href=https://osm.org/{_osm_obj:id} target=_blank>osm:buildings</a> is a <b>{_osm_obj:building}</b> and covers <b>{_overlap_percentage}%</b> of the BAG building.<br>The BAG-building covers <b>{_reverse_overlap_percentage}%</b> of the OSM building<div><h3>BAG geometry:</h3>{minimap(21, id):height:10rem;border-radius:1rem;overflow:hidden}<h3>OSM geometry:</h3>{minimap(21,_osm_obj:id):height:10rem;border-radius:1rem;overflow:hidden}</div></div>",condition:"_overlaps_with!="},{id:"Building status",render:"The current building status is <b>{status}</b>"},{id:"Buidling function",render:"The current function of the building is <b>{gebruiksdoel}</b>"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"bag:verblijfsobject",name:"BAG Addresses",title:"BAG Address",description:"Address information from the BAG register",source:{geoJson:"https://service.pdok.nl/lv/bag/wfs/v2_0?request=GetFeature&service=WFS&version=2.0.0&outputFormat=application%2Fjson%3B%20subtype%3Dgeojson&typeName=bag%3Averblijfsobject&bbox={x_min}%2C{y_min}%2C{x_max}%2C{y_max}%2CCRS84&srsName=EPSG%3A4326",geoJsonZoomLevel:19,osmTags:"identificatie~*",maxCacheAge:0},minzoom:19,calculatedTags:["_closed_osm_addr:=feat.closest('osm:adresses').properties","_bag_obj:addr:housenumber=`${feat.properties.huisnummer}${feat.properties.huisletter}${(feat.properties.toevoeging != '') ? '-' : ''}${feat.properties.toevoeging}`","_bag_obj:ref:bag=Number(feat.properties.identificatie)","_bag_obj:source:date=new Date().toISOString().split('T')[0]","_osm_obj:addr:city:=feat.get('_closed_osm_addr')['addr:city']","_osm_obj:addr:housenumber:=feat.get('_closed_osm_addr')['addr:housenumber']","_osm_obj:addr:postcode:=feat.get('_closed_osm_addr')['addr:postcode']","_osm_obj:addr:street:=feat.get('_closed_osm_addr')['addr:street']","_imported_osm_object_found:=(feat.properties.woonplaats==feat.get('_closed_osm_addr')['addr:city'])&&(feat.get('_bag_obj:addr:housenumber')==feat.get('_closed_osm_addr')['addr:housenumber'])&&(feat.properties.postcode==feat.get('_closed_osm_addr')['addr:postcode'])&&(feat.properties.openbare_ruimte==feat.get('_closed_osm_addr')['addr:street'])"],mapRendering:[{label:{render:"<div style='color: black' class='rounded-full p-1 font-bold relative'>{_bag_obj:addr:housenumber}</div>",mappings:[{if:"_imported_osm_object_found=true",then:"<div style='color: #107c10' class='rounded-full p-1 font-bold relative'>{_bag_obj:addr:housenumber}</div>"}]},location:["point","centroid"]},{width:{render:1}}],tagRenderings:[{id:"Import button",render:"{import_button(osm:adresses, addr:city=$woonplaats; addr:housenumber=$_bag_obj:addr:housenumber; addr:postcode=$postcode; addr:street=$openbare_ruimte; ref:bag=$_bag_obj:ref:bag; source=BAG; source:date=$_bag_obj:source:date, Upload this adress to OpenStreetMap)}",condition:"_imported_osm_object_found=false"},{id:"Address",render:"{openbare_ruimte} {_bag_obj:addr:housenumber}, {woonplaats} {postcode}"},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"selected_element",description:{en:"Highlights the currently selected element. Override this layer to have different colors",nl:"Toont het geselecteerde element",de:"Hebt das aktuell ausgewählte Element hervor. Überschreiben Sie diese Ebene, um unterschiedliche Farben zu erhalten",fr:"Met en surbrillance l'élément actuellement sélectioné. Surcharger cette couche pour avoir d'autres couleurs.",ca:"Ressalta l'element seleccionat actualment. Anul·leu aquesta capa per tenir diferents colors"},source:{osmTags:{and:["selected=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:red",id:"circlered"},iconSize:"1,1,center",location:["point","projected_centerpoint"],css:"box-shadow: red 0 0 20px 20px; z-index: -1; height: 1px; width: 1px;",cssClasses:"block relative rounded-full"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location",description:"Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) (except latitude and longitude) returned by the browser, such as `speed`, `altitude`, `heading`, ....",minzoom:0,source:{osmTags:{and:["id=gps"]},maxCacheAge:0},mapRendering:[{icon:{render:"crosshair:var(--catch-detail-color)",mappings:[{if:"speed>2",then:"gps_arrow"}]},iconSize:"40,40,center",rotation:{render:"0deg",mappings:[{if:{and:["speed>2","heading!=NaN"]},then:"{heading}deg"}]},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location_history",description:"Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object",minzoom:1,name:null,source:{osmTags:{and:["user:location=yes"]},"#":"Cache is disabled here as these points are kept seperately",maxCacheAge:0},shownByDefault:!1,mapRendering:[{location:["point","centroid"],icon:{render:"square:red",id:"squarered"},iconSize:"5,5,center"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"home_location",description:"Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.",minzoom:0,source:{osmTags:{and:["user:home=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:white;./assets/svg/home.svg"},iconSize:{render:"20,20,center"},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_track",description:"Meta layer showing the previous locations of the user as single line with controls, e.g. to erase, upload or download this track. Add this to your theme and override the maprendering to change the appearance of the travelled track.",minzoom:0,source:{osmTags:{and:["id=location_track"]},maxCacheAge:0},title:{render:"Your travelled path"},shownByDefault:!1,tagRenderings:[{id:"Privacy notice",render:{en:"This is the path you've travelled since this website is opened. Don't worry - this is only visible to you and no one else. Your location data is never sent off-device.",nl:"Dit is waar je was sinds je deze website hebt geopend. Dit is enkel zichtbaar voor jou en niemand anders. Je locatie wordt niet verstuurd buiten je apparaat.",de:"Dies ist der Weg, den Sie seit dem Besuch dieser Webseite zurückgelegt haben. Keine Sorge - diese Daten sind nur für Sie sichtbar und für niemanden sonst. Ihre Standortdaten werden niemals an ein anderes Gerät gesendet.",fr:"C'est le chemin que vous avez parcouru depuis l'ouverture de ce site. Ne vous inquiétez pas - ceci n'est visible que pour vous et personne d'autre. Vos données de localisation ne sont jamais envoyées hors de l'appareil.",ca:"Aquest és el camí que heu recorregut des que s'ha obert aquest lloc web. No et preocupis: això només és visible per a tu i ningú més. Les vostres dades d'ubicació mai s'envien fora del dispositiu."}},{description:"Shows a button to export this feature as GPX. Especially useful for route relations",render:"{export_as_gpx()}",id:"export_as_gpx",source:"shared-questions"},{description:"Shows a button to export this feature as geojson. Especially useful for debugging or using this in other programs",render:"{export_as_geojson()}",id:"export_as_geojson",source:"shared-questions"},{id:"upload_to_osm",render:"{upload_to_osm()}"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"},{id:"delete",render:"{clear_location_history()}"}],name:{en:"Your travelled track",nl:"Jouw afgelegde route",de:"Zurückgelegte Strecke",fr:"Votre chemin parcouru",da:"Dit tilbagelagte spor",ca:"La teva traça recorreguda"},mapRendering:[{width:3,color:"#bb000077"}],syncSelection:"global",titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]}],D=!0,T="assets/SocialImage.png",r={id:w,title:v,shortDescription:y,description:j,credits:x,icon:A,startLat:B,startLon:G,startZoom:R,layers:S,hideFromOverview:D,socialImage:T};document.getElementById("decoration-desktop").remove();new l(["Initializing... <br/>",new m("<a>If this message persist, something went wrong - click here to try again</a>").SetClass("link-underline small").onClick(()=>{localStorage.clear(),window.location.reload(!0)})]).AttachTo("centermessage");_.initialize();u.implement(new f);b.Implement();p.DisableLongPresses();new URLSearchParams(window.location.search).get("test")==="true"&&console.log(r);const a=new k(r);if((a==null?void 0:a.id)==="cyclofix"){const t=e.GetQueryParameter("layer-bike_shops","true","Legacy - keep De Fietsambassade working"),n=e.GetQueryParameter("layer-bike_shop","true","Legacy - keep De Fietsambassade working");t.data!=="true"&&n.setData(t.data),console.log("layer-bike_shop toggles: legacy:",t.data,"new:",n.data);const d=e.GetQueryParameter("layer-bike_cafes","true","Legacy - keep De Fietsambassade working"),g=e.GetQueryParameter("layer-bike_cafe","true","Legacy - keep De Fietsambassade working");d.data!=="true"&&g.setData(t.data)}const s=new o;i.state=new i(a);o.state=s;window.mapcomplete_state=i.state;const z=e.GetQueryParameter("mode","map","The mode the application starts in, e.g. 'map' or 'dashboard'");z.data==="dashboard"?new c(i.state,s).setup():new h(i.state,s).setup();
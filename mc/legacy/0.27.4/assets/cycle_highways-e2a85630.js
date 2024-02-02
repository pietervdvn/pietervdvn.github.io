import{C as g,F as m,J as c,Q as e}from"./SvelteUIElement-65e2316e.js";import{S as h,D as p,a as u}from"./DashboardGui-2a21c1bf.js";import"./ToSvelte-f31dc93e.js";/* empty css                        *//* empty css                     *//* empty css                  */import{A as k}from"./ChartJs-67377275.js";import{M as w,A as f,L as b,D as o}from"./theme_overview-a86fbb0c.js";import{S as i}from"./MoreScreen-ffc396af.js";import"./LanguagePicker-6f35b94e.js";import"./List-1747898b.js";import"./SubtleButton-eb81d210.js";import"./language_native-373a312a.js";import"./language_translations-d2c4c2fc.js";import"./UserInformation-cb7582d0.js";import"./defineProperty-bf1f4e26.js";import"./_commonjsHelpers-edff4021.js";import"./BBox-aa5284c9.js";import"./ContactLink-5ac5344d.js";import"./BackToIndex-6df98ec5.js";const y="cycle_highways",v={en:"Cycle highways",de:"Radschnellwege",it:"Strade per velocipedi",ca:"Vies ciclistes",fr:"Aménagements cyclables",nl:"Fietssnelwegen",es:"Autovías ciclistas",nb_NO:"Sykkelmotorveier",da:"Cykelmotorveje",pa_PK:"سائیکل‌وے",cs:"Cyklodálnice",_context:"themes:cycle_highways.title"},_=!0,x="./assets/themes/cycle_highways/fietssnelwegen-logo.svg",R=60,q={en:"This map shows cycle highways",de:"Diese Karte zeigt Radschnellwege",it:"Questa cartina mostra le strade per velocipedi",fr:"Cette carte affiche les aménagements cyclables",nl:"Deze kaart toont fietssnelwegen",es:"Este mapa muestra autovías ciclistas",nb_NO:"Kart som viser sykkelmotorveier",ca:"Aquest mapa mostra carrils bici",da:"Dette kort viser cykelmotorveje",cs:"Tato mapa zobrazuje cyklostezky",_context:"themes:cycle_highways.description"},T=51.1599,D=3.3475,S=10,A={maxZoom:1},z=1.1,C=!0,j=!0,I=[{id:"cycle_highways",tagRenderings:[{render:"The name is <b>{name}</b>",question:"What is the name of this cycle highway?",freeform:{key:"name"},id:"cycle_highways-name"},{render:"Referentienummer is <b>{ref}</b>",question:"What is the reference number of this cycle highway?",freeform:{key:"ref"},id:"cycle_highways-ref"},{render:"The current state of this link is {state}",question:"What is the state of this link?",freeform:{key:"state"},mappings:[{if:{and:["state=proposed","note:state="]},then:"This is a proposed route which can be cycled"},{then:"This is a proposed route which has missing links (thus: some parts don't even have a building permit yet)",if:{and:["state=proposed","note:state=has_highway_no"]}},{then:"This is a proposed route which has some links which are under construction",if:{and:["state=proposed","note:state=has_highway_under_construction"]}},{if:"state=temporary",then:"This is a temporary deviation"},{if:"state=",then:"This link is operational and signposted"}],id:"cycle_highways-state"},{id:"cycle-highway-length",render:"This part is {_length:km}km long"},{labels:["contact"],question:{en:"What is the website of {title()}?",nl:"Wat is de website van {title()}?",fr:"Quel est le site web de {title()} ?",gl:"Cal é a páxina web de {title()}?",nb_NO:"Hva er nettsiden til {title()}?",ru:"Какой сайт у {title()}?",id:"Apa situs web dari {title()}?",zh_Hant:"{title()} 網址是什麼？",it:"Qual è il sito web di {title()}?",de:"Wie lautet die Webseite von {title()}?",pt_BR:"Qual o site de {title()}?",pl:"Jaka jest strona internetowa {title()}?",sv:"Vad är webbplatsen för {title()}?",pt:"Qual é o sítio web de {title()}?",eo:"Kie estas la retejo de {title()}?",hu:"Mi a weboldala ennek: {title()}?",ca:"Quina és la web de {title()}?",ja:"{title()}のウェブサイトは？",fil:"Ano ang website ng {title()}?",es:"¿Cual es el sitio web de {title()}?",zh_Hans:"{title()} 的网站为何？",da:"Hvad er webstedet for {title()}?",cs:"Jaká je webová stránka {title()}?"},render:"<a href='{website}' rel='nofollow noopener noreferrer' target='_blank'>{website}</a>",freeform:{key:"website",type:"url",addExtraTags:["contact:website="]},mappings:[{if:"contact:website~*",then:"<a href='{contact:website}' rel='nofollow noopener noreferrer' target='_blank'>{contact:website}</a>",hideInAnswer:!0}],id:"website",source:"shared-questions"},{description:"Shows a table with all the tags of the feature",render:"{all_tags()}",id:"all_tags",source:"shared-questions"},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],name:{en:"cycle highways",de:"Radschnellwege",ca:"vies ciclistes",fr:"Aménagements cyclables",nl:"fietssnelwegen",es:"autovías ciclistas",nb_NO:"sykkelmotorveier",da:"cykelmotorveje",pa_PK:"سائیکل‌وے",cs:"cyklodálnice",_context:"themes:cycle_highways.layers.cycle_highways.name"},source:{osmTags:"cycle_network=BE-VLG:cycle_highway"},minzoom:8,title:{render:{en:"cycle highway",de:"Radschnellweg",ca:"via ciclista",fr:"Aménagement cyclable",nl:"fietssnelweg",es:"autovía ciclista",nb_NO:"sykkelmotorvei",da:"cykelmotorvej",pa_PK:"سائیکل‌وے",cs:"cyklodálnice",_context:"themes:cycle_highways.layers.cycle_highways.title.render"}},filter:[{id:"name-alt",options:[{question:"Name contains 'alt'",osmTags:"name~i~.*alt.*"}]},{id:"name-wenslijn",options:[{question:"Name contains 'wenslijn'",osmTags:"name~i~.*wenslijn.*"}]},{id:"name-omleiding",options:[{question:"Name contains 'omleiding'",osmTags:"name~i~.*omleiding.*"}]},{id:"ref-alt",options:[{question:"Reference contains 'alt'",osmTags:"ref~i~.*aAlt.*"}]},{id:"missing_link",options:[{question:"No filter"},{question:"Has missing links (note:state=has_highway_no)",osmTags:"note:state=has_highway_no"},{question:"Has links which are under construction (note:state=has_highway_under_construction)",osmTags:"note:state=has_highway_under_construction"},{question:"Has links which are proposed (note:state=has_highway_proposed)",osmTags:"note:state=has_highway_proposed"}]},{id:"proposed",options:[{question:"No filter"},{question:"state=proposed",osmTags:"state=proposed"},{question:"state=temporary",osmTags:"state=temporary"},{question:"state unset",osmTags:"state="},{question:"Other state",osmTags:{and:["state!=","state!=proposed","state!=temporary"]}}]}],mapRendering:[{color:{render:"#ff7392",mappings:[{if:"state=",then:"#00acfc"},{if:"state=temporary",then:"#00acfc"}]},width:{render:"4"},dashArray:{render:"",mappings:[{if:"state=temporary",then:"12 10"},{if:"note:state=has_highway_no",then:"0 8"},{if:"note:state=has_highway_under_construction",then:"12 10"}]}}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"selected_element",description:{en:"Highlights the currently selected element. Override this layer to have different colors",nl:"Toont het geselecteerde element",de:"Hebt das aktuell ausgewählte Element hervor. Überschreiben Sie diese Ebene, um unterschiedliche Farben zu erhalten",fr:"Met en surbrillance l'élément actuellement sélectioné. Surcharger cette couche pour avoir d'autres couleurs.",ca:"Ressalta l'element seleccionat actualment. Anul·leu aquesta capa per tenir diferents colors"},source:{osmTags:{and:["selected=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:red",id:"circlered"},iconSize:"1,1,center",location:["point","projected_centerpoint"],css:"box-shadow: red 0 0 20px 20px; z-index: -1; height: 1px; width: 1px;",cssClasses:"block relative rounded-full"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location",description:"Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) (except latitude and longitude) returned by the browser, such as `speed`, `altitude`, `heading`, ....",minzoom:0,source:{osmTags:{and:["id=gps"]},maxCacheAge:0},mapRendering:[{icon:{render:"crosshair:var(--catch-detail-color)",mappings:[{if:"speed>2",then:"gps_arrow"}]},iconSize:"40,40,center",rotation:{render:"0deg",mappings:[{if:{and:["speed>2","heading!=NaN"]},then:"{heading}deg"}]},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location_history",description:"Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object",minzoom:1,name:null,source:{osmTags:{and:["user:location=yes"]},"#":"Cache is disabled here as these points are kept seperately",maxCacheAge:0},shownByDefault:!1,mapRendering:[{location:["point","centroid"],icon:{render:"square:red",id:"squarered"},iconSize:"5,5,center"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"home_location",description:"Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.",minzoom:0,source:{osmTags:{and:["user:home=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:white;./assets/svg/home.svg"},iconSize:{render:"20,20,center"},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_track",description:"Meta layer showing the previous locations of the user as single line with controls, e.g. to erase, upload or download this track. Add this to your theme and override the maprendering to change the appearance of the travelled track.",minzoom:0,source:{osmTags:{and:["id=location_track"]},maxCacheAge:0},title:{render:"Your travelled path"},shownByDefault:!1,tagRenderings:[{id:"Privacy notice",render:{en:"This is the path you've travelled since this website is opened. Don't worry - this is only visible to you and no one else. Your location data is never sent off-device.",nl:"Dit is waar je was sinds je deze website hebt geopend. Dit is enkel zichtbaar voor jou en niemand anders. Je locatie wordt niet verstuurd buiten je apparaat.",de:"Dies ist der Weg, den Sie seit dem Besuch dieser Webseite zurückgelegt haben. Keine Sorge - diese Daten sind nur für Sie sichtbar und für niemanden sonst. Ihre Standortdaten werden niemals an ein anderes Gerät gesendet.",fr:"C'est le chemin que vous avez parcouru depuis l'ouverture de ce site. Ne vous inquiétez pas - ceci n'est visible que pour vous et personne d'autre. Vos données de localisation ne sont jamais envoyées hors de l'appareil.",ca:"Aquest és el camí que heu recorregut des que s'ha obert aquest lloc web. No et preocupis: això només és visible per a tu i ningú més. Les vostres dades d'ubicació mai s'envien fora del dispositiu."}},{description:"Shows a button to export this feature as GPX. Especially useful for route relations",render:"{export_as_gpx()}",id:"export_as_gpx",source:"shared-questions"},{description:"Shows a button to export this feature as geojson. Especially useful for debugging or using this in other programs",render:"{export_as_geojson()}",id:"export_as_geojson",source:"shared-questions"},{id:"upload_to_osm",render:"{upload_to_osm()}"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"},{id:"delete",render:"{clear_location_history()}"}],name:{en:"Your travelled track",nl:"Jouw afgelegde route",de:"Zurückgelegte Strecke",fr:"Votre chemin parcouru",da:"Dit tilbagelagte spor",ca:"La teva traça recorreguda"},mapRendering:[{width:3,color:"#bb000077"}],syncSelection:"global",titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]}],W="CartoDB.Positron",L="L'imaginaire",P="assets/SocialImage.png",r={id:y,title:v,hideFromOverview:_,icon:x,"#overpassUrl":"https://overpass.kumi.systems/api/interpreter",overpassTimeout:R,description:q,startLat:T,startLon:D,startZoom:S,clustering:A,widenFactor:z,enableDownload:C,enablePdfDownload:j,layers:I,defaultBackgroundId:W,credits:L,socialImage:P};document.getElementById("decoration-desktop").remove();new g(["Initializing... <br/>",new m("<a>If this message persist, something went wrong - click here to try again</a>").SetClass("link-underline small").onClick(()=>{localStorage.clear(),window.location.reload(!0)})]).AttachTo("centermessage");w.initialize();k.implement(new f);h.Implement();c.DisableLongPresses();new URLSearchParams(window.location.search).get("test")==="true"&&console.log(r);const a=new b(r);if((a==null?void 0:a.id)==="cyclofix"){const t=e.GetQueryParameter("layer-bike_shops","true","Legacy - keep De Fietsambassade working"),n=e.GetQueryParameter("layer-bike_shop","true","Legacy - keep De Fietsambassade working");t.data!=="true"&&n.setData(t.data),console.log("layer-bike_shop toggles: legacy:",t.data,"new:",n.data);const l=e.GetQueryParameter("layer-bike_cafes","true","Legacy - keep De Fietsambassade working"),d=e.GetQueryParameter("layer-bike_cafe","true","Legacy - keep De Fietsambassade working");l.data!=="true"&&d.setData(t.data)}const s=new o;i.state=new i(a);o.state=s;window.mapcomplete_state=i.state;const N=e.GetQueryParameter("mode","map","The mode the application starts in, e.g. 'map' or 'dashboard'");N.data==="dashboard"?new p(i.state,s).setup():new u(i.state,s).setup();
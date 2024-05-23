import{C as m,F as g,J as c,Q as e}from"./SvelteUIElement-65e2316e.js";import{S as p,D as h,a as u}from"./DashboardGui-fdad2a4c.js";import"./ToSvelte-f31dc93e.js";/* empty css                        *//* empty css                     *//* empty css                  */import{A as b}from"./ChartJs-49671581.js";import{M as f,A as k,L as v,D as o}from"./theme_overview-565fd281.js";import{S as t}from"./MoreScreen-67292bb5.js";import"./LanguagePicker-6f35b94e.js";import"./List-1747898b.js";import"./SubtleButton-eb81d210.js";import"./language_native-373a312a.js";import"./language_translations-d2c4c2fc.js";import"./UserInformation-6fea1f2a.js";import"./defineProperty-bf1f4e26.js";import"./_commonjsHelpers-edff4021.js";import"./BBox-aa5284c9.js";import"./ContactLink-5ac5344d.js";import"./BackToIndex-6df98ec5.js";const _="fruit_trees",w={nl:"Open Boomgaardenkaart",_context:"themes:fruit_trees.title"},y={nl:"Boomgaarden en fruitbomen",_context:"themes:fruit_trees.shortDescription"},x={nl:"Op deze kaart vindt je boomgaarden en fruitbomen",_context:"themes:fruit_trees.description"},z="./assets/themes/fruit_trees/fruit_tree.svg",j=0,D=0,S=1,q=2,R=!0,T=[{id:"orchards",name:{nl:"Boomgaarden",_context:"themes:fruit_trees.layers.orchards.name"},minzoom:12,source:{osmTags:{and:["landuse=orchard"]}},title:{render:{nl:"Boomgaard",_context:"themes:fruit_trees.layers.orchards.title.render"}},tagRenderings:[{description:"This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`",render:"{image_carousel()}{image_upload()}{nearby_images(expandable)}",id:"images",source:"shared-questions"},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],presets:[{tags:["landuse=orchard","fixme=Added with mapcomplete - geometry still to draw"],title:{nl:"een boomgaard",_context:"themes:fruit_trees.layers.orchards.presets.0.title"},description:{nl:"Voeg een boomgaard toe (als punt - omtrek nog te tekenen)",_context:"themes:fruit_trees.layers.orchards.presets.0.description"}}],mapRendering:[{icon:{render:"./assets/themes/buurtnatuur/forest.svg"},iconSize:{render:"40,40,center"},location:["point"]},{color:{render:"#00f"},width:{render:"8"}}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"fruitboom",name:{nl:"Boom",_context:"themes:fruit_trees.layers.fruitboom.name"},minzoom:12,source:{osmTags:{and:["natural=tree"]}},title:{render:{nl:"Boom",_context:"themes:fruit_trees.layers.fruitboom.title.render"}},description:{nl:"Een boom",_context:"themes:fruit_trees.layers.fruitboom.description"},tagRenderings:[{render:{nl:"De soort is {species:nl}",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-species:nl.render"},question:{nl:"Wat is de soort van deze boom (in het Nederlands)?",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-species:nl.question"},freeform:{key:"species:nl"},id:"fruitboom-species:nl"},{render:{nl:"Het ras (taxon) van deze boom is <b>{taxon}</b>",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-taxon.render"},question:{nl:"Wat is het taxon (ras) van deze boom?",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-taxon.question"},freeform:{key:"taxon"},condition:{and:["species:nl~*"]},id:"fruitboom-taxon"},{render:{nl:"Beschrijving: <i>{description}</i>",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-description.render"},question:{nl:"Welke beschrijving past bij deze boom?",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-description.question"},freeform:{key:"description"},id:"fruitboom-description"},{render:{nl:"Referentienummer: <b>{ref}</b>",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-ref.render"},question:{nl:"Is er een refernetienummer?",_context:"themes:fruit_trees.layers.fruitboom.tagRenderings.fruitboom-ref.question"},freeform:{key:"ref"},id:"fruitboom-ref"},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],presets:[{tags:["natural=tree"],title:{nl:"een boom",_context:"themes:fruit_trees.layers.fruitboom.presets.0.title"},description:{nl:"Voeg hier een boom toe",_context:"themes:fruit_trees.layers.fruitboom.presets.0.description"}}],mapRendering:[{icon:{render:"./assets/themes/fruit_trees/fruit_tree.svg"},iconSize:{render:"40,40,center"},location:["point"]},{color:{render:"#00f"},width:{render:"8"}}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"selected_element",description:{en:"Highlights the currently selected element. Override this layer to have different colors",nl:"Toont het geselecteerde element",de:"Hebt das aktuell ausgewählte Element hervor. Überschreiben Sie diese Ebene, um unterschiedliche Farben zu erhalten",fr:"Met en surbrillance l'élément actuellement sélectioné. Surcharger cette couche pour avoir d'autres couleurs.",ca:"Ressalta l'element seleccionat actualment. Anul·leu aquesta capa per tenir diferents colors"},source:{osmTags:{and:["selected=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:red",id:"circlered"},iconSize:"1,1,center",location:["point","projected_centerpoint"],css:"box-shadow: red 0 0 20px 20px; z-index: -1; height: 1px; width: 1px;",cssClasses:"block relative rounded-full"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location",description:"Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) (except latitude and longitude) returned by the browser, such as `speed`, `altitude`, `heading`, ....",minzoom:0,source:{osmTags:{and:["id=gps"]},maxCacheAge:0},mapRendering:[{icon:{render:"crosshair:var(--catch-detail-color)",mappings:[{if:"speed>2",then:"gps_arrow"}]},iconSize:"40,40,center",rotation:{render:"0deg",mappings:[{if:{and:["speed>2","heading!=NaN"]},then:"{heading}deg"}]},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location_history",description:"Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object",minzoom:1,name:null,source:{osmTags:{and:["user:location=yes"]},"#":"Cache is disabled here as these points are kept seperately",maxCacheAge:0},shownByDefault:!1,mapRendering:[{location:["point","centroid"],icon:{render:"square:red",id:"squarered"},iconSize:"5,5,center"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"home_location",description:"Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.",minzoom:0,source:{osmTags:{and:["user:home=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:white;./assets/svg/home.svg"},iconSize:{render:"20,20,center"},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_track",description:"Meta layer showing the previous locations of the user as single line with controls, e.g. to erase, upload or download this track. Add this to your theme and override the maprendering to change the appearance of the travelled track.",minzoom:0,source:{osmTags:{and:["id=location_track"]},maxCacheAge:0},title:{render:"Your travelled path"},shownByDefault:!1,tagRenderings:[{id:"Privacy notice",render:{en:"This is the path you've travelled since this website is opened. Don't worry - this is only visible to you and no one else. Your location data is never sent off-device.",nl:"Dit is waar je was sinds je deze website hebt geopend. Dit is enkel zichtbaar voor jou en niemand anders. Je locatie wordt niet verstuurd buiten je apparaat.",de:"Dies ist der Weg, den Sie seit dem Besuch dieser Webseite zurückgelegt haben. Keine Sorge - diese Daten sind nur für Sie sichtbar und für niemanden sonst. Ihre Standortdaten werden niemals an ein anderes Gerät gesendet.",fr:"C'est le chemin que vous avez parcouru depuis l'ouverture de ce site. Ne vous inquiétez pas - ceci n'est visible que pour vous et personne d'autre. Vos données de localisation ne sont jamais envoyées hors de l'appareil.",ca:"Aquest és el camí que heu recorregut des que s'ha obert aquest lloc web. No et preocupis: això només és visible per a tu i ningú més. Les vostres dades d'ubicació mai s'envien fora del dispositiu."}},{description:"Shows a button to export this feature as GPX. Especially useful for route relations",render:"{export_as_gpx()}",id:"export_as_gpx",source:"shared-questions"},{description:"Shows a button to export this feature as geojson. Especially useful for debugging or using this in other programs",render:"{export_as_geojson()}",id:"export_as_geojson",source:"shared-questions"},{id:"upload_to_osm",render:"{upload_to_osm()}"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"},{id:"delete",render:"{clear_location_history()}"}],name:{en:"Your travelled track",nl:"Jouw afgelegde route",de:"Zurückgelegte Strecke",fr:"Votre chemin parcouru",da:"Dit tilbagelagte spor",ca:"La teva traça recorreguda"},mapRendering:[{width:3,color:"#bb000077"}],syncSelection:"global",titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"note_import_orchards",description:{ca:"Una capa que importa entrades per a Boomgaard",cs:"Vrstva, která importuje položky pro Boomgaard",da:"Et lag som importerer poster for Boomgaard",de:"Eine Ebene, die Einträge für Boomgaard importiert",en:"A layer which imports entries for Boomgaard",es:"Una capa que importar entradas para Boomgaard",nl:"Deze laag toont kaart-nota's die wijzen op een Boomgaard",zh_Hant:"能夠為 Boomgaard 匯入項目的圖層",_context:"core:importLayer.description"},source:{osmTags:{and:["id~*"]},geoJson:"https://api.openstreetmap.org/api/0.6/notes.json?limit=10000&closed=0&bbox={x_min},{y_min},{x_max},{y_max}",geoJsonZoomLevel:10,maxCacheAge:0},minzoom:10,title:{render:{ca:"Pot ser que hi hagi een boomgaard aquí",cs:"Zde by mohl být een boomgaard",da:"Mulig een boomgaard",de:"Möglicherweise gibt es hier een boomgaard",en:"There might be een boomgaard here",es:"Puede haber een boomgaard aquí",nb_NO:"Det kan være een boomgaard her",nl:"Is hier een boomgaard?",zh_Hant:"這裡可能有 een boomgaard",_context:"core:importLayer.popupTitle"}},calculatedTags:["_first_comment=feat.get('comments')[0].text.toLowerCase()",`_trigger_index=(() => {const lines = feat.properties['_first_comment'].split('\\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.osm.be/\\([a-zA-Z_-]+\\)\\(.html\\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })()`,"_comments_count=feat.get('comments').length","_intro=(() => {const lines = feat.get('comments')[0].text.split('\\n'); lines.splice(feat.get('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})()","_tags=(() => {let lines = feat.get('comments')[0].text.split('\\n').map(l => l.trim()); lines.splice(0, feat.get('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})()"],isShown:{and:["_trigger_index~*",{or:[{and:["_tags~(^|.*;)landuse=orchard($|;.*)","_tags~(^|.*;)fixme=Added with mapcomplete - geometry still to draw($|;.*)"]}]}]},titleIcons:[{render:"<a href='https://openstreetmap.org/note/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'></a>"}],tagRenderings:[{id:"Intro",render:"{_intro}"},{id:"conversation",render:"{visualize_note_comments(comments,1)}",condition:"_comments_count>1"},{id:"import",render:{ca:"{import_button(orchards, _tags, he trobat un een boomgaard aquí; afegeix-lo al mapa,./assets/svg/addSmall.svg,,,id)}",cs:"{import_button(orchards, _tags, Našel jsem een boomgaard zde - přidejte ji do mapy,./assets/svg/addSmall.svg,,,id)}",da:"{import_button(orchards, _tags, Jeg har fundet en een boomgaard her - tilføj den til kortet,./assets/svg/addSmall.svg,,,id)}",de:"{import_button(orchards, _tags, Ich habe hier ein(en) een boomgaard gefunden - Zur Karte hinzufügen,./assets/svg/addSmall.svg,,,id)}",en:"{import_button(orchards, _tags, I have found a een boomgaard here - add it to the map,./assets/svg/addSmall.svg,,,id)}",es:"{import_button(orchards,_tags, He encontrado un(a) een boomgaard aquí - añádelo al mapa,./assets/svg/addSmall.svg,,,id)}",nl:"{import_button(orchards, _tags, Ik heb hier een een boomgaard gevonden - voeg deze toe aan de kaart...,./assets/svg/addSmall.svg,,,id)}",zh_Hant:"{import_button(orchards, _tags, 我在這邊發現 een boomgaard - 新增到地圖,./assets/svg/addSmall.svg,,,id)}",_context:"core:importLayer.importButton"},condition:"closed_at="},{id:"close_note_",render:{ca:"{close_note(No he pogut trobar een boomgaard: esborra-ho, ./assets/svg/close.svg, id, This feature does not exist, 18)}",cs:"{close_note(Nepodařilo se mi najít een boomgaard - odstraňte jej, ./assets/svg/close.svg, id, This feature does not exist, 18)}",da:"{close_note(Jeg kunne ikke finde een boomgaard - fjern det, ./assets/svg/close.svg, id, This feature does not exist, 18)}",de:"{close_note(Ich konnte een boomgaard nicht finden - entferne es, ./assets/svg/close.svg, id, This feature does not exist, 18)}",en:"{close_note(I could not find een boomgaard - remove it, ./assets/svg/close.svg, id, This feature does not exist, 18)}",es:"{close_note(No he podido encontrar een boomgaard - eliminarlo, ./assets/svg/close.svg, id, This feature does not exist, 18)}",nl:"{close_note(Ik kon hier geen een boomgaard vinden - verwijder deze van de kaart, ./assets/svg/close.svg, id, This feature does not exist, 18)}",zh_Hant:"{close_note(我無法找到 een boomgaard - 移除吧, ./assets/svg/close.svg, id, This feature does not exist, 18)}",_context:"core:importLayer.notFound"},condition:"closed_at="},{id:"close_note_mapped",render:{ca:"{close_note(Ja hi ha un een boomgaard al mapa - aquest punt és un duplicat, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",cs:"{close_note(Na mapě se již nachází een boomgaard - tento bod je duplicitní, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",da:"{close_note(Der er allerede en anden een boomgaard på kortet - dette punkt er en dublet, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",de:"{close_note(Es gibt bereits einen een boomgaard auf der Karte - dieser Punkt ist ein Duplikat, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",en:"{close_note(There already is een boomgaard on the map - this point is a duplicate, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",es:"{close_note(een boomgaard ya está en el mapa - este punto es un duplicado, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",nl:"{close_note(Er staat hier reeds een boomgaard op de kaart; dit punt is een duplicaat. Verwijder deze van de kaart, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",zh_Hant:"{close_note(een boomgaard 已經在地圖上了 - 這個點重覆了, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",_context:"core:importLayer.alreadyMapped"},condition:"closed_at="},{id:"handled",render:{ca:`<div class="thanks">Aquesta funció s'ha gestionat. Gràcies pel teu esforç.</div>`,cs:"<div class='thanks'>Tato funkce byla zpracována! Děkujeme za vaši snahu</div>",da:'<div class="thanks">Dette element er blevet håndteret! Tak for din indsats</div>',de:'<div class="thanks">Dieses Objekt wurde verarbeitet! Vielen Dank für Ihre Bemühungen</div>',en:"<div class='thanks'>This feature has been handled! Thanks for your effort</div>",nb_NO:"<div class='thanks'>Denne funksjonen har blitt håndtert. Takk for din innsats.</div>",nl:"<div class='thanks'>Dit object is afgehandeld. Bedankt om mee te helpen!</div>",zh_Hant:"<div class='thanks'>這個圖徵已經處理了！謝謝你的辛勞</div>",_context:"core:importLayer.importHandled"},condition:"closed_at~*"},{id:"comment",render:"{add_note_comment()}"},{id:"add_image",render:"{add_image_to_note()}"},{id:"nearby_images",render:{ca:"<h3>Imatges properes</h3>Les imatges següents són imatges geoetiquetades properes de diversos serveis en línia. Us poden ajudar a resoldre aquesta nota.{nearby_images(open)}",cs:"<h3>Obrázky z okolí</h3>Následující obrázky jsou geograficky označené obrázky z různých online služeb. Mohly by vám pomoci při řešení této poznámky.{nearby_images(open)}",da:"<h3>Billeder i nærheden</h3>De følgende billeder er geotaggede billeder i nærheden fra forskellige onlinetjenester. De kan måske hjælpe dig med at løse denne note.{nearby_images(open)}",de:"<h3>Bilder in der Nähe</h3>Die folgenden Bilder sind mit Geotags versehene Bilder aus verschiedenen Online-Diensten in der Nähe. Sie können helfen, diesen Hinweis zu lösen.{nearby_images(open)}",en:"<h3>Nearby pictures</h3>The following pictures are nearby geotagged pictures from various online services. They might help you to resolve this note.{nearby_images(open)}",es:"<h3>Imágenes cercanas</h3> Las siguientes imágenes son imágenes geoetiquetadas cerca de varios servicios en línea. Pueden ayudarte a resolver esta nota. {nearby_images(open)}",nl:"<h3>Afbeeldingen in de buurt</h3>De volgende afbeeldingen zijn in de buurt gemaakt en kunnen mogelijks helpen. {nearby_images(open)}",zh_Hant:"<h3>附近圖片</h3>接下來的圖片是多個第三方線上服務附近有地理標籤的圖片，也許能協助你解決這個註解。{nearby_images(open)}",_context:"core:importLayer.nearbyImagesIntro"}},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],mapRendering:[{location:["point"],icon:{render:"circle:white;help:black",mappings:[{if:{or:["closed_at~*","_imported=yes"]},then:"circle:white;checkmark:black"}]},iconSize:"40,40,center"}]},{id:"note_import_fruitboom",description:{ca:"Una capa que importa entrades per a Boom",cs:"Vrstva, která importuje položky pro Boom",da:"Et lag som importerer poster for Boom",de:"Eine Ebene, die Einträge für Boom importiert",en:"A layer which imports entries for Boom",es:"Una capa que importar entradas para Boom",nl:"Deze laag toont kaart-nota's die wijzen op een Boom",zh_Hant:"能夠為 Boom 匯入項目的圖層",_context:"core:importLayer.description"},source:{osmTags:{and:["id~*"]},geoJson:"https://api.openstreetmap.org/api/0.6/notes.json?limit=10000&closed=0&bbox={x_min},{y_min},{x_max},{y_max}",geoJsonZoomLevel:10,maxCacheAge:0},minzoom:10,title:{render:{ca:"Pot ser que hi hagi een boom aquí",cs:"Zde by mohl být een boom",da:"Mulig een boom",de:"Möglicherweise gibt es hier een boom",en:"There might be een boom here",es:"Puede haber een boom aquí",nb_NO:"Det kan være een boom her",nl:"Is hier een boom?",zh_Hant:"這裡可能有 een boom",_context:"core:importLayer.popupTitle"}},calculatedTags:["_first_comment=feat.get('comments')[0].text.toLowerCase()",`_trigger_index=(() => {const lines = feat.properties['_first_comment'].split('\\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.osm.be/\\([a-zA-Z_-]+\\)\\(.html\\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })()`,"_comments_count=feat.get('comments').length","_intro=(() => {const lines = feat.get('comments')[0].text.split('\\n'); lines.splice(feat.get('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})()","_tags=(() => {let lines = feat.get('comments')[0].text.split('\\n').map(l => l.trim()); lines.splice(0, feat.get('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})()"],isShown:{and:["_trigger_index~*",{or:[{and:["_tags~(^|.*;)natural=tree($|;.*)"]}]}]},titleIcons:[{render:"<a href='https://openstreetmap.org/note/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'></a>"}],tagRenderings:[{id:"Intro",render:"{_intro}"},{id:"conversation",render:"{visualize_note_comments(comments,1)}",condition:"_comments_count>1"},{id:"import",render:{ca:"{import_button(fruitboom, _tags, he trobat un een boom aquí; afegeix-lo al mapa,./assets/svg/addSmall.svg,,,id)}",cs:"{import_button(fruitboom, _tags, Našel jsem een boom zde - přidejte ji do mapy,./assets/svg/addSmall.svg,,,id)}",da:"{import_button(fruitboom, _tags, Jeg har fundet en een boom her - tilføj den til kortet,./assets/svg/addSmall.svg,,,id)}",de:"{import_button(fruitboom, _tags, Ich habe hier ein(en) een boom gefunden - Zur Karte hinzufügen,./assets/svg/addSmall.svg,,,id)}",en:"{import_button(fruitboom, _tags, I have found a een boom here - add it to the map,./assets/svg/addSmall.svg,,,id)}",es:"{import_button(fruitboom,_tags, He encontrado un(a) een boom aquí - añádelo al mapa,./assets/svg/addSmall.svg,,,id)}",nl:"{import_button(fruitboom, _tags, Ik heb hier een een boom gevonden - voeg deze toe aan de kaart...,./assets/svg/addSmall.svg,,,id)}",zh_Hant:"{import_button(fruitboom, _tags, 我在這邊發現 een boom - 新增到地圖,./assets/svg/addSmall.svg,,,id)}",_context:"core:importLayer.importButton"},condition:"closed_at="},{id:"close_note_",render:{ca:"{close_note(No he pogut trobar een boom: esborra-ho, ./assets/svg/close.svg, id, This feature does not exist, 18)}",cs:"{close_note(Nepodařilo se mi najít een boom - odstraňte jej, ./assets/svg/close.svg, id, This feature does not exist, 18)}",da:"{close_note(Jeg kunne ikke finde een boom - fjern det, ./assets/svg/close.svg, id, This feature does not exist, 18)}",de:"{close_note(Ich konnte een boom nicht finden - entferne es, ./assets/svg/close.svg, id, This feature does not exist, 18)}",en:"{close_note(I could not find een boom - remove it, ./assets/svg/close.svg, id, This feature does not exist, 18)}",es:"{close_note(No he podido encontrar een boom - eliminarlo, ./assets/svg/close.svg, id, This feature does not exist, 18)}",nl:"{close_note(Ik kon hier geen een boom vinden - verwijder deze van de kaart, ./assets/svg/close.svg, id, This feature does not exist, 18)}",zh_Hant:"{close_note(我無法找到 een boom - 移除吧, ./assets/svg/close.svg, id, This feature does not exist, 18)}",_context:"core:importLayer.notFound"},condition:"closed_at="},{id:"close_note_mapped",render:{ca:"{close_note(Ja hi ha un een boom al mapa - aquest punt és un duplicat, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",cs:"{close_note(Na mapě se již nachází een boom - tento bod je duplicitní, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",da:"{close_note(Der er allerede en anden een boom på kortet - dette punkt er en dublet, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",de:"{close_note(Es gibt bereits einen een boom auf der Karte - dieser Punkt ist ein Duplikat, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",en:"{close_note(There already is een boom on the map - this point is a duplicate, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",es:"{close_note(een boom ya está en el mapa - este punto es un duplicado, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",nl:"{close_note(Er staat hier reeds een boom op de kaart; dit punt is een duplicaat. Verwijder deze van de kaart, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",zh_Hant:"{close_note(een boom 已經在地圖上了 - 這個點重覆了, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",_context:"core:importLayer.alreadyMapped"},condition:"closed_at="},{id:"handled",render:{ca:`<div class="thanks">Aquesta funció s'ha gestionat. Gràcies pel teu esforç.</div>`,cs:"<div class='thanks'>Tato funkce byla zpracována! Děkujeme za vaši snahu</div>",da:'<div class="thanks">Dette element er blevet håndteret! Tak for din indsats</div>',de:'<div class="thanks">Dieses Objekt wurde verarbeitet! Vielen Dank für Ihre Bemühungen</div>',en:"<div class='thanks'>This feature has been handled! Thanks for your effort</div>",nb_NO:"<div class='thanks'>Denne funksjonen har blitt håndtert. Takk for din innsats.</div>",nl:"<div class='thanks'>Dit object is afgehandeld. Bedankt om mee te helpen!</div>",zh_Hant:"<div class='thanks'>這個圖徵已經處理了！謝謝你的辛勞</div>",_context:"core:importLayer.importHandled"},condition:"closed_at~*"},{id:"comment",render:"{add_note_comment()}"},{id:"add_image",render:"{add_image_to_note()}"},{id:"nearby_images",render:{ca:"<h3>Imatges properes</h3>Les imatges següents són imatges geoetiquetades properes de diversos serveis en línia. Us poden ajudar a resoldre aquesta nota.{nearby_images(open)}",cs:"<h3>Obrázky z okolí</h3>Následující obrázky jsou geograficky označené obrázky z různých online služeb. Mohly by vám pomoci při řešení této poznámky.{nearby_images(open)}",da:"<h3>Billeder i nærheden</h3>De følgende billeder er geotaggede billeder i nærheden fra forskellige onlinetjenester. De kan måske hjælpe dig med at løse denne note.{nearby_images(open)}",de:"<h3>Bilder in der Nähe</h3>Die folgenden Bilder sind mit Geotags versehene Bilder aus verschiedenen Online-Diensten in der Nähe. Sie können helfen, diesen Hinweis zu lösen.{nearby_images(open)}",en:"<h3>Nearby pictures</h3>The following pictures are nearby geotagged pictures from various online services. They might help you to resolve this note.{nearby_images(open)}",es:"<h3>Imágenes cercanas</h3> Las siguientes imágenes son imágenes geoetiquetadas cerca de varios servicios en línea. Pueden ayudarte a resolver esta nota. {nearby_images(open)}",nl:"<h3>Afbeeldingen in de buurt</h3>De volgende afbeeldingen zijn in de buurt gemaakt en kunnen mogelijks helpen. {nearby_images(open)}",zh_Hant:"<h3>附近圖片</h3>接下來的圖片是多個第三方線上服務附近有地理標籤的圖片，也許能協助你解決這個註解。{nearby_images(open)}",_context:"core:importLayer.nearbyImagesIntro"}},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],mapRendering:[{location:["point"],icon:{render:"circle:white;help:black",mappings:[{if:{or:["closed_at~*","_imported=yes"]},then:"circle:white;checkmark:black"}]},iconSize:"40,40,center"}]}],I="assets/SocialImage.png",r={id:_,title:w,shortDescription:y,description:x,icon:z,startLat:j,startLon:D,startZoom:S,widenFactor:q,hideFromOverview:R,layers:T,socialImage:I};document.getElementById("decoration-desktop").remove();new m(["Initializing... <br/>",new g("<a>If this message persist, something went wrong - click here to try again</a>").SetClass("link-underline small").onClick(()=>{localStorage.clear(),window.location.reload(!0)})]).AttachTo("centermessage");f.initialize();b.implement(new k);p.Implement();c.DisableLongPresses();new URLSearchParams(window.location.search).get("test")==="true"&&console.log(r);const s=new v(r);if((s==null?void 0:s.id)==="cyclofix"){const i=e.GetQueryParameter("layer-bike_shops","true","Legacy - keep De Fietsambassade working"),n=e.GetQueryParameter("layer-bike_shop","true","Legacy - keep De Fietsambassade working");i.data!=="true"&&n.setData(i.data),console.log("layer-bike_shop toggles: legacy:",i.data,"new:",n.data);const d=e.GetQueryParameter("layer-bike_cafes","true","Legacy - keep De Fietsambassade working"),l=e.GetQueryParameter("layer-bike_cafe","true","Legacy - keep De Fietsambassade working");d.data!=="true"&&l.setData(i.data)}const a=new o;t.state=new t(s);o.state=a;window.mapcomplete_state=t.state;const A=e.GetQueryParameter("mode","map","The mode the application starts in, e.g. 'map' or 'dashboard'");A.data==="dashboard"?new h(t.state,a).setup():new u(t.state,a).setup();
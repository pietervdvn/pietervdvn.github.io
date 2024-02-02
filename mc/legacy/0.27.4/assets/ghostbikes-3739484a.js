import{C as c,F as m,J as g,Q as e}from"./SvelteUIElement-65e2316e.js";import{S as p,D as h,a as u}from"./DashboardGui-2a21c1bf.js";import"./ToSvelte-f31dc93e.js";/* empty css                        *//* empty css                     *//* empty css                  */import{A as k}from"./ChartJs-67377275.js";import{M as b,A as f,L as v,D as o}from"./theme_overview-a86fbb0c.js";import{S as a}from"./MoreScreen-ffc396af.js";import"./LanguagePicker-6f35b94e.js";import"./List-1747898b.js";import"./SubtleButton-eb81d210.js";import"./language_native-373a312a.js";import"./language_translations-d2c4c2fc.js";import"./UserInformation-cb7582d0.js";import"./defineProperty-bf1f4e26.js";import"./_commonjsHelpers-edff4021.js";import"./BBox-aa5284c9.js";import"./ContactLink-5ac5344d.js";import"./BackToIndex-6df98ec5.js";const _="ghostbikes",w={en:"Ghost bikes",nl:"Witte Fietsen",de:"Geisterräder",ja:"ゴーストバイク",nb_NO:"Spøkelsessykler",zh_Hant:"幽靈單車",fr:"Vélo fantôme",eo:"Fantombicikloj",es:"Bicicleta blanca",fi:"Haamupyörä",gl:"Bicicleta pantasma",hu:"Szellemkerékpárok",it:"Bici fantasma",pl:"Duch roweru",pt_BR:"Bicicleta fantasma",ru:"Призрачные велосипеды",sv:"Spökcykel",da:"Spøgelsescykler",ca:"Bicicletes fantasmes",cs:"Kola duchů",_context:"themes:ghostbikes.title"},y={en:"A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident, in the form of a white bicycle placed permanently near the accident location.<br/><br/>On this map, one can see all the ghost bikes which are known by OpenStreetMap. Is a ghost bike missing? Everyone can add or update information here - you only need to have a (free) OpenStreetMap account. <p>There exists an <a href='https://masto.bike/@ghostbikebot' target='_blank'>automated account on Mastodon which posts a monthly overview of ghost bikes worldwide</a></p>",nl:"Een <b>Witte Fiets</b> of <b>Spookfiets</b> is een aandenken aan een fietser die bij een verkeersongeval om het leven kwam. Het gaat om een fiets die volledig wit is geschilderd en in de buurt van het ongeval werd geinstalleerd.<br/><br/>Op deze kaart zie je alle witte fietsen die door OpenStreetMap gekend zijn. Ontbreekt er een Witte Fiets of wens je informatie aan te passen? Meld je dan aan met een (gratis) OpenStreetMap account.",de:"<b>Geisterräder</b> sind weiße Fahrräder, die zum Gedenken tödlich verunglückter Radfahrer vor Ort aufgestellt wurden.<br/><br/> Auf dieser Karte sehen Sie alle Geisterräder, die in OpenStreetMap eingetragen sind. Fehlt ein Geisterrad? Jeder kann hier Informationen hinzufügen oder aktualisieren - Sie benötigen nur ein (kostenloses) OpenStreetMap-Konto.<p>Es gibt ein Konto <a href='https://masto.bike/@ghostbikebot' target='_blank'>auf Mastodon, das monatliche eine weltweite Übersicht von Geisterfahrrädern veröffentlicht</a></p>",ja:"<b>ゴーストバイク</b>は、交通事故で死亡したサイクリストを記念するもので、事故現場の近くに恒久的に置かれた白い自転車の形をしています。<br/><br/>このマップには、OpenStreetMapで知られているゴーストバイクがすべて表示されます。ゴーストバイクは行方不明ですか?誰でもここで情報の追加や更新ができます。必要なのは(無料の)OpenStreetMapアカウントだけです。",zh_Hant:"<b>幽靈單車</b>是用來紀念死於交通事故的單車騎士，在事發地點附近放置白色單車。<br/><br/>在這份地圖上面，你可以看到所有在開放街圖已知的幽靈單車。有缺漏的幽靈單車嗎？所有人都可以在這邊新增或是更新資訊-只有你有(免費)開放街圖帳號。",fr:"Les <b>vélos fantômes</b> sont des mémoriaux pour les cyclistes tuées sur la route, prenant la forme de vélos blancs placés à proximité des faits.<br/><br/>Cette carte indique leur emplacement à partir d’OpenStreetMap. Il est possible de contribuer aux informations ici, sous réserve d’avoir un compte OpenStreetMap (gratuit). <p>Il existe un <a href='https://masto.bike/@ghostbikebot' target='_blank'>compte automatisé Mastodon qui publie un aperçu mensuel des vélos fantômes à travers le monde</a></p>",it:"Una <b>bici fantasma</b> è un monumento in ricordo di un ciclista che è morto in un incidente stradale, che ha la forma di un una bicicletta bianca installata in maniera permanente ne luogo dell’incidente.<br/><br/>In questa cartina, è possibile vedere tutte le bici fantasma che sono state aggiunte su OpenStreetMap. Ne manca una? Chiunque può aggiungere o migliorare le informazioni qui presenti (è solo richiesto un account gratuito su OpenStreetMap).",hu:"A <b>szellemkerékpár</b> egy közlekedési balesetben elhunyt kerékpáros emlékműve: egy fehér kerékpár, amelyet állandó jelleggel a baleset helyszínének közelében helyeznek el.<br/><br/>A térképen az OpenStreetMap által ismert összes szellemkerékpár megtekinthető. Hiányzik róla egy szellemkerékpár? Bárki hozzáadhat vagy frissíthet adatokat – csak egy (ingyenes) OpenStreetMap-fiókra van szükség hozzá.",da:"En <b>spøgelsescykel</b> er et mindesmærke for en cyklist, der døde i en trafikulykke, i form af en hvid cykel placeret permanent i nærheden af ulykkesstedet.<br/><br/>På dette kort er en kan se alle de spøgelsescykler, som er kendt af OpenStreetMap. Mangler der en spøgelsescykel? Alle kan tilføje eller opdatere oplysninger her - du behøver kun at have en (gratis) OpenStreetMap-konto.",cs:"<b>Kolo duchů</b> je památník pro cyklisty, kteří zemřeli při dopravní nehodě, ve formě bílého kola trvale umístěného poblíž místa nehody.<br/><br/>Na této mapě je možné vidět všechna kola duchů, která jsou známa OpenStreetMap. Chybí na mapě nějaké? Každý může přidat nebo aktualizovat informace zde - stačí mít pouze (bezplatný) účet OpenStreetMap. <p>Na Mastodonu existuje <a href='https://masto.bike/@ghostbikebot' target='_blank'>automatizovaný účet, který posílá měsíční přehled kol duchů po celém světě</a></p>",es:"Una <b>bicicleta fantasma</b> es un monumento en memoria de un ciclista fallecido en un accidente de tráfico, en forma de una bicicleta blanca colocada permanentemente cerca del lugar del accidente.<br/><br/>En este mapa se pueden ver todas las bicicletas fantasma conocidas por OpenStreetMap. ¿Falta alguna bicicleta fantasma? Todo el mundo puede añadir o actualizar información aquí - sólo necesitas tener una cuenta (gratuita) de OpenStreetMap. <p>Existe una <a href='https://masto.bike/@ghostbikebot' target='_blank'>cuenta automatizada en Mastodon que publica un resumen mensual de las bicis fantasma de todo el mundo</a></p>",ca:"Una <b>bicicleta fantasma</b> és un monument commemoratiu d'un ciclista que va morir en un accident de trànsit en forma d'una bicicleta blanca col·locada permanentment a prop del lloc de l'accident.<br/><br/>En aquest mapa, un pot veure totes les bicicletes fantasma conegudes per OpenStreetMap. Falta una bicicleta fantasma? Tothom pot afegir o actualitzar informació aquí; només cal que tingueu un compte d'OpenStreetMap (gratuït). <p>Hi ha un <a href='https://masto.bike/@ghostbikebot' target='_blank'>compte automatitzat a Mastodon que publica una visió mensual de les bicicletes fantasma a tot el món</a></p>",_context:"themes:ghostbikes.description"},x="./assets/themes/ghostbikes/logo.svg",z=1,S=0,j=0,q=5,D=[{id:"ghost_bike",name:{en:"Ghost bikes",nl:"Witte Fietsen",de:"Geisterräder",it:"Bici fantasma",fr:"Vélos fantômes",eo:"Fantombiciklo",es:"Bicicleta blanca",fi:"Haamupyörä",gl:"Bicicleta pantasma",hu:"Emlékkerékpárok",ja:"ゴーストバイク",nb_NO:"Spøkelsessykler",pl:"Duch roweru",pt_BR:"Bicicleta fantasma",ru:"Велосипед ghost",sv:"Spökcykel",zh_Hant:"幽靈單車",pt:"Bicicleta fantasma",ca:"Bicicleta fantasma"},source:{osmTags:{and:["memorial=ghost_bike"]}},minzoom:0,title:{render:{en:"Ghost bike",nl:"Witte Fiets",de:"Geisterrad",it:"Bici fantasma",fr:"Vélo fantôme",eo:"Fantombiciklo",es:"Bicicleta blanca",fi:"Haamupyörä",gl:"Bicicleta pantasma",hu:"Emlékkerékpár",ja:"ゴーストバイク",nb_NO:"Spøkelsessykler",pl:"Duch roweru",pt_BR:"Bicicleta fantasma",ru:"Велосипед Ghost",sv:"Spökcykel",zh_Hant:"幽靈單車",pt:"Bicicleta fantasma",ca:"Bicicleta blanca"},mappings:[{if:"name~*",then:{en:"Ghost bike in the remembrance of {name}",nl:"Witte fiets ter nagedachtenis van {name}",de:"Geisterrad im Gedenken an {name}",it:"Bici fantasma in ricordo di {name}",fr:"Vélo fantôme en souvenir de {name}"}}]},presets:[{title:{en:"a ghost bike",nl:"een witte fiets",de:"ein Geisterrad",it:"una bici fantasma",fr:"une vélo fantôme",eo:"Fantombiciklo",es:"una bicicleta blanca",fi:"Haamupyörä",gl:"Bicicleta pantasma",hu:"Emlékkerékpár",ja:"ゴーストバイク",nb_NO:"en spøkelsessykler",pl:"Duch roweru",pt:"uma bicicleta fantasma",pt_BR:"uma bicicleta fantasma",ru:"Велосипед ghost",sv:"Spökcykel",zh_Hant:"幽靈單車",ca:"una bicicleta fantasma"},tags:["historic=memorial","memorial=ghost_bike"]}],tagRenderings:[{id:"ghost-bike-explanation",render:{en:"A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident, in the form of a white bicycle placed permanently near the accident location.",nl:"Een <b>Witte Fiets</b> (of Spookfiets) is een aandenken aan een fietser die bij een verkeersongeval om het leven kwam. Het gaat over een witgeschilderde fiets die geplaatst werd in de buurt van het ongeval.",de:"Ein <b>Geisterrad</b> ist ein Denkmal für einen Radfahrer, der bei einem Verkehrsunfall ums Leben kam, in Form eines weißen Fahrrades, das dauerhaft in der Nähe des Unfallortes aufgestellt wird.",it:"Una <b>bici fantasma</b> è il memoriale di un ciclista che è morto in un incidente stradale e che ha la forma di una bicicletta bianca piazzata in maniera stabile vicino al luogo dell’incidente.",fr:"Un <b>vélo fantôme</b> est un monument commémoratif pour un cycliste décédé dans un accident de la route, sous la forme d'un vélo blanc placé en permanence près du lieu de l'accident.",ca:"Una <b>bicicleta fantasma</b> és un memorial per a un ciclista que va morir en un accident de trànsit, en forma de bicicleta blanca col·locada permanentment a prop del lloc de l'accident."}},{description:"This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`",render:"{image_carousel()}{image_upload()}{nearby_images(expandable)}",id:"images",source:"shared-questions"},{question:{en:"Whom is remembered by this ghost bike?",nl:"Aan wie is deze witte fiets een eerbetoon?",de:"An wen erinnert dieses Geisterrad?",it:"A chi è dedicata questa bici fantasma?",fr:"À qui est dédié ce vélo fantôme ?"},render:{en:"In remembrance of {name}",nl:"Ter nagedachtenis van {name}",de:"Im Gedenken an {name}",it:"In ricordo di {name}",fr:"En souvenir de {name}",ru:"В знак памяти о {name}"},freeform:{key:"name"},mappings:[{if:"noname=yes",then:{en:"No name is marked on the bike",nl:"De naam is niet aangeduid op de fiets",de:"Am Fahrrad ist kein Name angegeben",it:"Nessun nome scritto sulla bici",fr:"Aucun nom n'est marqué sur le vélo",ca:"No hi ha cap nom marcat a la bicicleta"}}],id:"ghost_bike-name",questionHint:{en:"Please respect privacy - only fill out the name if it is widely published or marked on the cycle. Opt to leave out the family name.",nl:"Respecteer privacy - voeg enkel een naam toe indien die op de fiets staat of gepubliceerd is. Eventueel voeg je enkel de voornaam toe.",de:"Bitte respektieren Sie die Privatsphäre - geben Sie den Namen nur an, wenn er weit verbreitet oder auf dem Fahrrad markiert ist. Den Familiennamen können Sie weglassen.",it:"Rispetta la privacy (compila solo il nome se questo è stato ampiamente pubblicato o se è scritto sulla bici). Decidi se è il caso di non inserire il cognome.",fr:"Veuillez respecter la vie privée – ajoutez le nom seulement s'il est largement publié ou marqué sur le vélo. Choisissez de ne pas indiquer le nom de famille ",ca:"Si us plau, respecteu la privadesa: només ompliu el nom si està àmpliament publicat o marcat a la bicicleta. Opta per deixar de banda el cognom."}},{question:{en:"On what webpage can one find more info about the ghost bike or the accident?",nl:"Op welke website kan men meer informatie vinden over de Witte fiets of over het ongeval?",de:"Auf welcher Webseite kann man mehr Informationen über das Geisterrad oder den Unfall finden?",it:"In quale pagina web si possono trovare informazioni sulla bici fantasma o l’incidente?",fr:"Sur quelle page web peut-on trouver plus d'informations sur le Vélo fantôme ou l'accident ?",ca:"En quina pàgina web es pot trobar més informació sobre la bicicleta blanca o l'accident?"},render:{en:"<a href='{source}' target='_blank'>More info available</a>",nl:"<a href='{source}' target='_blank'>Meer informatie</a>",de:"<a href='{source}' target='_blank'>Mehr Informationen</a>",it:"<a href='{source}' target='_blank'>Sono disponibili ulteriori informazioni</a>",ru:"<a href='{source}' target='_blank'>Доступна более подробная информация</a>",fr:"<a href='{source}' target='_blank'>Plus d'informations sont disponibles</a>",id:"<a href='{source}' target='_blank'>Informasi lanjut tersedia</a>",ca:"<a href='{source}' target='_blank'>Més informació disponible</a>"},freeform:{type:"url",key:"source"},id:"ghost_bike-source"},{question:{en:"What is the inscription on this Ghost bike?",nl:"Wat is het opschrift op deze witte fiets?",de:"Wie lautet die Inschrift auf diesem Geisterrad?",it:"Che cosa è scritto sulla bici fantasma?",fr:"Quelle est l'inscription sur ce vélo fantôme ?",ca:"Quina és la inscripció d'aquesta bicicleta fantasma?"},render:{en:"<i>{inscription}</i>",nl:"<i>{inscription}</i>",de:"<i>{inscription}</i>",ca:"<i>{inscription}</i>",fr:"<i>{inscription}</i>",it:"<i>{inscription}</i>",ru:"<i>{inscription}</i>",id:"<i>{inscription}</i>"},freeform:{key:"inscription"},id:"ghost_bike-inscription"},{question:{nl:"Wanneer werd deze witte fiets geplaatst?",en:"When was this Ghost bike installed?",it:"Quando è stata installata questa bici fantasma?",fr:"Quand ce vélo fantôme a-t-il été installée ?",de:"Wann wurde dieses Geisterrad aufgestellt?"},render:{nl:"Geplaatst op {start_date}",en:"Placed on {start_date}",it:"Piazzata in data {start_date}",fr:"Placé le {start_date}",ru:"Установлен {start_date}",de:"Aufgestellt am {start_date}"},freeform:{key:"start_date",type:"date"},id:"ghost_bike-start_date"},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],deletion:{softDeletionTags:{and:["razed:memorial:=ghost_bike","memorial="]},neededChangesets:50},allowMove:{enableRelocation:!1,enableImproveAccuraccy:!0},mapRendering:[{icon:{render:"./assets/layers/ghost_bike/ghost_bike.svg",id:"assetslayersghostbikeghostbikesvg"},iconSize:"40,40,bottom",location:["point","centroid"]}],description:{en:"A layer showing memorials for cyclists, killed in road accidents",nl:"Een laag die herdenkingsplaatsen voor verongelukte fietsers toont",de:"Eine Ebene mit Gedenkstätten für Radfahrer, die bei Verkehrsunfällen ums Leben gekommen sind"},titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"selected_element",description:{en:"Highlights the currently selected element. Override this layer to have different colors",nl:"Toont het geselecteerde element",de:"Hebt das aktuell ausgewählte Element hervor. Überschreiben Sie diese Ebene, um unterschiedliche Farben zu erhalten",fr:"Met en surbrillance l'élément actuellement sélectioné. Surcharger cette couche pour avoir d'autres couleurs.",ca:"Ressalta l'element seleccionat actualment. Anul·leu aquesta capa per tenir diferents colors"},source:{osmTags:{and:["selected=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:red",id:"circlered"},iconSize:"1,1,center",location:["point","projected_centerpoint"],css:"box-shadow: red 0 0 20px 20px; z-index: -1; height: 1px; width: 1px;",cssClasses:"block relative rounded-full"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location",description:"Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) (except latitude and longitude) returned by the browser, such as `speed`, `altitude`, `heading`, ....",minzoom:0,source:{osmTags:{and:["id=gps"]},maxCacheAge:0},mapRendering:[{icon:{render:"crosshair:var(--catch-detail-color)",mappings:[{if:"speed>2",then:"gps_arrow"}]},iconSize:"40,40,center",rotation:{render:"0deg",mappings:[{if:{and:["speed>2","heading!=NaN"]},then:"{heading}deg"}]},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_location_history",description:"Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object",minzoom:1,name:null,source:{osmTags:{and:["user:location=yes"]},"#":"Cache is disabled here as these points are kept seperately",maxCacheAge:0},shownByDefault:!1,mapRendering:[{location:["point","centroid"],icon:{render:"square:red",id:"squarered"},iconSize:"5,5,center"}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"home_location",description:"Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.",minzoom:0,source:{osmTags:{and:["user:home=yes"]},maxCacheAge:0},mapRendering:[{icon:{render:"circle:white;./assets/svg/home.svg"},iconSize:{render:"20,20,center"},location:["point","centroid"]}],titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"gps_track",description:"Meta layer showing the previous locations of the user as single line with controls, e.g. to erase, upload or download this track. Add this to your theme and override the maprendering to change the appearance of the travelled track.",minzoom:0,source:{osmTags:{and:["id=location_track"]},maxCacheAge:0},title:{render:"Your travelled path"},shownByDefault:!1,tagRenderings:[{id:"Privacy notice",render:{en:"This is the path you've travelled since this website is opened. Don't worry - this is only visible to you and no one else. Your location data is never sent off-device.",nl:"Dit is waar je was sinds je deze website hebt geopend. Dit is enkel zichtbaar voor jou en niemand anders. Je locatie wordt niet verstuurd buiten je apparaat.",de:"Dies ist der Weg, den Sie seit dem Besuch dieser Webseite zurückgelegt haben. Keine Sorge - diese Daten sind nur für Sie sichtbar und für niemanden sonst. Ihre Standortdaten werden niemals an ein anderes Gerät gesendet.",fr:"C'est le chemin que vous avez parcouru depuis l'ouverture de ce site. Ne vous inquiétez pas - ceci n'est visible que pour vous et personne d'autre. Vos données de localisation ne sont jamais envoyées hors de l'appareil.",ca:"Aquest és el camí que heu recorregut des que s'ha obert aquest lloc web. No et preocupis: això només és visible per a tu i ningú més. Les vostres dades d'ubicació mai s'envien fora del dispositiu."}},{description:"Shows a button to export this feature as GPX. Especially useful for route relations",render:"{export_as_gpx()}",id:"export_as_gpx",source:"shared-questions"},{description:"Shows a button to export this feature as geojson. Especially useful for debugging or using this in other programs",render:"{export_as_geojson()}",id:"export_as_geojson",source:"shared-questions"},{id:"upload_to_osm",render:"{upload_to_osm()}"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"},{id:"delete",render:"{clear_location_history()}"}],name:{en:"Your travelled track",nl:"Jouw afgelegde route",de:"Zurückgelegte Strecke",fr:"Votre chemin parcouru",da:"Dit tilbagelagte spor",ca:"La teva traça recorreguda"},mapRendering:[{width:3,color:"#bb000077"}],syncSelection:"global",titleIcons:[{id:"wikipedialink",labels:["defaults"],render:"<a href='https://wikipedia.org/wiki/{wikipedia}' target='_blank'><img src='./assets/svg/wikipedia.svg' textmode='📖' alt='Wikipedia'/></a>",condition:{or:["wikipedia~*","wikidata~*"]},mappings:[{"#":"ignore-image-in-then",if:"wikipedia=",then:"<a href='https://www.wikidata.org/wiki/{wikidata}' target='_blank'><img src='./assets/svg/wikidata.svg' alt='WD'/></a>"}]},{id:"phonelink",labels:["defaults"],render:"<a href='tel:{phone}'><img textmode='📞' alt='phone' src='./assets/tagRenderings/phone.svg'/></a>",condition:"phone~*"},{id:"emaillink",labels:["defaults"],render:"<a href='mailto:{email}'><img textmode='✉️' alt='email' src='./assets/tagRenderings/send_email.svg'/></a>",condition:"email~*"},{id:"smokingicon",labels:["defaults"],mappings:[{"#":"ignore-image-in-then",if:"smoking=no",then:"<img textmode='🚭️' alt='no-smoking' src='./assets/tagRenderings/no_smoking.svg'/>"},{"#":"ignore-image-in-then",if:"smoking=yes",then:"<img textmode='🚬️' alt='smoking-allowed' src='./assets/tagRenderings/smoking.svg'/>"}]},{id:"sharelink",labels:["defaults"],render:"{share_link()}"},{id:"osmlink",labels:["defaults"],render:"<a href='https://openstreetmap.org/{id}' target='_blank'><img alt='on osm' textmode='🗺️' src='./assets/svg/osm-logo-us.svg'/></a>",mappings:[{if:"id~.*/-.*",then:""},{"#":"ignore-image-in-then",if:"_backend~*",then:"<a href='{_backend}/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'/></a>"}],condition:"id~(node|way|relation)/[0-9]*"}]},{id:"note_import_ghost_bike",description:{ca:"Una capa que importa entrades per a Bicicleta blanca",cs:"Vrstva, která importuje položky pro Ghost bike",da:"Et lag som importerer poster for Ghost bike",de:"Eine Ebene, die Einträge für Geisterrad importiert",en:"A layer which imports entries for Ghost bike",es:"Una capa que importar entradas para Bicicleta blanca",nl:"Deze laag toont kaart-nota's die wijzen op een Witte Fiets",zh_Hant:"能夠為 幽靈單車 匯入項目的圖層",_context:"core:importLayer.description"},source:{osmTags:{and:["id~*"]},geoJson:"https://api.openstreetmap.org/api/0.6/notes.json?limit=10000&closed=0&bbox={x_min},{y_min},{x_max},{y_max}",geoJsonZoomLevel:10,maxCacheAge:0},minzoom:-2,title:{render:{ca:"Pot ser que hi hagi una bicicleta fantasma aquí",cs:"Zde by mohl být a ghost bike",da:"Mulig a ghost bike",de:"Möglicherweise gibt es hier ein Geisterrad",en:"There might be a ghost bike here",es:"Puede haber una bicicleta blanca aquí",nb_NO:"Det kan være en spøkelsessykler her",nl:"Is hier een witte fiets?",zh_Hant:"這裡可能有 幽靈單車",_context:"core:importLayer.popupTitle"}},calculatedTags:["_first_comment=feat.get('comments')[0].text.toLowerCase()",`_trigger_index=(() => {const lines = feat.properties['_first_comment'].split('\\n'); const matchesMapCompleteURL = lines.map(l => l.match(".*https://mapcomplete.osm.be/\\([a-zA-Z_-]+\\)\\(.html\\)?.*#import")); const matchedIndexes = matchesMapCompleteURL.map((doesMatch, i) => [doesMatch !== null, i]).filter(v => v[0]).map(v => v[1]); return matchedIndexes[0] })()`,"_comments_count=feat.get('comments').length","_intro=(() => {const lines = feat.get('comments')[0].text.split('\\n'); lines.splice(feat.get('_trigger_index')-1, lines.length); return lines.filter(l => l !== '').join('<br/>');})()","_tags=(() => {let lines = feat.get('comments')[0].text.split('\\n').map(l => l.trim()); lines.splice(0, feat.get('_trigger_index') + 1); lines = lines.filter(l => l != ''); return lines.join(';');})()"],isShown:{and:["_trigger_index~*",{or:[{and:["_tags~(^|.*;)historic=memorial($|;.*)","_tags~(^|.*;)memorial=ghost_bike($|;.*)"]}]}]},titleIcons:[{render:"<a href='https://openstreetmap.org/note/{id}' target='_blank'><img src='./assets/svg/osm-logo-us.svg'></a>"}],tagRenderings:[{id:"Intro",render:"{_intro}"},{id:"conversation",render:"{visualize_note_comments(comments,1)}",condition:"_comments_count>1"},{id:"import",render:{ca:"{import_button(ghost_bike, _tags, he trobat un una bicicleta fantasma aquí; afegeix-lo al mapa,./assets/svg/addSmall.svg,,,id)}",cs:"{import_button(ghost_bike, _tags, Našel jsem a ghost bike zde - přidejte ji do mapy,./assets/svg/addSmall.svg,,,id)}",da:"{import_button(ghost_bike, _tags, Jeg har fundet en a ghost bike her - tilføj den til kortet,./assets/svg/addSmall.svg,,,id)}",de:"{import_button(ghost_bike, _tags, Ich habe hier ein(en) ein Geisterrad gefunden - Zur Karte hinzufügen,./assets/svg/addSmall.svg,,,id)}",en:"{import_button(ghost_bike, _tags, I have found a a ghost bike here - add it to the map,./assets/svg/addSmall.svg,,,id)}",es:"{import_button(ghost_bike,_tags, He encontrado un(a) una bicicleta blanca aquí - añádelo al mapa,./assets/svg/addSmall.svg,,,id)}",nl:"{import_button(ghost_bike, _tags, Ik heb hier een een witte fiets gevonden - voeg deze toe aan de kaart...,./assets/svg/addSmall.svg,,,id)}",zh_Hant:"{import_button(ghost_bike, _tags, 我在這邊發現 幽靈單車 - 新增到地圖,./assets/svg/addSmall.svg,,,id)}",_context:"core:importLayer.importButton"},condition:"closed_at="},{id:"close_note_",render:{ca:"{close_note(No he pogut trobar una bicicleta fantasma: esborra-ho, ./assets/svg/close.svg, id, This feature does not exist, 18)}",cs:"{close_note(Nepodařilo se mi najít a ghost bike - odstraňte jej, ./assets/svg/close.svg, id, This feature does not exist, 18)}",da:"{close_note(Jeg kunne ikke finde a ghost bike - fjern det, ./assets/svg/close.svg, id, This feature does not exist, 18)}",de:"{close_note(Ich konnte ein Geisterrad nicht finden - entferne es, ./assets/svg/close.svg, id, This feature does not exist, 18)}",en:"{close_note(I could not find a ghost bike - remove it, ./assets/svg/close.svg, id, This feature does not exist, 18)}",es:"{close_note(No he podido encontrar una bicicleta blanca - eliminarlo, ./assets/svg/close.svg, id, This feature does not exist, 18)}",nl:"{close_note(Ik kon hier geen een witte fiets vinden - verwijder deze van de kaart, ./assets/svg/close.svg, id, This feature does not exist, 18)}",zh_Hant:"{close_note(我無法找到 幽靈單車 - 移除吧, ./assets/svg/close.svg, id, This feature does not exist, 18)}",_context:"core:importLayer.notFound"},condition:"closed_at="},{id:"close_note_mapped",render:{ca:"{close_note(Ja hi ha un una bicicleta fantasma al mapa - aquest punt és un duplicat, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",cs:"{close_note(Na mapě se již nachází a ghost bike - tento bod je duplicitní, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",da:"{close_note(Der er allerede en anden a ghost bike på kortet - dette punkt er en dublet, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",de:"{close_note(Es gibt bereits einen ein Geisterrad auf der Karte - dieser Punkt ist ein Duplikat, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",en:"{close_note(There already is a ghost bike on the map - this point is a duplicate, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",es:"{close_note(una bicicleta blanca ya está en el mapa - este punto es un duplicado, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",nl:"{close_note(Er staat hier reeds een witte fiets op de kaart; dit punt is een duplicaat. Verwijder deze van de kaart, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",zh_Hant:"{close_note(幽靈單車 已經在地圖上了 - 這個點重覆了, ./assets/svg/duplicate.svg, id, Already mapped, 18)}",_context:"core:importLayer.alreadyMapped"},condition:"closed_at="},{id:"handled",render:{ca:`<div class="thanks">Aquesta funció s'ha gestionat. Gràcies pel teu esforç.</div>`,cs:"<div class='thanks'>Tato funkce byla zpracována! Děkujeme za vaši snahu</div>",da:'<div class="thanks">Dette element er blevet håndteret! Tak for din indsats</div>',de:'<div class="thanks">Dieses Objekt wurde verarbeitet! Vielen Dank für Ihre Bemühungen</div>',en:"<div class='thanks'>This feature has been handled! Thanks for your effort</div>",nb_NO:"<div class='thanks'>Denne funksjonen har blitt håndtert. Takk for din innsats.</div>",nl:"<div class='thanks'>Dit object is afgehandeld. Bedankt om mee te helpen!</div>",zh_Hant:"<div class='thanks'>這個圖徵已經處理了！謝謝你的辛勞</div>",_context:"core:importLayer.importHandled"},condition:"closed_at~*"},{id:"comment",render:"{add_note_comment()}"},{id:"add_image",render:"{add_image_to_note()}"},{id:"nearby_images",render:{ca:"<h3>Imatges properes</h3>Les imatges següents són imatges geoetiquetades properes de diversos serveis en línia. Us poden ajudar a resoldre aquesta nota.{nearby_images(open)}",cs:"<h3>Obrázky z okolí</h3>Následující obrázky jsou geograficky označené obrázky z různých online služeb. Mohly by vám pomoci při řešení této poznámky.{nearby_images(open)}",da:"<h3>Billeder i nærheden</h3>De følgende billeder er geotaggede billeder i nærheden fra forskellige onlinetjenester. De kan måske hjælpe dig med at løse denne note.{nearby_images(open)}",de:"<h3>Bilder in der Nähe</h3>Die folgenden Bilder sind mit Geotags versehene Bilder aus verschiedenen Online-Diensten in der Nähe. Sie können helfen, diesen Hinweis zu lösen.{nearby_images(open)}",en:"<h3>Nearby pictures</h3>The following pictures are nearby geotagged pictures from various online services. They might help you to resolve this note.{nearby_images(open)}",es:"<h3>Imágenes cercanas</h3> Las siguientes imágenes son imágenes geoetiquetadas cerca de varios servicios en línea. Pueden ayudarte a resolver esta nota. {nearby_images(open)}",nl:"<h3>Afbeeldingen in de buurt</h3>De volgende afbeeldingen zijn in de buurt gemaakt en kunnen mogelijks helpen. {nearby_images(open)}",zh_Hant:"<h3>附近圖片</h3>接下來的圖片是多個第三方線上服務附近有地理標籤的圖片，也許能協助你解決這個註解。{nearby_images(open)}",_context:"core:importLayer.nearbyImagesIntro"}},{description:"Show the images block at this location",id:"questions",source:"shared-questions"},{description:"Shows a small map with the feature. Added by default to every popup",render:"{minimap(18, id): width:100%; height:8rem; border-radius:2rem; overflow: hidden; pointer-events: none;}",id:"minimap",source:"shared-questions"}],mapRendering:[{location:["point"],icon:{render:"circle:white;help:black",mappings:[{if:{or:["closed_at~*","_imported=yes"]},then:"circle:white;checkmark:black"}]},iconSize:"40,40,center"}]}],I="CartoDB.Positron",M={maxZoom:0},R="assets/SocialImage.png",r={id:_,title:w,description:y,icon:x,startZoom:z,startLat:S,startLon:j,widenFactor:q,layers:D,defaultBackgroundId:I,clustering:M,socialImage:R};document.getElementById("decoration-desktop").remove();new c(["Initializing... <br/>",new m("<a>If this message persist, something went wrong - click here to try again</a>").SetClass("link-underline small").onClick(()=>{localStorage.clear(),window.location.reload(!0)})]).AttachTo("centermessage");b.initialize();k.implement(new f);p.Implement();g.DisableLongPresses();new URLSearchParams(window.location.search).get("test")==="true"&&console.log(r);const i=new v(r);if((i==null?void 0:i.id)==="cyclofix"){const t=e.GetQueryParameter("layer-bike_shops","true","Legacy - keep De Fietsambassade working"),s=e.GetQueryParameter("layer-bike_shop","true","Legacy - keep De Fietsambassade working");t.data!=="true"&&s.setData(t.data),console.log("layer-bike_shop toggles: legacy:",t.data,"new:",s.data);const l=e.GetQueryParameter("layer-bike_cafes","true","Legacy - keep De Fietsambassade working"),d=e.GetQueryParameter("layer-bike_cafe","true","Legacy - keep De Fietsambassade working");l.data!=="true"&&d.setData(t.data)}const n=new o;a.state=new a(i);o.state=n;window.mapcomplete_state=a.state;const G=e.GetQueryParameter("mode","map","The mode the application starts in, e.g. 'map' or 'dashboard'");G.data==="dashboard"?new h(a.state,n).setup():new u(a.state,n).setup();
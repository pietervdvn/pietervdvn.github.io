parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"nHn2":[function(require,module,exports) {
module.exports={id:"climbing",title:{nl:"Open Klimkaart",de:"Offene Kletterkarte",en:"Open Climbing Map",ru:"Открытая карта скалолазания",ja:"登山地図を開く",zh_Hant:"開放攀爬地圖",nb_NO:"Åpent klatrekart"},description:{nl:"Op deze kaart vind je verschillende klimgelegenheden, zoals klimzalen, bolderzalen en klimmen in de natuur",de:"Auf dieser Karte finden Sie verschiedene Klettermöglichkeiten wie Kletterhallen, Boulderhallen und Felsen in der Natur.",en:"On this map you will find various climbing opportunities such as climbing gyms, bouldering halls and rocks in nature.",ru:"На этой карте вы найдете различные возможности для скалолазания, такие как скалодромы, залы для боулдеринга и скалы на природе.",ja:"この地図には、自然の中のクライミングジム、ボルダリングホール、岩など、さまざまなクライミングの機会があります。",zh_Hant:"在這份地圖上你會發現能夠攀爬機會，像是攀岩體育館、抱石大廳以及大自然當中的巨石。"},descriptionTail:{nl:"De Open Klimkaart is oorspronkelijk gemaakt door <a href='https://utopicode.de/en/?ref=kletterspots' target='_blank'>Christian Neumann</a> op <a href='https://kletterspots.de' target='_blank'>kletterspots.de</a>.",en:"The climbing map was originally made by <a href='https://utopicode.de/en/?ref=kletterspots' target='_blank'>Christian Neumann</a>. Please <a href='https://utopicode.de/en/contact/?project=kletterspots&ref=kletterspots' target='blank'>get in touch</a> if you have feedback or questions.</p><p>The project uses data of the <a href='https://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> project.</p>",de:"<p><strong>kletterspots.de</strong> wird betrieben von <a href='https://utopicode.de/?ref=kletterspots' target='_blank'>Christian Neumann</a>. Bitte <a href='https://utopicode.de/kontakt/?project=kletterspots&ref=kletterspots' target='blank'>melden Sie sich</a>, wenn Sie Feedback oder Fragen haben.</p><p>Das Projekt nutzt Daten des <a href='https://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> Projekts und basiert auf der freien Software <a href='https://github.com/pietervdvn/MapComplete' target='_blank'>MapComplete</a>.</p>",ru:"Создатель карты скалолазания — <a href='https://utopicode.de/en/?ref=kletterspots' target='_blank'>Christian Neumann</a>. Пожалуйста, <a href='https://utopicode.de/en/contact/?project=kletterspots&ref=kletterspots' target='blank'>пишите</a> если у вас есть отзыв или вопросы.</p><p>Проект использует данные <a href='https://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a>.</p>",ja:"登山地図はもともと <a href='https://utopicode.de/en/?ref=kletterspots' target='_blank'>Christian Neumann</a> によって作成されたものです。フィードバックや質問がありましたら、<a href='https://utopicode.de/en/contact/?project=kletterspots&ref=kletterspots' target='blank'>ご連絡</a>ください。</p><p>このプロジェクトでは、<a href='https://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a>プロジェクトのデータを使用します。</p>",zh_Hant:"攀爬地圖最初由 <a href='https://utopicode.de/en/?ref=kletterspots' target='_blank'>Christian Neumann</a> 製作。如果你有回饋意見或問題請到Please <a href='https://utopicode.de/en/contact/?project=kletterspots&ref=kletterspots' target='blank'>這邊反應</a>。</p><p>這專案使用來自<a href='https://www.openstreetmap.org/' target='_blank'>開放街圖</a>專案的資料。</p>"},language:["nl","de","en","ru","ja","zh_Hant","nb_NO","ca","fr","id"],maintainer:"Christian Neumann <christian@utopicode.de>",icon:"./assets/themes/climbing/climbing_icon.svg",version:"0",startLat:0,startLon:0,startZoom:1,widenFactor:.05,socialImage:"",layers:[{id:"climbing_club",name:{de:"Kletterverein",nl:"Klimclub",en:"Climbing club",ru:"Клуб скалолазания",ja:"クライミングクラブ",zh_Hant:"攀岩社團",nb_NO:"Klatreklubb"},minzoom:10,source:{osmTags:{or:["club=climbing",{and:["sport=climbing",{or:["office~*","club~*"]}]}]}},title:{render:{en:"Climbing club",nl:"Klimclub",de:"Kletterverein",ru:"Клуб скалолазания",ja:"クライミングクラブ",zh_Hant:"攀岩社團",nb_NO:"Klatreklubb"},mappings:[{if:"office~*",then:{nl:"Klimorganisatie",en:"Climbing NGO",de:"Kletter-Organisation",ja:"クライミングNGO",zh_Hant:"攀岩 NGO"}}]},description:{de:"Ein Kletterverein oder eine Organisation",nl:"Een klimclub of organisatie",en:"A climbing club or organisations",ja:"クライミングクラブや団体",zh_Hant:"攀岩社團或組織",nb_NO:"En klatreklubb eller organisasjoner"},tagRenderings:[{render:{en:"<strong>{name}</strong>",nl:"<strong>{name}</strong>",de:"<strong>{name}</strong>",ca:"<strong>{name}</strong>",fr:"<strong>{name}</strong>",id:"<strong>{name}</strong>",ru:"<strong>{name}</strong>",ja:"<strong>{name}</strong>",zh_Hant:"<strong>{name}</strong>"},question:{en:"What is the name of this climbing club or NGO?",de:"Wie lautet der Name dieses Vereins oder Organisation?",nl:"Wat is de naam van deze klimclub?",ja:"この登山クラブやNGOの名前は何ですか?"},freeform:{key:"name"}},"website","email","phone","opening_hours"],hideUnderlayingFeaturesMinPercentage:0,icon:{render:"./assets/themes/climbing/club.svg"},iconOverlays:[{if:"opening_hours~*",then:"isOpen",badge:!0}],width:{render:"8"},iconSize:{render:"40,40,center"},color:{render:"#00f"},presets:[{tags:["club=sport","sport=climbing"],title:{de:"Kletterverein",en:"Climbing club",nl:"Klimclub",ja:"クライミングクラブ",nb_NO:"Klatreklubb"},description:{de:"Ein Kletterverein",nl:"Een klimclub",en:"A climbing club",ja:"クライミングクラブ",nb_NO:"En klatreklubb"}},{tags:["office=ngo","sport=climbing"],title:{de:"Eine Kletter-Organisation",en:"Climbing NGO",nl:"Een klimorganisatie",ja:"クライミングNGO"},description:{de:"Eine Organisation, welche sich mit dem Klettern beschäftigt",nl:"Een VZW die werkt rond klimmen",en:"A NGO working around climbing",ja:"登山に関わるNGO"}}],wayHandling:1},{id:"climbing_gym",name:{de:"Kletterhallen",en:"Climbing gyms",nl:"Klimzalen",ja:"クライミングジム"},minzoom:10,source:{osmTags:{and:["sport=climbing","leisure=sports_centre"]}},title:{render:{nl:"Klimzaal",de:"Kletterhalle",en:"Climbing gym",ja:"クライミングジム"},mappings:[{if:"name~*",then:{nl:"Klimzaal <strong>{name}</strong>",de:"Kletterhalle <strong>{name}</strong>",en:"Climbing gym <strong>{name}</strong>",ja:"クライミングジム<strong>{name}</strong>"}}]},description:{de:"Eine Kletterhalle",en:"A climbing gym",ja:"クライミングジム"},tagRenderings:["images","questions",{"#":"name",render:{en:"<strong>{name}</strong>",nl:"<strong>{name}</strong>",de:"<strong>{name}</strong>",ca:"<strong>{name}</strong>",fr:"<strong>{name}</strong>",id:"<strong>{name}</strong>",ru:"<strong>{name}</strong>",ja:"<strong>{name}</strong>"},question:{en:"What is the name of this climbing gym?",nl:"Wat is de naam van dit Klimzaal?",de:"Wie heißt diese Kletterhalle?",ja:"このクライミングジムは何という名前ですか?"},freeform:{key:"name"}},"website","phone","email","opening_hours","reviews"],hideUnderlayingFeaturesMinPercentage:0,icon:{render:"./assets/themes/climbing/climbing_gym.svg"},iconOverlays:[{if:"opening_hours~*",then:"isOpen",badge:!0}],width:"0",iconSize:{render:"40,40,center"},wayHandling:1},{id:"climbing_route",name:{en:"Climbing routes",de:"Kletterrouten",nl:"Klimroute",ja:"登坂ルート",nb_NO:"Klatreruter"},minzoom:18,source:{osmTags:{and:["climbing=route"]}},title:{render:{de:"Kleterroute",en:"Climbing route",nl:"Klimroute",ja:"登坂ルート",nb_NO:"Klatrerute"},mappings:[{if:"name~*",then:{de:"Kleterroute <strong>{name}</strong>",en:"Climbing route <strong>{name}</strong>",nl:"Klimroute <strong>{name}</strong>",ja:"登坂ルート<strong>{name}</strong>"}}]},tagRenderings:["images","questions",{"#":"Name",render:{en:"<strong>{name}</strong>",nl:"<strong>{name}</strong>",de:"<strong>{name}</strong>",ca:"<strong>{name}</strong>",fr:"<strong>{name}</strong>",id:"<strong>{name}</strong>",ru:"<strong>{name}</strong>",ja:"<strong>{name}</strong>"},question:{en:"What is the name of this climbing route?",de:"Wie heißt diese Kletterroute?",nl:"Hoe heet deze klimroute?",ja:"この登坂ルートの名前は何ですか?"},freeform:{key:"name"},mappings:[{if:{and:["noname=yes","name="]},then:{en:"This climbing route doesn't have a name",de:"Diese Kletterroute hat keinen Namen",nl:"Deze klimroute heeft geen naam",ja:"この登坂ルートには名前がありません"}}]},{"#":"Length",render:{de:"Diese Route ist {climbing:length} Meter lang",en:"This route is {climbing:length} meter long",nl:"Deze klimroute is {climbing:length} meter lang",ja:"このルート長は、 {climbing:length} メーターです",nb_NO:"Denne ruten er {climbing:length} meter lang"},freeform:{key:"climbing:length",type:"pnat"}},{"#":"Difficulty",render:{de:"Die Schwierigkeit ist {climbing:grade:french} entsprechend des französisch/belgischen Systems",en:"The difficulty is {climbing:grade:french} according to the french/belgian system",nl:"De klimmoeilijkheid is {climbing:grade:french} volgens het Franse/Belgische systeem",ja:"フランス/ベルギーのランク評価システムによると、{climbing:grade:french}の困難度です"},freeform:{key:"climbing:grade:french"}},"reviews"],hideUnderlayingFeaturesMinPercentage:0,icon:{render:"./assets/themes/climbing/climbing_route.svg"},width:{render:"4"},iconSize:{render:"20,20,center"},color:{render:"#0f0"}},{id:"climbing",name:{nl:"Klimgelegenheden",de:"Klettermöglichkeiten",en:"Climbing opportunities",ja:"登坂教室"},minzoom:10,source:{osmTags:{and:["sport=climbing","climbing!~route","leisure!~sports_centre","climbing!=route_top","climbing!=route_bottom"]}},title:{render:{en:"Climbing opportunity",nl:"Klimgelegenheid",de:"Klettermöglichkeit",ja:"登坂教室",nb_NO:"Klatremulighet"}},description:{nl:"Een klimgelegenheid",de:"Eine Klettergelegenheit",en:"A climbing opportunity",ja:"登坂教室",nb_NO:"En klatremulighet"},tagRenderings:["images","questions",{"#":"name",render:{en:"<strong>{name}</strong>",nl:"<strong>{name}</strong>",de:"<strong>{name}</strong>",ca:"<strong>{name}</strong>",fr:"<strong>{name}</strong>",id:"<strong>{name}</strong>",ru:"<strong>{name}</strong>",ja:"<strong>{name}</strong>"},question:{en:"What is the name of this climbing opportunity?",nl:"Wat is de naam van dit Klimgelegenheid?",de:"Wie heißt diese Klettergelegenheit?",ja:"この登坂教室の名前は何ですか?"},freeform:{key:"name"},mappings:[{if:{and:["noname=yes","name="]},then:{en:"This climbing opportunity doesn't have a name",nl:"Dit Klimgelegenheid heeft geen naam",de:"Diese Klettergelegenheit hat keinen Namen",ja:"この登坂教室には名前がついていない"}}]},"reviews"],hideUnderlayingFeaturesMinPercentage:0,icon:{render:"./assets/themes/climbing/climbing_no_rope.svg"},width:{render:"8"},iconSize:{render:"40,40,center"},color:{render:"#d38d5fAA"},presets:[{tags:["sport=climbing"],title:{en:"Climbing opportunity",nl:"Klimgelegenheid",de:"Klettermöglichkeit",ja:"登坂教室",nb_NO:"Klatremulighet"},description:{nl:"Een klimgelegenheid",de:"Eine Klettergelegenheit",en:"A climbing opportunity",ja:"登坂教室",nb_NO:"En klatremulighet"}}],wayHandling:2},{id:"maybe_climbing",name:{nl:"Klimgelegenheiden?",de:"Klettermöglichkeiten?",en:"Climbing opportunities?",ja:"登坂教室？",nb_NO:"Klatremuligheter?"},minzoom:19,source:{osmTags:{or:["leisure=sports_centre","barrier=wall","barrier=retaining_wall","natural=cliff","natural=rock","natural=stone"]}},title:{render:{en:"Climbing opportunity?",nl:"Klimgelegenheid?",de:"Klettermöglichkeit?",ja:"登坂教室？",nb_NO:"Klatremulighet?"}},description:{nl:"Een klimgelegenheid?",de:"Eine Klettergelegenheit?",en:"A climbing opportunity?",ja:"登坂教室？",nb_NO:"En klatremulighet?"},tagRenderings:[{render:{en:"<strong>{name}</strong>",de:"<strong>{name}</strong>",ca:"<strong>{name}</strong>",fr:"<strong>{name}</strong>",id:"<strong>{name}</strong>",ru:"<strong>{name}</strong>",ja:"<strong>{name}</strong>"},condition:"name~*"},{question:{en:"Is climbing possible here?",de:"Kann hier geklettert werden?",ja:"ここで登坂はできますか?",nb_NO:"Er klatring mulig her?"},mappings:[{if:{and:["sport!~climbing"]},then:{en:"Climbing is not possible here",de:"Hier kann nicht geklettert werden",ja:"ここでは登ることができない",nb_NO:"Klatring er ikke mulig her"},hideInAnswer:!0},{if:{and:["sport=climbing"]},then:{en:"Climbing is possible here",de:"Hier kann geklettert werden",ja:"ここでは登ることができる",nb_NO:"Klatring er mulig her"}}]}],icon:"./assets/themes/climbing/climbing_unknown.svg",hideUnderlayingFeaturesMinPercentage:0,width:{render:"2"},color:{render:"#ddff55AA"},wayHandling:0}],roamingRenderings:[{"#":"Website",question:{en:"Is there a (unofficial) website with more informations (e.g. topos)?",de:"Gibt es eine (inoffizielle) Website mit mehr Informationen (z.B. Topos)?",ja:"もっと情報のある(非公式の)ウェブサイトはありますか(例えば、topos)?"},condition:{and:["leisure!~sports_centre","sport=climbing","office=","club="]},render:"<a href='{url}' target='_blank'>{url}</a>",freeform:{key:"url",type:"url"}},{"#":"Avg length?",render:{de:"Die Routen sind durchschnittlich <b>{climbing:length}m</b> lang",en:"The routes are <b>{climbing:length}m</b> long on average",nl:"De klimroutes zijn gemiddeld <b>{climbing:length}m</b> lang",ja:"ルートの長さは平均で<b>{climbing:length} m</b>です"},condition:{and:["climbing!~route","office=","club=",{or:["climbing=sport","climbing=traditional"]}]},question:{de:"Wie lang sind die Routen (durchschnittlich) in Metern?",en:"What is the (average) length of the routes in meters?",nl:"Wat is de (gemiddelde) lengte van de klimroutes, in meter?",ja:"ルートの(平均)長さはメートル単位でいくつですか?"},freeform:{key:"climbing:length",type:"pnat"}},{"#":"Difficulty-min",question:{de:"Welche Schwierigkeit hat hier die leichteste Route (französisch/belgisches System)?",en:"What is the level of the easiest route here, accoring to the french classification system?",nl:"Wat is het niveau van de makkelijkste route, volgens het Franse classificatiesysteem?",ja:"ここで一番簡単なルートのレベルは、フランスのランク評価システムで何ですか?"},render:{de:"Die leichteste Route hat hier die Schwierigkeit {climbing:grade:french} (französisch/belgisches System)",en:"The minimal difficulty is {climbing:grade:french} according to the french/belgian system",nl:"De minimale klimmoeilijkheid is {climbing:grade:french} volgens het Franse/Belgische systeem",ja:"フランス/ベルギーのランク評価システムでは、最小の難易度は{climbing:grade:french}です"},freeform:{key:"climbing:grade:french:min"},condition:{and:["climbing!~route","office=","club="]}},{"#":"Difficulty-max",question:{de:"Welche Schwierigkeit hat hier die schwerste Route (französisch/belgisches System)?",en:"What is the level of the most difficult route here, accoring to the french classification system?",nl:"Wat is het niveau van de moeilijkste route, volgens het Franse classificatiesysteem?",ja:"フランスのランク評価によると、ここで一番難しいルートのレベルはどれくらいですか?"},render:{de:"Die schwerste Route hat hier die Schwierigkeit {climbing:grade:french} (französisch/belgisches System)",en:"The maximal difficulty is {climbing:grade:french} according to the french/belgian system",nl:"De maximale klimmoeilijkheid is {climbing:grade:french} volgens het Franse/Belgische systeem",ja:"フランス/ベルギーのランク評価システムでは、最大の難易度は{climbing:grade:french}です"},freeform:{key:"climbing:grade:french:max"},condition:{and:["climbing!~route","office=","club="]}},{"#":"Boldering?",question:{de:"Kann hier gebouldert werden?",en:"Is bouldering possible here?",nl:"Is het mogelijk om hier te bolderen?",ja:"ここでボルダリングはできますか?",nb_NO:"Er buldring mulig her?"},mappings:[{if:"climbing:boulder=yes",then:{de:"Hier kann gebouldert werden",en:"Bouldering is possible here",nl:"Bolderen kan hier",ja:"ボルダリングはここで可能です",nb_NO:"Buldring er mulig her"}},{if:"climbing:boulder=no",then:{de:"Hier kann nicht gebouldert werden",en:"Bouldering is not possible here",nl:"Bolderen kan hier niet",ja:"ここではボルダリングはできません",nb_NO:"Buldring er ikke mulig her"}},{if:"climbing:boulder=limited",then:{de:"Bouldern ist hier nur an wenigen Routen möglich",en:"Bouldering is possible, allthough there are only a few routes",nl:"Bolderen kan hier, maar er zijn niet zoveel routes",ja:"ボルダリングは可能ですが、少しのルートしかありません"}},{if:"climbing:boulder~*",then:{de:"Hier gibt es {climbing:boulder} Boulder-Routen",en:"There are {climbing:boulder} boulder routes",nl:"Er zijn hier {climbing:boulder} bolderroutes",ja:"{climbing:boulder} ボルダールートがある"},hideInAnswer:!0}],condition:{and:["sport=climbing","office=","club="]}},{"#":"Toproping?",question:{de:"Ist Toprope-Klettern hier möglich?",en:"Is toprope climbing possible here?",nl:"Is het mogelijk om hier te toprope-klimmen?",ja:"ここでtoprope登坂はできますか?"},mappings:[{if:"climbing:toprope=yes",then:{de:"Toprope-Klettern ist hier möglich",en:"Toprope climbing is possible here",nl:"Toprope-klimmen kan hier",ja:"ここでToprope登坂ができます"}},{if:"climbing:toprope=no",then:{de:"Toprope-Climbing ist hier nicht möglich",en:"Toprope climbing is not possible here",nl:"Toprope-klimmen kan hier niet",ja:"ここではToprope登坂はできません"}},{if:"climbing:toprope~*",then:{de:"Hier gibt es {climbing:toprope} Toprope-Routen",en:"There are {climbing:toprope} toprope routes",nl:"Er zijn hier {climbing:toprope} toprope routes",ja:"{climbing:toprope} 登坂ルートがある"},hideInAnswer:!0}],condition:{and:["sport=climbing","office=","club="]}},{"#":"Sportclimbing?",question:{de:"Ist hier Sportklettern möglich (feste Ankerpunkte)?",en:"Is sport climbing possible here on fixed anchors?",nl:"Is het mogelijk om hier te sportklimmen/voorklimmen op reeds aangebrachte haken?",ja:"ここでは固定アンカー式のスポーツクライミングはできますか?"},mappings:[{if:"climbing:sport=yes",then:{de:"Sportklettern ist hier möglich",en:"Sport climbing is possible here",nl:"Sportklimmen/voorklimmen kan hier",ru:"Здесь можно заняться спортивным скалолазанием",ja:"ここでスポーツクライミングができます"}},{if:"climbing:sport=no",then:{de:"Sportklettern ist hier nicht möglich",en:"Sport climbing is not possible here",nl:"Sportklimmen/voorklimmen kan hier niet",ru:"Спортивное скалолазание здесь невозможно",ja:"ここではスポーツクライミングはできません"}},{if:"climbing:sport~*",then:{de:"Hier gibt es {climbing:sport} Sportkletter-Routen",en:"There are {climbing:sport} sport climbing routes",nl:"Er zijn hier {climbing:sport} sportklimroutes/voorklimroutes",ja:"スポーツクライミングの {climbing:sport} ルートがある"},hideInAnswer:!0}],condition:{and:["sport=climbing","office=","club="]}},{"#":"Traditional climbing?",question:{de:"Ist hier traditionelles Klettern möglich (eigene Sicherung z.B. mit Klemmkleilen)?",en:"Is traditional climbing possible here (using own gear e.g. chocks)?",nl:"Is het mogelijk om hier traditioneel te klimmen? <br/><span class='subtle'>(Dit is klimmen met klemblokjes en friends)</span>",ja:"伝統的な登山はここで可能ですか(例えば、チョックのような独自のギアを使用して)？"},mappings:[{if:"climbing:traditional=yes",then:{de:"Traditionelles Klettern ist hier möglich",en:"Traditional climbing is possible here",nl:"Traditioneel klimmen kan hier",ja:"ここでは伝統的な登山が可能です"}},{if:"climbing:traditional=no",then:{de:"Traditionelles Klettern ist hier nicht möglich",en:"Traditional climbing is not possible here",nl:"Traditioneel klimmen kan hier niet",ja:"伝統的な登山はここではできない"}},{if:"climbing:traditional~*",then:{de:"Hier gibt es {climbing:traditional} Routen für traditionelles Klettern",en:"There are {climbing:traditional} traditional climbing routes",nl:"Er zijn hier {climbing:traditional} traditionele klimroutes",ja:"{climbing:traditional} の伝統的な登山ルートがある"},hideInAnswer:!0}],condition:{and:["sport=climbing","office=","club="]}},{"#":"Speed climbing?",question:{de:"Gibt es hier eine Speedkletter-Wand?",en:"Is there a speed climbing wall?",nl:"Is er een snelklimmuur (speed climbing)?",ja:"スピードクライミングウォールはありますか?"},condition:{and:["leisure=sports_centre","climbing:sport=yes","office=","club="]},mappings:[{if:"climbing:speed=yes",then:{de:"Hier gibt es eine Speedkletter-Wand",en:"There is a speed climbing wall",nl:"Er is een snelklimmuur voor speed climbing",ja:"スピードクライミングウォールがある"}},{if:"climbing:speed=no",then:{de:"Hier gibt es keine Speedkletter-Wand",en:"There is no speed climbing wall",nl:"Er is geen snelklimmuur voor speed climbing",ja:"スピードクライミングウォールがない"}},{if:"climbing:speed~*",then:{de:"Hier gibt es {climbing:speed} Speedkletter-Routen",en:"There are {climbing:speed} speed climbing walls",nl:"Er zijn hier {climbing:speed} snelklimmuren",ja:"{climbing:speed} のスピードクライミングウォールがある"},hideInAnswer:!0}]}]};
},{}]},{},["nHn2"], null)
//# sourceMappingURL=assets/themes/climbing/climbing.js.map
# 2020 12 15 Webinar Fietsersbond over OpenStreetMap: vragen en antwoorden

Tijdens de webinar werden een aantal vragen gesteld, in dit documentje vind je de antwoorden erop.

## Vraag

* Is Bikemap OSM?

> [name=Joost] yep, check de rechteronderhoek van de kaart hier https://www.bikemap.net/en/r/5611311/#12.06/50.88523/4.38306

* Is er een manier om de cyclofix sneller te laten laden? De achtergrondkaart is idd snel, maar de POI's laden pas na 5 a 10s

> [name=Joost] dit draait op een server die speciaal hiervoor gemaakt is; maar enkele seconden wachten is wel normaal


* Bestaat er een overzicht van de verschillende beschikbare data-elementen in de databank van OpenStreetmap? Eventueel per thema
> [name=Joost] een onvolledig overzicht: https://wiki.openstreetmap.org/wiki/Map_features. Er is zoveel verschillende data, dat de truk is om een kaart te vinden die bij jou past! Om een idee te krijgen, browse eens op www.OpenWhateverMap.xyz


* Is de OSM kaart echt van nul gestart, of heeft men bestaande kaarten gebruikt.
> [name=Joost] yep, op veel plaatsen wel! Maar op sommige plaatsen is men wel begonnen met externe data


* Hoe/waar is de OSM community te bereiken?
> via community@osm.be of https://openstreetmap.be/nl/contact.html

* De cyclemap (fietsmap selecteren op osm.org) geeft de knooppunten en routes weer, maar zijn Bovenlokale netwerken ook mogelijk om zichtbaar te toveren voor Woon-werkverkeer op Brouter/OSM/...?
> BFF is grotendeels nog NIET gemapped in OSM, voor een deel omdat dit grotendeels niet op terrein te zien is. Maar dat kan veranderen natuurlijk


* Wat pieter nu doet: tracken over luchtfoto, mocht ik niet in 2008. Is er nu wel een luchtfoto die vrij beschikbaar is voor gebruik op OSM?
> absoluut! We hebben al heel lang luchtfoto's, en in Vlaanderen hebben we echt een luxesituatie met jaarlijks bijgewerkte luchtfoto's van de Vlaamse Overheid die we mogen gebruiken. Er is ook een oudere met 10cm resolutie.

* Hoe betrouwbaar zijn satellietfoto's? Als je bvb. een lantaarnpaal aanduidt, is dit dan de exactie positie of is er een bepaalde foutmarge?
> De luchtfoto's van Agentschap Informatie Vlaanderen zijn heel nauwkeurig gepositioneerd. Wel opletten met objecten die een zekere hoogte hebben, omdat de luchtfoto's altijd vanuit een bepaalde hoek genomen worden.
> Thomas: die zijn heel betrouwbaar. In dit geval was de lantaarnpaal aangeduidt op basis van de schaduw die te zien was op de luchtbeelden.


* Kan je met instelling van geolocatie op je smartphone binnen OSM al wandelend een Trage Weg in kaart brengen? Als burger? Als landmeter?
> al wandelend is misschien niet zo eenvoudig. Wat je wel kan doen is je wandeling opnemen via een app en als GPX opslaan. En dan thuis kun je de trage wegen eenvoudiger toevoegen.
> Op basis van een GPX, de achtegrondlagen, je eigen herinnering en notities, en eventueel eigen straatbeeldfotografie kan je heel gedetailleerd werken. Maar het hoeft ook niet per se tot de centimeter juist te liggen

* is er éénduidige mapping voorhanden met de symbolen gebruikt op  de NGI stafkaarten?
> https://opentopomap.org/ komt enigszins in de buurt; er is ook iemand die mooie kaarten maakt onder de naam OpenArdenneMap https://www.champs-libres.coop/en/portfolio/post/openardennemap/
 
 * Kan je enkel feature per feature aanpassen of kan je data opladen in osm, die je dan op voorhand de juiste datastructuur geeft?
(Provincie Antwerpen (Kim Verbeeck - GIS-coordinator))
> ja, maar in samenwerking met de community!

* Hoe landschapselementen of gebouwen verwijderen die er niet meer zijn?
> gewoon deleten :)

* Gebeuren er zo soms geen zotte dingen die niet kloppen?
> absoluut, maar we hebben het onder controle

* Binnen cyclofix spreekt men van een Fietsparking, zijn dat bv de gekende nietjes of wordt er hier iets groters of betalend bedoeld?
>  er zijn subtypes, die krijgen een verschillend icoontje als je er op klikt



* Een fietswinkel die verhuisde. Kan dit punt verplaatst worden, of is het eerder aan te raden om te wissen en opnieuw aan te maken?
> Verplaatsen is het best, omdat de geschiedenis van het punt dan bewaard wordt.
> kan niet via cyclofix!


* Waarom staan er paadjes én rondjes? (in een voorbeeld op overpass-turbo)
> Wellicht gewoon heel korte stukjes (de rondjes worden in dat geval lijntjes als je erop inzoomt); ofwel "speciale punten" op de weg (denk: zebrapd, verkeersdrempel). Dit kan weggewerkt worden door de query of de instellingen aan te passen.


* wat is verschil tss "feature" en "relation"?
> Feature zijn al de "dingen", "relation" is een speciaal soort ding :)

* fietssnelwegen, enkel de bestaande of ook de toekomstige ?
> Gevoelig punt - we discussiëren hier intern over, maar momenteel zijn ook de toekomstige grotendeels gemapped
De persoon die ze heeft gemapped, heeft ook "voorlopige alternatieven" ingetekend. Maar dat is tegen onze regel dat we enkel mappen wat objectief vaststelbaar is. Dat "alternatief" is eigenlijk niet meer dan een mening

* is de OSM-data as is geschikt voor routering? (routeplanner, netwerk analyse,...)
> uiteraard! de collega's van Provincie West-Vlaanderen hebben dit al in productie (network analyst op osm)


* Routeplanning is gebaseerd op "weerstanden" net als bij electriciteit. Zijn er open routeplanners die je zelf kunt aanpassen? Uiteraard obv OSM.
> ja, Pieter heeft al eens een workshop gegeven over parameters van Osmand aanpassen. Is relatief gemakkelijk!

* Mag je alles toevoegen aan de maps die op openbaar domein staan en een algemeen nut hebben? Bepaalde data zou kunnen misbruikt worden door mensen met minder goede bedoelingen.
> ja, zolang het van op publiek domein zichtbaar is


* Straten gaan beoordelen hoe geschikt ze zijn voor inlineskates, kan dit ook toegevoegd worden of is dit eerder iets voor umap?
> dit kan binnen OSM! Dat kan op basis van de tag "smoothness" https://wiki.openstreetmap.org/wiki/Key:smoothness

* Deel zijn van een lange fietsroute, kan dat een kriterium voor gewicht zijn?
> in Osmand is dat relatief eenvoudig te activeren (afijn, niet specifiek lange fietsroutes, gewoon fietsroutes in het algemeen)
> Deel zijn van netwerk kan zeker een score zijn, bijvoorbeeld op deze route: https://routeplanner.bike.brussels/#11.54/50.8371/4.3555?sb=true&o=4.4013087,50.8978893&d=4.3132332,50.8327629&p=profile1
 

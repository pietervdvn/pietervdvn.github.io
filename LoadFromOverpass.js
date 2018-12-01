
// Bounding box of Belgium
var min_lon_be = 2.367;
var max_lon_be = 6.400 ;
var min_lat_be = 49.500;
var max_lat_be = 51.683 ;


function queryOverpass(tags, min_lat, max_lat, min_lon, max_lon){
	console.log(tags);

	var filter = "";
	for(var i = 0; i < tags.length; i++){
		filter = filter.concat("["+tags[i]+"]");
	}

	var query = "[out:json][timeout:25];("+
		"node"+filter+"("+min_lat+","+min_lon+","+max_lat+","+max_lon+");"+
		"way"+filter+"("+min_lat+","+min_lon+","+max_lat+","+max_lon+");"+
		"relation"+filter+"("+min_lat+","+min_lon+","+max_lat+","+max_lon+"););out body;>;out skel qt;"
	console.log(query);
	return "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
}



function surfaceArea(nodes){

	var minLat = 360;
	var minLon = 360;

	for(var i = 0; i < nodes.length; i++){
		var node = nodes[i];
		if(node === undefined){
			continue;
		}
		if(node.lat < minLat){
			minLat = node.lat;
		}
		if(node.lon < minLon){
			minLon = node.lon;
		}
	}


	var earthRadius = 6371000; //meters
	for(var i = 0; i < nodes.length; i++){
		var node = nodes[i];
		if(node === undefined){
			continue;
		}
		
		var dLat = Math.PI * (node.lat - minLat) / 180;
		var dLon = Math.PI * (node.lon - minLon) / 180;

		// With latitude diff = 0
    		var aLat0 = Math.cos(Math.PI * minLat / 180) * Math.cos(Math.PI * minLat / 180) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
   		var cLat0 = 2 * Math.atan2(Math.sqrt(aLat0), Math.sqrt(1-aLat0));
  
		var distLat0 = earthRadius * cLat0;


 		var aLon0 = Math.sin(dLat/2) * Math.sin(dLat/2);
    		var cLon0 = 2 * Math.atan2(Math.sqrt(aLon0), Math.sqrt(1-aLon0));
  		var distLon0 = earthRadius * cLon0;

		node.x = distLat0;
		node.y = distLon0;		
	}

	var surface = 0;
	for(var i = 0; i < nodes.length; i++){
		if(nodes[i] === undefined || nodes[i+1] === undefined){
			continue;
		}
		surface += (nodes[i].x * nodes[i+1].y) - (nodes[i+1].x * nodes[i].y);
	}

	return Math.floor(Math.abs(surface/2) * 100) / 100;
}



function idMap(jsonEls){
	var dict = Object();
	for(var i = 0; i < jsonEls.length; i++){
		var el = jsonEls[i];
		dict[el.id] = el;
	}
	return dict;
}


/**
All relations are inspected. The members of the relation get a reference to the tags of the relation, thus:

Before:
	way:
		id: 123


	relation:
		tags:
			... (object with pointer XYZ)
		members:
			123


becomes

	way:
		id: 123
		tags:
			... (object with pointer XYZ)

	relation:
		tags:
			... (object with pointer XYZ)


*/


function lookup(nodes, idMap){
	var newNodes = [];
	for(var i = 0; i < nodes.length; i++){
		newNodes.push(idMap[nodes[i]]);
	}
	return newNodes;

}

function geoCenter(nodes){
	var latSum = 0;
	var lonSum = 0;
	for(var i = 0; i < nodes.length; i++){
		var node = nodes[i];
		if(node === undefined){
			continue;
		}
		latSum += node.lat;
		lonSum += node.lon;
	}
	var avg = Object();
	avg.lat = latSum / nodes.length;
	avg.lon = lonSum / nodes.length;
	return avg;
}


function firstUnused(relation){
	let mems = relation.members
	for(i in mems){
		var way = mems[i];
		if(way.type != "way" && way.role != "outer"){
			continue;
		}
		if(way.used){
			continue;
		}
		way.used = true;
		return way;
	}
	return undefined;

}

function searchMatching(relation, currentWay, idMap){
	var last =  currentWay[currentWay.length - 1];
	var mems = relation.members;	
	for(i in mems){
		var way = mems[i];
		if(way.used){
			continue;
		}

		var nodes =idMap[way.ref].nodes;
		if(nodes[0] === last){
			way.used = true;
			return nodes;
		}

		if(nodes[nodes.length - 1] === last){
			way.used = true;
			nodes.reverse();
			return nodes;
		}
	}
	return undefined;

}

function renderRelation(relation, idMap){

	var outlines = [];

	var currentLine = firstUnused(relation);
	var currentWay = undefined;
	let totalArea = 0.0;
	while(currentLine){
		if(currentWay == undefined){
			currentWay = idMap[currentLine.ref].nodes;
		}
		if(currentWay === undefined){
			currentLine = firstUnused(relation)
			continue;
		}

		// Search a matching line
		var foundNodes = undefined;
		do{
			if(currentWay[0] == currentWay[currentWay.length - 1]){
				break;
			}
			foundNodes = searchMatching(relation, currentWay, idMap);
			currentWay = currentWay.concat(foundNodes);
		}while(foundNodes);

		// Is the line closed? Then we are done with the segment
		if(currentWay[0] === currentWay[currentWay.length - 1]){
			currentWay.tags = relation.tags;
			currentWay.nodes = lookup(currentWay, idMap);
			var center = geoCenter(currentWay.nodes);
			currentWay.lat = center.lat;
			currentWay.lon = center.lon;
			currentWay.type = "relation";
			currentWay.id = relation.id;
			currentWay.area = surfaceArea(currentWay.nodes);
			totalArea += currentWay.area;
			outlines.push(currentWay);
			currentWay = undefined;
		}

		currentLine = firstUnused(relation);
	}
	relation.tags.area = totalArea;
	return outlines;

}

function natureReserves(jsonEls, idMap){
	var natuurGebieden = [];

	for(var i = 0; i < jsonEls.length; i++){
		var el = jsonEls[i];
		if(el.tags == undefined){
			// Probably a way that is part of a relation
			continue;
		}
		el.tags.type = el.type
		el.tags.id = el.id;

		if(el.type == "way"){
			el.nodes = lookup(el.nodes, idMap);
			var center = geoCenter(el.nodes);
			el.lat = center.lat;
			el.lon = center.lon;
			el.tags.area = surfaceArea(el.nodes);
			el.area = el.tags.area;
			natuurGebieden.push(el);
		}
		if(el.type == "relation"){
				natuurGebieden = natuurGebieden.concat(renderRelation(el, idMap));
		}
		if(el.type == "node"){
			natuurGebieden.push(el);
		}

	}
	return natuurGebieden;
}


var cachedWikipedia = {};

function loadWikipedia(area){
	var lang = area.tags.wikipedia.split(':')[0];
	var page = area.tags.wikipedia.split(':')[1];
			
	var element =  document.getElementById('wikipedia_'+lang+"_"+page);
	if(cachedWikipedia[lang] == undefined){
		cachedWikipedia[lang] = {};
	}
	if(element){

		if(element.innerHTML){
			return;
		}
		if(cachedWikipedia[lang][page] != undefined){
			element.innerHTML = cachedWikipedia[lang][page];
			return;
		}
	
		element.innerHTML= "Loading...";
	}
	
	console.log("Loading wikipedia article...")

	$.ajax({
		url: "https://"+lang+".wikipedia.org/api/rest_v1/page/html/"+page,
		timeout: 5000,
		    success: function(html){
			var element =  document.getElementById('wikipedia_'+lang+"_"+page);

				if(element === null){
					console.log("No placeholder for wikipedia element "+'wikipedia_'+lang+"_"+page);
					return;
				}
				cachedWikipedia[lang][page] = html;
				element.innerHTML= html;
			},
			fail: function(xhr, textStatus, errorThrown){
				console.log("Request FAILED");
				var element =  document.getElementById('wikipedia_'+lang+"_"+page);
				element.innerHTML = null;
			}
		});
}

function addPopup(pin, area, textFunction){

	var trailingFunction = function(ar){ return; };

	if(area.tags){
		var wikilink = "";
		if(area.tags.wikipedia){
			var lang = area.tags.wikipedia.split(':')[0];
			var page = area.tags.wikipedia.split(':')[1];
			wikilink = " <a href='https://"+lang+".wikipedia.org/wiki/"+page+"'>Bekijk op wikipedia</a>";				

			area.tags.wikipedia_contents = "<div id='"+'wikipedia_'+lang+"_"+page+"'/>";

			
			trailingFunction = function(ar) {loadWikipedia(ar)};
					
		}
		var text = textFunction(area.tags, area.area);
		if(area.type){
			var type = area.type;
			if(area.wasRelation){
				type = "relation";
			}
			text += "<a href='https://openstreetmap.org/"+type+"/"+area.id+"' target='_blank'>Bekijk op OSM</a>"
			text += "  <a href='https://openstreetmap.org/edit?"+type+"="+area.id+"#map=17/"+area.lat+"/"+area.lon+"' target='_blank'>Wijzig kaart</a> "
			text += wikilink;

		}else{
			text += "<p>Zoom verder in om te bekijken op OSM</p>"
		}
		pin.bindPopup(L.popup().setContent(text), {maxWidth:600, minWidth: 600 });
	}
	return trailingFunction;
}

function makeLayer(elements, textFunction, imageFunction){
	var layer = L.featureGroup();
	for(i in elements){
		let area = elements[i];

		let options = {};
		let icon = undefined;
		if(imageFunction){
			icon = imageFunction(area.tags);
		}
		if(icon){
			options = {icon: icon};
		}

		let pin = L.marker([parseFloat(area.lat), parseFloat(area.lon)], options);
		
		pin.addTo(layer);
		let trailing = addPopup(pin, area, textFunction);
		pin.on('popupopen', function(){trailing(area)});
		
	}
	return layer;
}


function mergeByName(areas){
	var reprs = [];
	var hist = Object();
	var noName = [];
	for(i in areas){
		var el = areas[i];
		if(el.tags){
			if(el.tags.name){
				var nm = el.tags.name;
				if(hist[nm] == undefined){
					hist[nm] = [];
				}
				hist[nm].push(el);
			}else{
				noName.push(areas[i]);
			}
		}
	}

	for(area in hist){
		var representor = geoCenter(hist[area]);
		representor.tags = hist[area][0].tags;
		reprs.push(representor);
	}
	for(i in noName){
		reprs.push(noName[i]);
	}
	return reprs;


}


function drawNatureReserve(area){
	var points = [];
	if(area.type == "node"){
		return new L.marker([area.lat, area.lon]);
	}

	for(i in area.nodes){
		var node = area.nodes[i];
		points.push(new L.latLng(node.lat, node.lon));
	}
   return new L.Polygon(points);
}


var allPolies = [];
function makeDrawnLayer(reserves, textFunction){
	var raw = L.featureGroup();
	for(i in reserves){
		let area = reserves[i];
		let poly = drawNatureReserve(area)
		let trailing = addPopup(poly, area, textFunction);
		poly.on('popupopen', function(){trailing(area)});		
		poly.addTo(raw);
		poly.tags = area.tags;
		poly.tags.selected = false;
		poly.on('click', color(poly, area));
		allPolies.push(poly);
	}
	return raw;
}

function color(poly){
	return function(){
		poly.tags.selected = true;
		for(var i = 0; i < allPolies.length; i ++){
			try{
				if(allPolies[i].tags.selected){
					allPolies[i].setStyle({color:'#990000'});
				}else{
					allPolies[i].setStyle({color: '#0000FF'});
				}
			}catch(e){}			
		}
		poly.setStyle({color: '#FF0000'});
		poly.tags.selected = false;
	}
}

function searchAndRender(tags, textGenerator, imageFunction, overviewLayer, highLevelOnly, continuation){
	console.log("Running query... Hang on")
	var liveQuery  = queryOverpass(tags, min_lat_be, max_lat_be, min_lon_be, max_lon_be);
	$.getJSON(liveQuery, function(json) {renderQuery(json.elements, textGenerator, imageFunction, highLevelOnly, continuation);});	
}

function renderQuery(json, textGenerator, imageFunction, highLevelOnly, continuation){
	console.log(json)
	let ids = idMap(json);
	let reserves = natureReserves(json, ids);

	let lowZoomLayer = makeLayer(mergeByName(reserves), textGenerator, imageFunction);
	let midZoomLayer=  makeLayer(reserves, textGenerator, imageFunction);
	let highZoomLayer = makeDrawnLayer(reserves, textGenerator);
	map.on('zoomend', function(){
		map.removeLayer(highZoomLayer);
		map.removeLayer(midZoomLayer);
		map.removeLayer(lowZoomLayer);
		if(highLevelOnly){
			if(map.getZoom >= 14){
				map.addLayer(highZoomLayer);
			}
		}else if(map.getZoom() < 12){
			map.addLayer(lowZoomLayer);
		}else if(map.getZoom() < 14){
			map.addLayer(midZoomLayer);
		}else{
			map.addLayer(highZoomLayer);
		}
	});

	map.addLayer(lowZoomLayer);
	if(highLevelOnly){
		return;
	}
		
	map.fitBounds(highZoomLayer.getBounds(), {padding: L.point(50,50)});

	if(continuation){
		continuation();
	}

}




function initializeMap(tileLayer){	

	// load the tile layer from GEO6
	//var tileLayer = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
// https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?FORMAT=image/jpeg&VERSION=1.1.1&SERVICE=WMS&REQUEST=GetMap&LAYERS=OGWRGB13_15VL&STYLES=&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX=354514.9371372979,6655677.799976959,354667.8111938467,6655830.674033508
	var wmsLayer = L.tileLayer.wms('https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?s', 
		{layers:"OGWRGB13_15VL",
		 attribution: "Luchtfoto's van © AIV Vlaanderen (2013-2015) | Data van OpenStreetMap | Teksten van Wikipedia"});

	var osmLayer = L.tileLayer("https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
		{
		attribution: 'Map Data and background © <a href="osm.org">OpenStreetMap</a> | Teksten Wikipedia',
		maxZoom: 21,
		minZoom: 1
		});

	var osmBeLayer = L.tileLayer("https://tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png",
		{
		attribution: 'Map Data and background © <a href="osm.org">OpenStreetMap</a> | <a href="https://geo6.be/">Tiles by Geo6</a> | Teksten Wikipedia',
		maxZoom: 21,
		minZoom: 1
		});


	map = L.map('map', {
		center: [50.9, 3.9],
		zoom:9,
		layers: [osmLayer]			
		});

	var baseLayers = {
		"OpenStreetMap Be": osmBeLayer,
		"OpenStreetMap": osmLayer,
		"Luchtfoto AIV Vlaanderen": wmsLayer
	};

	
	L.control.layers(baseLayers).addTo(map);

	return map;
}


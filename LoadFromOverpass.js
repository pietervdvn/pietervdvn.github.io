
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

function natureReserves(jsonEls, idMap){
	var natuurGebieden = [];

	for(var i = 0; i < jsonEls.length; i++){
		var el = jsonEls[i];
		if(el.type == "way" && el.tags != undefined){
			el.nodes = lookup(el.nodes, idMap);
			var center = geoCenter(el.nodes);
			el.lat = center.lat;
			el.lon = center.lon;
			natuurGebieden.push(el);
		}
		if(el.type == "relation" && el.tags != undefined){
			// have a look at all the members.
			var currentWay = undefined;
			for(j in el.members){
				var way = idMap[el.members[j].ref];
				if(way === undefined){
					continue;
				}
				if(currentWay != undefined){
					currentWay = currentWay.concat(way.nodes);
				}else{
					currentWay = way.nodes;
				}
				// is it closed? Add it!
				if(currentWay[0] == currentWay[currentWay.length - 1]){
					currentWay.tags = el.tags;
					currentWay.nodes = lookup(currentWay, idMap);
					var center = geoCenter(currentWay.nodes);
					currentWay.lat = center.lat;
					currentWay.lon = center.lon;
					currentWay.type = "relation";
					currentWay.id = el.id;
					natuurGebieden.push(currentWay);
					currentWay = undefined;
				}
			}

		}
		if(el.type == "node" && el.tags != undefined){
			natuurGebieden.push(el);

		}

	}
	return natuurGebieden;
}

function addPopup(pin, area, textFunction){
		if(area.tags){
			var text = textFunction(area.tags);
			if(area.type){
				var type = area.type;
				if(area.wasRelation){
					type = "relation";
				}
				text += "<a href='https://openstreetmap.org/"+type+"/"+area.id+"' target='_blank'>Bekijk op OSM</a>"
				text += "  <a href='https://openstreetmap.org/edit?"+type+"="+area.id+"#map=17/"+area.lat+"/"+area.lon+"' target='_blank'>Wijzig</a>"
			}else{
				text += "<p>Zoom verder in om te bekijken op OSM</p>"
			}
			pin.bindPopup(L.popup().setContent(text));
		}
}

function makeLayer(elements, textFunction){
	var layer = L.featureGroup();
	for(i in elements){
		var area = elements[i];
		var pin = L.marker([parseFloat(area.lat), parseFloat(area.lon)]);
		pin.addTo(layer);
		addPopup(pin, area, textFunction);
		
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
	console.log(noName);
	for(i in noName){
		console.log(noName[i]);
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


function makeDrawnLayer(reserves, textFunction){
	var raw = L.featureGroup();
	for(i in reserves){
		var area = reserves[i];
		var poly = drawNatureReserve(area)
		addPopup(poly, area, textFunction);
		poly.addTo(raw);
	}
	return raw;
}

function searchAndRender(tags, textGenerator, overviewLayer){
   var liveQuery  = queryOverpass(tags, min_lat_be, max_lat_be, min_lon_be, max_lon_be);
	executeAndRenderQuery(liveQuery, textGenerator);
}

function executeAndRenderQuery(queryString, textGenerator){
	$.getJSON(queryString, function(json) {
		json = json.elements;

 		var ids = idMap(json);
		var reserves = natureReserves(json, ids);

		var highLevelLayer = makeLayer(mergeByName(reserves), textGenerator);
		map.addLayer(highLevelLayer);
		var midLevelLayer=  makeLayer(reserves, textGenerator);
		var lowLevelLayer = makeDrawnLayer(reserves, textGenerator);
		map.on('zoomend', function(){
			map.removeLayer(highLevelLayer);
			map.removeLayer(midLevelLayer);
			map.removeLayer(lowLevelLayer);
			if(map.getZoom() > 14){
				map.addLayer(lowLevelLayer);
			}else if (map.getZoom() > 11){
				map.addLayer(midLevelLayer);
			}else{
				map.addLayer(highLevelLayer);
			}

		});	
		
	});

}






function initializeMap(){	
	map = L.map('map').setView([50.9, 3.9], 9);

	// load the tile layer from GEO6
	//var tileLayer = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
	var tileLayer = "http://tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png";
	L.tileLayer(tileLayer,
		{
		attribution: 'Map Data © <a href="osm.org">OpenStreetMap</a> | <a href="https://geo6.be/">Tiles by Geo6</a>',
		maxZoom: 21,
		minZoom: 1
		}).addTo(map);

   return map;
}



// Bounding box of Belgium
var min_lon = 2.367;
var max_lon = 6.400 ;
var min_lat = 49.500;
var max_lat = 51.683 ;


function queryOperator(operator){

	var opString = "";
	if(operator){
		opString = "[\"operator\"~\""+operator+"\"]";
	}

	var query = "[out:json][timeout:25];("+
		"node"+opString+"[\"leisure\"=\"nature_reserve\"]("+min_lat+","+min_lon+","+max_lat+","+max_lon+");"+
		"way"+opString+"[\"leisure\"=\"nature_reserve\"]("+min_lat+","+min_lon+","+max_lat+","+max_lon+");"+
		"relation"+opString+"[\"leisure\"=\"nature_reserve\"]("+min_lat+","+min_lon+","+max_lat+","+max_lon+"););out body;>;out skel qt;"
	return "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
}

function queryGebied(operator, name){
	var query = "[out:json][timeout:25];("+
		"node[\"operator\"~\""+operator+"\"][name=\""+name+"\"][\"leisure\"=\"nature_reserve\"]("+min_lat+","+min_lon+","+max_lat+","+max_lon+");"+
		"way[\"operator\"~\""+operator+"\"][name=\""+name+"\"][\"leisure\"=\"nature_reserve\"]("+min_lat+","+min_lon+","+max_lat+","+max_lon+");"+
		"relation[\"operator\"~\""+operator+"\"][name=\""+name+"\"][\"leisure\"=\"nature_reserve\"]("+min_lat+","+min_lon+","+max_lat+","+max_lon+"););out body;>;out skel qt;"
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
		if(el.type == "way" && el.tags != undefined && el.tags.leisure == "nature_reserve"){
			el.nodes = lookup(el.nodes, idMap);
			var center = geoCenter(el.nodes);
			el.lat = center.lat;
			el.lon = center.lon;
			natuurGebieden.push(el);
		}
		if(el.type == "relation" && el.tags.leisure == "nature_reserve"){
			// have a look at all the members.
			var currentWay = undefined;
			for(j in el.members){
				var way = idMap[el.members[j].ref];
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

function addPopup(pin, area){
	var text = "";
		if(area.tags){
			if(area.tags.name){
				text += "<b>"+area.tags.name+"</b><br />";
			}
			if(area.tags.description){
				text += "<p>"+area.tags.description+"<p>";
			}

			if(area.tags.wikipedia){
				text += "<a href='https://wikipedia.org/wiki/"+area.tags.wikipedia+"' target='_blank'>Wikipedia</a><br />";
			}

			if(area.tags.website){
				text += "<a href=\""+area.tags.website+"\" target='_blank'>Bekijk op de site</a><br />";
			}
			if(area.tags.operator){
				text += "<p>Beheer door "+area.tags.operator+"</p>";
			}
			if(area.type){
				var type = area.type;
				if(area.wasRelation){
					type = "relation";
				}
				text += "<a href='https://openstreetmap.org/"+type+"/"+area.id+"' target='_blank'>Bekijk op OSM</a>"
			}else{
				text += "<p>Zoom verder in om te bekijken op OSM</p>"
			}
		}
		pin.bindPopup(L.popup().setContent(text));
}

function makeLayer(elements){
	var layer = L.featureGroup();
	for(i in elements){
		var area = elements[i];
		var pin = L.marker([parseFloat(area.lat), parseFloat(area.lon)]);
		pin.addTo(layer);
		addPopup(pin, area);
		
	}
	return layer;
}


function mergeByName(areas){
	var reprs = [];
	var hist = Object();
	for(i in areas){
		var el = areas[i];
		if(el.tags){
			var nm = el.tags.name;
			if(hist[nm] == undefined){
				hist[nm] = [];
			}
			hist[nm].push(el);
		}
	}

	for(area in hist){
		var representor = geoCenter(hist[area]);
		representor.tags = hist[area][0].tags;
		reprs.push(representor);
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


function makeDrawnLayer(reserves){
	var raw = L.featureGroup();
	for(i in reserves){
		var area = reserves[i];
		var poly = drawNatureReserve(area)
		addPopup(poly, area);
		poly.addTo(raw);
	}
	return raw;
}

function searchNature(operator, overviewLayer){
   var liveQuery  = queryOperator(operator);
	var notLive=  "NPBrugge.json";
	$.getJSON(liveQuery, function(json) {
		json = json.elements;

 		var ids = idMap(json);
		var reserves = natureReserves(json, ids);

		var highLevelLayer = makeLayer(mergeByName(reserves));
		map.addLayer(highLevelLayer);
		var midLevelLayer=  makeLayer(reserves);
		var lowLevelLayer = makeDrawnLayer(reserves);
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
	var tileLayer = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
	// http://tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png
	L.tileLayer(tileLayer,
		{
		attribution: 'Map Data © <a href="osm.org">OpenStreetMap</a> | Tiles hosted by <a href="https://geo6.be/">GEO-6</a>; thx JBelien!',
		maxZoom: 21,
		minZoom: 1
		}).addTo(map);


   return map;
}


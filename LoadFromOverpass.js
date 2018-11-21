
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

function natureReserves(jsonEls, idMap){
	var natuurGebieden = [];

	for(var i = 0; i < jsonEls.length; i++){
		var el = jsonEls[i];
		if(el.type == "way" && el.tags != undefined){
			el.nodes = lookup(el.nodes, idMap);
			var center = geoCenter(el.nodes);
			el.lat = center.lat;
			el.lon = center.lon;
			el.tags.area = surfaceArea(el.nodes);
			el.area = el.tags.area;
			natuurGebieden.push(el);
		}
		if(el.type == "relation" && el.tags != undefined){
			// have a look at all the members.
			var totalArea = 0;
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
					currentWay.area = surfaceArea(currentWay.nodes);
					totalArea += currentWay.area;
					natuurGebieden.push(currentWay);
					currentWay = undefined;
				}
			}
			el.tags.area = totalArea;

0

		}
		if(el.type == "node" && el.tags != undefined){
			natuurGebieden.push(el);
		}

	}
	return natuurGebieden;
}

function addPopup(pin, area, textFunction){
		if(area.tags){
			if(area.tags.wikipedia){
				var lang = area.tags.wikipedia.split(':')[0];
				var page = area.tags.wikipedia.split(':')[1];
				
				$.ajax({
      					async: false,
   					url: "https://"+lang+".wikipedia.org/api/rest_v1/page/html/"+page,
					    success: function(html){
						 area.tags.wikipedia_contents = html;
					    }
					});
			}

			var text = textFunction(area.tags, area.area);
			if(area.type){
				var type = area.type;
				if(area.wasRelation){
					type = "relation";
				}
				text += "<a href='https://openstreetmap.org/"+type+"/"+area.id+"' target='_blank'>Bekijk op OSM</a>"
				text += "  <a href='https://openstreetmap.org/edit?"+type+"="+area.id+"#map=17/"+area.lat+"/"+area.lon+"' target='_blank'>Wijzig kaart</a>"
				if(area.tags.wikipedia){
					text += " <a href='https://"+lang+".wikipedia.org/wiki/"+page+"'>Bekijk op wikipedia</a>";				
				}

			}else{
				text += "<p>Zoom verder in om te bekijken op OSM</p>"
			}
			pin.bindPopup(L.popup().setContent(text), {maxWidth:600});
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


var allPolies = [];
function makeDrawnLayer(reserves, textFunction){
	var raw = L.featureGroup();
	for(i in reserves){
		var area = reserves[i];
		var poly = drawNatureReserve(area)
		addPopup(poly, area, textFunction);
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

function searchAndRender(tags, textGenerator, overviewLayer){
	var liveQuery  = queryOverpass(tags, min_lat_be, max_lat_be, min_lon_be, max_lon_be);
	$.getJSON(liveQuery, function(json) {renderQuery(json.elements, textGenerator);});	
}

function renderQuery(json, textGenerator){
	//json = json.elements;
	var ids = idMap(json);
	var reserves = natureReserves(json, ids);

	var lowZoomLayer = makeLayer(mergeByName(reserves), textGenerator);
	var midZoomLayer=  makeLayer(reserves, textGenerator);
	var highZoomLayer = makeDrawnLayer(reserves, textGenerator);
	map.addLayer(lowZoomLayer);
	map.on('zoomend', function(){
		map.removeLayer(highZoomLayer);
		map.removeLayer(midZoomLayer);
		map.removeLayer(lowZoomLayer);
		if(map.getZoom() < 14){
			map.addLayer(lowZoomLayer);
		}else if(map.getZoom() < 16){
			map.addLayer(midZoomLayer);
		}else{
			map.addLayer(highZoomLayer);
		}
	});	
}




function initializeMap(tileLayer){	
	map = L.map('map').setView([50.9, 3.9], 9);

	// load the tile layer from GEO6
	//var tileLayer = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
	if(typeof tileLayer === "undefined"){
		var tileLayer = "http://tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png";
	}

	L.tileLayer(tileLayer,
		{
		attribution: 'Map Data © <a href="osm.org">OpenStreetMap</a> | <a href="https://geo6.be/">Tiles by Geo6</a>',
		maxZoom: 21,
		minZoom: 1
		}).addTo(map);

   return map;
}


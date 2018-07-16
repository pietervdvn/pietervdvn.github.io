// A script that serves to easily load data from overpass and render it with leaflet

// Bounding box of Belgium
var min_lon_be = 2.367;
var max_lon_be = 6.400 ;
var min_lat_be = 49.500;
var max_lat_be = 51.683 ;

var boxBe = [min_lat_be, max_lat_be, min_lon_be, max_lon_be];

function queryBelgium(tags, callback){
	return _queryOverpass(tags, boxBe, callback);
}

function queryView(map, tags, callback){
	return _queryOverpass(tags, viewBox(map), callback);
}



// Construct the actual overpass query
function _queryOverpass(tags, box, callback){
	var filter = "";
	for(var i = 0; i < tags.length; i++){
		filter = filter.concat("["+tags[i]+"]");
	}
	var filterBoxed = filter+"("+ box[0]+","+box[2]+","+box[1]+","+box[3]+");";
	var query = "[out:json][timeout:25];("+
		"node"+filterBoxed+
		"way"+filterBoxed+
		"relation"+filterBoxed+");out body;>;out skel qt;"
	var liveQuery = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
	console.log(liveQuery);
	$.getJSON(liveQuery, function(json) {
		json = json.elements;
		console.log(json);
		callback(json);
	});
}


function parseXML(xmlStr) {
   return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
}

// Gets a node based on the id
function queryOSMNode(nodeID, callback){
	$.get("https://api.openstreetmap.org/api/0.6/node/"+nodeID,function(xml){
		var nd = $(xml).find("node");
		var tags = Object();
		var xmltags = nd.find("tag");
		for(var i = 0; i < xmltags.length; i++){
			var xmlT = xmltags[i];
			var k = $(xmlT).attr("k");
			var v = $(xmlT).attr("v");
			tags[k] = v;
		}

		var json = {
			"type" : "node",
			"id": nodeID,
			"lat": nd.attr("lat"),
			"lon": nd.attr("lon"),
			"tags":tags
			};
		callback(json);
	});
}


// Renders the given features with given options
function renderWith(map, text, icon, color){
	return function(features){
		text = text === undefined ? function(node){return undefined;} : text; // popup text
		icon = icon === undefined ? function(node){return undefined;} : icon;
		color = color === undefined ? function(node){return undefined;} : color;

		for(var i = 0; i < features.length; i++){
			var f = features[i];
			console.log("Attempting rendering of ", f);

		//	if(f.type == "node"){
				var pin = L.marker([parseFloat(f.lat), parseFloat(f.lon)]);
				pin.addTo(map);
				pin.bindPopup(L.popup().setContent(text(f.tags)));		
		//	}
			

		}
	};
}



// Initialize the map
function initializeMap(options){	

	options = options === undefined ? new Object() : options;

	var zoomlevel = options.zoomlevel;
	if(zoomlevel === undefined){
		zoomlevel = options.node === undefined ? 9 : 18;
	}

   var loc = options.loc; 
	if(loc === undefined){
		loc = [50.9, 3.9];	
	}


	map = L.map('map')

	if(options.node != undefined){
		var node = queryOSMNode(options.node, function(node){
			loc = [node.lat, node.lon];
			map.setView(loc, zoomlevel);
			_initMap(map);
		});
	}else{
		map.setView(loc, zoomlevel);
		_initMap(map);
	}
   return map;
}


function _initMap(map){
	var tileLayer;
	tileLayer = "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png";
	// load the tile layer from GEO6
	tileLayer = "http://tile.openstreetmap.be/osmbe/{z}/{x}/{y}.png";
	L.tileLayer(tileLayer,
		{
		attribution: 'Map Data © <a href="osm.org">OpenStreetMap</a>',
		maxZoom: 21,
		minZoom: 1
		}).addTo(map);
	console.log("map inited");
}

// UTILITY FUNCTIONS

function viewBox(map){
	var bounds = map.getBounds();
	return [bounds.getSouth(), bounds.getNorth(), bounds.getWest(), bounds.getEast()];
}



/********************* UI and TEXT POPUP FUNCTIONS *********************/


/*
Colours the given polygon.
Uncolors the others (as igven in allPolies)
*/
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
		try{
    		poly.setStyle({color: '#FF0000'});
	    	poly.tags.selected = false;
		}catch(e){}
	}
}




var cachedWikipedia = {};

/*Loads and caches the requested wikipedia article. Puts the article at the element with id 'wikipedia_lang_page''*/
function loadWikipedia(area){


    if(area.tags.wikipedia === undefined){
        return;
    }

	var lang = area.tags.wikipedia.split(':')[0];
	var page = area.tags.wikipedia.split(':')[1];
			
	var element =  document.getElementById('wikipedia_'+lang+"_"+page);
	
	if(element === undefined){
        console.log("Aborted loading the wikipedia article: no such element")	
        return;
	}
	
	if(cachedWikipedia[lang] == undefined){
		cachedWikipedia[lang] = {};
	}
	if(element){

		if(element.innerHTML){
			return;
		}
		if(cachedWikipedia[lang][page] !== undefined){
			element.innerHTML = cachedWikipedia[lang][page];
			return;
		}
	
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
			area.tags.wikipedia_contents = html;
			element.innerHTML= html;
		},
		error: function(xhr, textStatus, errorThrown){
			console.log("Request FAILED");
			var element =  document.getElementById('wikipedia_'+lang+"_"+page);
			element.innerHTML = "Wikipedia-artikel kon niet worden geladen. Misschien is de pagina verwijdered of hernoemd?";
		}
		});
}

var cachedMeta = {};
function loadMeta(area){

    let id = area.tags.id;
    let type = area.tags.type;
	if(area.wasRelation){
		type = "relation";
	}
    if(cachedMeta[area.tags.id]){
        return;
    }
    cachedMeta[area.tags.id] = true;
    
    var element =  document.getElementById("meta_"+area.tags.id);
	
	if(element === undefined){
        console.log("Aborted loading the metadata: no such element")	
        return;
	}

	var url = "https://www.openstreetmap.org/api/0.6/"+type+"/"+id;

	$.ajax({ 
	    type : "GET", 
	    url : url, 
	    dataType : "xml",
	    success : function(service_data) { 
	      	$xml = $( service_data ),
	      	$attrs = $xml.find('osm').find(type)[0].attributes;
		    let meta = {user: $attrs.user.value, timestamp: $attrs.timestamp.value, changeset: $attrs.changeset.value}
		    let text = "<a href='https://www.openstreetmap.org/changeset/"+meta.changeset+"'>"+
			    "Laatst aangepast door "+meta.user+" op "+meta.timestamp+"</a>";
			element.innerHTML = text;
	    }
	});
}

// Executes the text functions, gathers the wikipedia article, gathers the last changeset
function createText(area, textFunction){

    
    
    // Get the wikipedia link
    area.tags.wikilink = "";
    area.tags.meta = "<span id='meta_"+area.tags.id+"' />";
	if(area.tags.wikipedia){
	    var lang = area.tags.wikipedia.split(':')[0];
	    var page = area.tags.wikipedia.split(':')[1];
	    area.tags.wikilink = " <a href='https://"+lang+".wikipedia.org/wiki/"+page+"'>Bekijk op wikipedia</a>";				
	    area.tags.wikipedia_contents = "<span id='wikipedia_"+lang+"_"+page+"'/>";
    }
    
    var text = textFunction(area.tags, area.area);
    
    // Create the fixed text at the bottom
    var footer = "";
	if(area.type){
		var type = area.type;
		if(area.wasRelation){
			type = "relation";

		}
		footer += "<p>"
		footer += area.tags.wikilink;
		footer += " <a href='https://openstreetmap.org/"+type+"/"+area.id+"' target='_blank'>Bekijk op OSM</a> "
		footer += "<a href='https://openstreetmap.org/edit?"+type+"="+area.id+"#map=17/"+area.lat+"/"+area.lon+"' target='_blank'>Wijzig</a> "
		footer += area.tags.meta;
		footer+="</p>"
	}


    return text + footer;

}


/*
Adds a popup to a map element, with the given text function
*/
function addPopup(pin, area, textFunction){



    if(area.tags === undefined){
        return;
    }

    let contents = createText(area, textFunction);

    pin.bindPopup(L.popup().setContent(contents), {maxWidth:800, minWidth: 600 });
    pin.on('popupopen', function(){
        loadWikipedia(area);
        loadMeta(area); 
    });
}



/********************** UTILITY FUNCTIONS **************************/



function surfaceArea(nodes, allowNegative){

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

	if(allowNegative){
		surface = surface / 2;
	}else{
		surface = Math.abs(surface) / 2;
	}
	return Math.floor(surface * 100) / 100;
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

/*********************** DATA PREPARTION **************************/



function idMap(jsonEls){
	var dict = Object();
	for(var i = 0; i < jsonEls.length; i++){
		var el = jsonEls[i];
		dict[el.id] = el;
	}
	return dict;
}




function lookup(nodes, idMap){
	var newNodes = [];
	for(var i = 0; i < nodes.length; i++){
		newNodes.push(idMap[nodes[i]]);
	}
	return newNodes;

}

/************************ RELATION RENDERING **********************/


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
/***************************** Rendering the data ****************************/

function extractAreas(jsonEls, idMap){
	var areas = [];

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
			areas.push(el);
		}
		if(el.type == "relation"){
				areas = areas.concat(renderRelation(el, idMap));
		}
		if(el.type == "node"){
			areas.push(el);
		}

	}
	return areas;
}


function makeOverviewLayer(elements, textFunction, imageFunction){
    try{
        if(elements.length > 100){
            return heatLayer(elements);
        }
    }catch(e){}
    return makeIconLayer(elements, textFunction, imageFunction)
}

function makeIconLayer(elements, textFunction, imageFunction){
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
		addPopup(pin, area, textFunction);
		
		
	}
	return layer;
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect or fall at the end/start of the segment
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {

  // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}

	if((x1 === x3 && y1 === y3) 
		|| (x2 === x4 && y2 === y4)
		|| (x1 === x4 && y1 === y4)
 		|| (x2 === x3 && y2 === y3)){
		// End of start point are the same
		return false;
	}

	denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
	if (denominator === 0) {
		return false
	}

	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}

  // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return {lat: x, lon: y, type: "node"}
}


function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point.lat, y = point.lon;

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].lat, yi = vs[i].lon;
        var xj = vs[j].lat, yj = vs[j].lon;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};


// clips polyA so that it does not get out of 'outerbound'
function PolygonClip(polyA, outerbound){

	if(polyA.type === "node" || polyA.nodes.length==0){
		if(inside([polyA.lat, polyA.lon], outerbound.nodes)){
			return polyA;		
		}else{
			return undefined;
		}
	}

	if(surfaceArea(polyA.nodes, true) < 0) {
		polyA.nodes.reverse();
	}

	if(surfaceArea(outerbound.nodes, true) < 0){
		outerbound.nodes.reverse();
	}

	console.log(polyA, outerbound);

	// Polygon intersection 
	// We start at a random point and walk along the polygon
	// For each edge, we check if it intersects with the outerBound
	// If that is the case, we insert an intersection point
	var n = polyA.nodes.length
	var bn = outerbound.nodes.length;
	var i;
	var allIntersections = {};
	for(i in polyA.nodes){
		var nodeA = polyA.nodes[i];
		var nodeB = polyA.nodes[(i+1) % n];

		for(var j in outerbound.nodes){
			var boundA = outerbound.nodes[j];
			var boundB = outerbound.nodes[(j+1) % bn];
			var intersection = intersect(
				nodeA.lat, nodeA.lon,
				nodeB.lat, nodeB.lon,
				boundA.lat, boundA.lon,
				boundB.lat, boundB.lon);
			if(intersection){
				// Is the next element inside the bounds?
				var goingIn = inside(polyA.nodes[(i+1) % polyA.nodes.length], outerbound.nodes);
				intersection.boundIndex = j;
				allIntersections[j] = {index: i, gettingIn :goingIn};
				polyA.nodes.splice(i, 0, intersection);
			}

		}
	}


	// Small helper function to construct a new poly with the same properties but empty shape
	function newPoly(){
		var poly = {};
		for(var prop in polyA){
			// Copy all properties
			poly[prop] = polyA[prop];
		}
		poly.nodes = [];
		return poly;
	}


	// We have all intersection points; 
	// We use these to construct all resulting polygons, and use the indices as starting points

	if(Object.keys(allIntersections) == 0){
		// Special case: either all or no points lie in the bounds
		if(inside(polyA.nodes[0], outerbound.nodes)){
			// All is inside
			return [polyA];
		}else{
			// Nothing is inside
			if(inside(outerbound.nodes[0], polyA.nodes)){
				// The bound could is completely contained in polyA
				// We create a new polygon with polyA's properties and bounds shape				
				var merged = newPoly();
				merged.nodes = outerbound.nodes;
				return [merged];
			}
			return [];
		}
	}
	
	// We could have multiple polygons as result
	// Hence, we keep a list
	var results =  [];

	// Alright! Lets get started constructing intersected polygons
	// Remember that allIntersections maps bounds_index onto polyA_index
	console.log("Intersections: ",allIntersections);
	var j, poly, follow;
	while(true){
		console.log(allIntersections, Object.keys(allIntersections).length);
		j = -1;
		for(j in allIntersections){

			if(!allIntersections[j].goingIn){
				break;
			}
		}
		
		if(j == -1){
			break; // no index found, we are through
		}


		// Alright: we have an index on the outer bound where we can start walking along the bounds
		delete allIntersections[j];
		poly = newPoly();
		follow = outerbound.nodes;
		console.log("Starting, outer, ",j);
		do{
			if(follow[j] === undefined){
				console.log("WUT?");
				return results;
			}

			poly.nodes.push(follow[j]);
			if(follow[j].boundIndex !== undefined){
				// We are on polyA and reached an intersection
				follow = outerbound.nodes;
				if(allIntersections[j]){
					console.log("Switchout ",j);
					delete allIntersections[j];
				}else{
					console.log("Finished subpoly");
					// We already used this intersection
					results.push(poly);
					break;
				}
				j = follow[j].boundIndex;
			}

			if(allIntersections[j]){
				// We are on the outer polygon and reached an intersection
				follow = polyA.nodes;
				j = allIntersections[j].index;
				console.log("Switch in", j);
				delete allIntersections[j];
			}
			j ++;
		}while(true);
	

	}

	return results;
}

function heatLayer(elements){
    var points = [];
    for(i in elements){
        if(elements[i].nodes){
            points.push(geoCenter(elements[i].nodes));
        }else{
            points.push ([elements[i].lat, elements[i].lon])
        }
    }
    var heat = L.heatLayer(points, {radius: 25});
    return heat;
}

function drawArea(area, imageFunction){
	var points = [];
	
	if(area.type == "node"){
	    let options = {};
		let icon = undefined;
		if(imageFunction){
			icon = imageFunction(area.tags);
		}
		if(icon){
			options = {icon: icon};
		}

		return new L.marker([area.lat, area.lon], options);
	}

	for(i in area.nodes){
		var node = area.nodes[i];
		points.push(new L.latLng(node.lat, node.lon));
	}
   return new L.Polygon(points);
}


var allPolies = [];
function makeDrawnLayer(areas, textFunction, imageFunction){
	var raw = L.featureGroup();
	for(i in areas){
		let area = areas[i];
		let poly = drawArea(area, imageFunction)
	    addPopup(poly, area, textFunction);
	    
		poly.addTo(raw);
		poly.tags = area.tags;
		poly.tags.selected = false;
		poly.on('click', color(poly, area));
		allPolies.push(poly);
	}
	return raw;
}



/****************************** Getting the data ******************************/ 


function queryOverpass(tags,relId){
	console.log(tags);

	var filter = "";
	for(var i = 0; i < tags.length; i++){
		filter = filter.concat("["+tags[i]+"]");
	}

    var relStr = ""+relId;
    while(relStr.length < 8){
        relStr = "0"+relStr
    }
	var query = 
	    "[out:json][timeout:25];"+
	    "area(36"+relStr+")->.searchArea;("+
		"node"+filter+"(area.searchArea);"+
		"way"+filter+"(area.searchArea);"+
		"relation"+filter+"(area.searchArea););out body;>;out skel qt;"
	console.log(query);
	return "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
}


/****************************** API: Data users: use functions below ******************************/ 


/*
Creates an overpass-query, executes it and gives the result to 'renderQuery'
*/
function searchAndRender(tags, searchIn, textGenerator, imageFunction, highLevelOnly, options){
	console.log("Running query... Hang on")
	var nominatimQuery = "https://nominatim.openstreetmap.org/search.php?q="+searchIn+"&format=json";
	$.getJSON(nominatimQuery, function(nomJson){
	var firstRel = nomJson[0];
	var liveQuery  = queryOverpass(tags, firstRel.osm_id);
	$.getJSON(liveQuery, 
	    function(json) {
		renderQuery(json.elements, textGenerator, imageFunction, highLevelOnly, options);
	});	
	
	})
}


function CachedFirstRender(tags, searchIn, textGenerator, imageFunction, options){
    
	var filter = "";
	for(var i = 0; i < tags.length; i++){
		filter = filter.concat("["+tags[i]+"]");
	}

 let staleQuery = "https://pietervdvn.github.io/Quickmaps/cache/"+searchIn+"/"+encodeURIComponent(filter).replace(/~/g, '%3D')+".json"
    console.log("Attempting to load cache from github", staleQuery);
    $.getJSON(staleQuery, 
        function(json) {renderQuery(json.elements, textGenerator, imageFunction, options);}
        ).fail(function(){  
            console.log("Cache missing, falling back to overpass");
            searchAndRender(tags, searchIn, textGenerator, imageFunction, options);
            } )

}


// This function is called whenever the map zoom level is changed
// Every time another known action is added, we chain it to this function

let onZoomChanged = [];
function addZoomChangeCall(f){
    onZoomChanged.push(f);
}

var i = 0;

function makeZoomFunction(json, options, highZoomLayer, midZoomLayer, lowZoomLayer){
    if(options.highLevelOnly){
	    return function(){
	        if(!options.hidden && map.getZoom() >= 14){
			    map.addLayer(highZoomLayer);
		    }else{
		        map.removeLayer(highZoomLayer);
		    }
	    }
	}else{
	    return function(){
		    map.removeLayer(highZoomLayer);
		    map.removeLayer(midZoomLayer);
		    map.removeLayer(lowZoomLayer);
		    if(options.hidden){
			return;
		    }
		    if(map.getZoom() < 12){
			    map.addLayer(lowZoomLayer);
		    }else if(map.getZoom() < 14){
			    map.addLayer(midZoomLayer);
		    }else{
			    map.addLayer(highZoomLayer);
		    }
	    };
	}
}

/*
Renders the data. You can feed a retrieved cache file here too.

Options-object:
highLevelOnly: only show this layer at high zoom levels (default: false)
preprocessing: execute this function on the extracted areas, if defined
continuation: execute this function when loading is done, with the resulting areas/data (default: undefined)
iconsOnly: do not render surfaces, only show the icon (default: false)

*/
function renderQuery(json, textGenerator, imageFunction, options){
	console.log("Got data, starting rendering of: ", json, "; ", "Options are", options);
	if(options === undefined){
	    options = {};
	}
	let ids = idMap(json);
	let areas = extractAreas(json, ids);

	if(options.preprocessing){
		areas = options.preprocessing(areas);
	}

	let lowZoomLayer = makeOverviewLayer(mergeByName(areas), textGenerator, imageFunction);
	let midZoomLayer = makeOverviewLayer(areas, textGenerator, imageFunction);
	let highZoomLayer;
	if(options.iconsOnly){
        highZoomLayer = makeIconLayer(areas, textGenerator, imageFunction);	
	}else{
        highZoomLayer = makeDrawnLayer(areas, textGenerator, imageFunction);
	}
	let zoomF = makeZoomFunction(json, options, highZoomLayer, midZoomLayer, lowZoomLayer)
	addZoomChangeCall(zoomF);
	zoomF();

    if(options.highLevelOnly){
        console.log("Not zooming to this layer")
    }else{
    	map.fitBounds(highZoomLayer.getBounds(), {padding: L.point(50,50)});
    }

	console.log("Continuation is ",options.continuation);
	if(options.continuation){
		options.continuation(areas);
	}

}

/*Simply a function that shows all tags*/
function debugTagsText(tags){
    let text = "";
    console.log(tags);
    for(k in tags){
        text += k+"="+tags[k]+"<br />";
        console.log(text);
    }
    return text;
}

/*

Call this function when setting up your map
*/
function initializeMap(tileLayer){	

	// load the tile layer from GEO6
	var wmsLayer = L.tileLayer.wms('https://geoservices.informatievlaanderen.be/raadpleegdiensten/OGW/wms?s', 
		{layers:"OGWRGB13_15VL",
		 attribution: "Luchtfoto's van © AIV Vlaanderen (2013-2015) | Data van OpenStreetMap"});

	var osmLayer = L.tileLayer("https://{a,b,c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		{
		attribution: 'Map Data and background © <a href="osm.org">OpenStreetMap</a>',
		maxZoom: 21,
		minZoom: 1
		});
	var osmBeLayer = L.tileLayer("https://tile.osm.be/osmbe/{z}/{x}/{y}.png",
		{
		attribution: 'Map Data and background © <a href="osm.org">OpenStreetMap</a> | <a href="https://geo6.be/">Tiles courtesy of Geo6</a>',
		maxZoom: 21,
		minZoom: 1
		});

    var grbLayer = L.tileLayer("https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=grb_bsk&STYLE=&FORMAT=image/png&tileMatrixSet=GoogleMapsVL&tileMatrix={z}&tileCol={x}&tileRow={y}",
		{
		attribution: 'Map Data   <a href="osm.org">OpenStreetMap</a> | Background <i>Grootschalig ReferentieBestand</i>(GRB) © AGIV',
		maxZoom: 21,
		minZoom: 1,
		wmts:true
		});


    let defaultLayer = osmBeLayer;
    var baseLayers = {
		"OpenStreetMap Be": osmBeLayer,
		"OpenStreetMap": osmLayer,
		"Luchtfoto AIV Vlaanderen": wmsLayer,
		"GRB Vlaanderen": grbLayer
	};
    
    var urlParams = new URLSearchParams(window.location.search);
    let selectedLayerName = urlParams.get('layer')

    if(baseLayers[selectedLayerName]){
        defaultLayer = baseLayers[selectedLayerName];
    }

	map = L.map('map', {
		center: [50.9, 3.9],
		zoom:9,
		layers: [defaultLayer]			
		});

	L.control.layers(baseLayers).addTo(map);
    map.on('zoomend', function(){
        for(i=0; i < onZoomChanged.length; i++){
            onZoomChanged[i]();
        }
    });


	

    
	

	return map;
}



function reJoin(arr){

    var txt = arr[0];
    var i;
    for(i = 1; i < arr.length - 1; i++){
        txt += ", "+arr[i]
    }
    
    txt += " en "+arr[i];
    return txt
}

function toHa(surface){
	return Math.floor(surface/100)/100;
}


/*
* Creates an image slider. Needs the Slideshow.js and Slideshow.css files imported
imageInfo = [ { src = <some url>, caption = <some caption> } ]
*/
function pictureSlider(imageInfo){

    var text = '<div class="slideshow-container">'  
    var total = imageInfo.length;
    console.log(imageInfo)
    for(var i in imageInfo){
        var img = imageInfo[i]
        text += '<span class="mySlides fade"><div class="numbertext">'+i+' / '+total+'</div><img src="'+img.src+'" style="height:35%"><div class="text">'+img.caption+'</div></span>'
    }
  
    text += '<a class="prev" onclick="plusSlides(-1)">&#10094;</a><a class="next" onclick="plusSlides(1)">&#10095;</a></div>'
    return text;
}


function contactInfo(tags){
    var text = "";
    
    text += "</p>"
    if(tags.operator){
		text += "Beheer door "+tags.operator;
	}
	if(tags.owner){
	    text += " - in eigendom van "+reJoin(tags.operator.split(";"))
	}
	
	text += "</p>";
    
    if(tags.curator.includes(';')){
		    text += "<p>Conservatoren zijn <strong>"+reJoin(tags.curator.split(";"))+"</strong></p>"
		}else{
    		text += "<p>Conservator is <strong>"+tags.curator+"</strong></p>"
		}
		
		
		text += "<p>Telefoonnummer is "
		if(tags.phone){
			text += tags.phone
		}else{
			text += "niet gegeven"		
		}
		text += "</p><p>Email is "
		if(tags.email){
		    if(tags.email.includes(";")){
                var mails = ""
                var splitted = tags.email.split(";")
                for(var i in splitted){
                    mails +="<a href='mailto:"+splitted[i]+"'>"+splitted[i]+"</a>"
                    if(i < splitted.length - 2 ){
                        mails += ","
                    }else if (i == splitted.length - 2){
                        mails += " en "
                    }
                }
                text += mails		    
		    }else{
			    text += "<a href='mailto:"+tags.email+"'>"+tags.email+"</a>"
		    }
		}else{
			text += "niet gegeven"		
		}
		text += "</p>"
	return text;
}

function accessInfo(tags){
    var text = "";
    
    
	if(tags.access){
		if(tags.access == "no"){
			text += "<p><strong>Niet vrij toegankelijk<strong>. Enkel te bezoeken tijdens activiteiten.</p>";
		}else if(tags.access == "yes"){
			text += "<p>Toegankelijk op de paden</p>";
		}else if(tags.access == "guided"){
			text += "<p>Enkel toegankelijk met een gids of tijdens activiteiten</p>"
		}else{
			text += "<p>Toegankelijkheid: "+tags.access+"</p>";				
		}
	}
	if(tags.dog){
		if(tags.dog == "no"){
			text += "<p>Honden niet toegelaten</p>";		
		}else if(tags.dog == "leashed"){
			text += "<p>Honden enkel aan de leiband</p>";		
		}else if(tags.dog == "yes"){
			text += "<p>Honden zijn toegelaten</p>";
		}else if(tags.dog == "unleashed"){
			text += "<p>Honden zijn toegelaten, zelfs los zonder leiband</p>";
		}else{
			text += "<p>Honden: "+tags.dog+"</p>";		
		}

	}
	
	return text;
}

function popupText(tags, area){
 	text = "";
	if(tags.name){
		text += "<h1>"+tags.name+"</h1>";
	}

	text += "<table><tr><td>";
	text += toHa(tags.area)+" hectare"
	if(tags.area != area && !isNaN(area)){
		text += " - " + toHa(area)+" hectare geselecteerd";
	}


	if(tags.curator){
        text += contactInfo(tags);
		
	}

    text += accessInfo(tags)



	if(tags.description){
		text += "<p>Beschrijving: <strong>"+tags.description+"</strong><p>";
	}

	if(tags.image){
        text+="</td><td><img width=300px src='"+tags.image+"' alt='Bezig met laden...'/>";
	}

	if(tags.wikipedia){
		text += "</td></tr><tr><td colspan='2'><h2>Op wikipedia</h2>";

		text += '<div id="" style="overflow:scroll; height:300px;">' + tags.wikipedia_contents + '</div>';
	}


	if(tags.website){
		text += "</td></tr><tr><td colspan='2'><a href=\""+tags.website+"\" target='_blank'>Bekijk op de site</a><br />";
	}
	
	text += "</td></tr></table>"
	return text;
}


var natuurpuntIcon = L.icon({
    iconUrl: 'https://pietervdvn.github.io/Quickmaps/Natuurgebieden/resources/Natuurpunt.jpg',

    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [25, 35], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
});

var anbIcon = L.icon({
    iconUrl: 'https://pietervdvn.github.io/Quickmaps/Natuurgebieden/resources/ANB.jpg',

    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [25, 35], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
});


var info = L.icon({
    iconUrl: 'https://pietervdvn.github.io/Quickmaps/Natuurgebieden/resources/info.png',

    iconSize:     [26, 26], // size of the icon
    iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});

var birdhide = L.icon({
    iconUrl: 'https://pietervdvn.github.io/Quickmaps/Natuurgebieden/resources/birdhide.png',

    iconSize:     [26, 26], // size of the icon
    iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});

var birdhideShelter = L.icon({
    iconUrl: 'https://pietervdvn.github.io/Quickmaps/Natuurgebieden/resources/birdshelter.png',

    iconSize:     [26, 26], // size of the icon
    iconAnchor:   [13, 13], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});

function imageFunction(tags){
    if(tags.operator){
        if(tags.operator.startsWith("Natuurpunt") || tags.operator.startsWith("natuurpunt")){
	        return natuurpuntIcon;
        }
        if(tags.operator.startsWith("Agentschap Natuur") || tags.operator.startsWith("Agentschap voor Natuur")){
	        return anbIcon;	
        }
    }
	console.log("No image for ", tags.operator);
}


function infoBoardText(tags){
	let text=  "<h1>Informatiebord</h1>";
	text += "<img src='"+tags.image+"' alt='"+tags.image+"' height=\"400\"/>";
	return text;
}

function birdHideImage(tags){
    if(tags.building){
        return birdhideShelter;
    }
    return birdhide;
}

function birdHideText(tags){
    var text = "<h1>";
    if(tags.building){
        text += "Vogelkijkhut"
    }else{
        text += "Vogelkijkwand"
    }
    
    if(tags.name){
        text += " <i>"+tags.name+"</i>";
    }
    text+="</h1>"
    
    if(tags.opening_hours){
        text += "Openingsuren: "+tags.opening_hours    
    }
    if(tags.access){
        text += "Toegang: "+tags.access;
    }
    
    return text;
}

function imageBoardFunction(tags){
	return info;
}


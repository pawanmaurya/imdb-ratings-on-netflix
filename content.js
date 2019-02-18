function fetchMovieNameYear(){
	var synopsis = document.querySelectorAll('.jawBone .jawbone-title-link');
  	if(synopsis === null){
  		return;
  	}

  	var logoElement = document.querySelectorAll('.jawBone .jawbone-title-link .title');

  	if(logoElement.length === 0)
  		return;

  	logoElement = logoElement[logoElement.length - 1];

  	var title = logoElement.textContent;


  	if(title === ""){
  		title = logoElement.querySelector(".logo").getAttribute("alt");
  	}

	var	titleElement = document.querySelectorAll('.jawBone .jawbone-title-link .title .text').textContent;

	var yearElement = document.querySelectorAll('.jawBone .jawbone-overview-info .meta .year');
	if(yearElement.length === 0)
		return;
	var year = yearElement[yearElement.length-1].textContent;


	var divId = getDivId(title, year);


	if(document.querySelector("#"+divId) !== null && $("#"+divId).is(":visible")){
		return;
	}

	var existingImdbRating = sessionStorage.getItem(title+":"+year);
	if((existingImdbRating !== "undefined") && (existingImdbRating !== null))
		addIMDBRating(existingImdbRating, title, year);
	else
		var imdbRating = getImdbRating(title,year);
	
}

function addIMDBRating(imdbRating, name, year){
	var divId = getDivId(name, year);

	if(document.querySelector("#"+divId) !== null && $("#"+divId).is(":visible")){
		return;
	}

	var elems = document.querySelectorAll(".jawBone .synopsis").length;

  	
	$('.jawBone .synopsis').last().before(
		'<div class="imdbRating" id="'+divId+'">'+'IMDb rating : ' + ((imdbRating && imdbRating != 'undefined')?imdbRating:"N/A"));
}

function getDivId(name, year){
	name = name.replace(/[^a-z0-9\s]/gi, '');
	name = name.replace(/ /g, '');
	return "aaa"+name+"_"+year;
}


$(document).ready(function(event) {


if(window.sessionStorage === "undefined")
	return;

var target = document.body;
// create an observer instance
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
  	window.setTimeout(fetchMovieNameYear,5); 
  });
});
// configuration of the observer:
var config = {
  attributes: true,
  childList: true,
  characterData: true
};

observer.observe(target, config);

});

function getImdbRating(name, year){
	var existingImdbRating = window.sessionStorage.getItem(name+":"+year);
	if((existingImdbRating !== "undefined") && (existingImdbRating !== null)){
		addIMDBRating(existingImdbRating, name, year);
		return;
	}
	var url = "https://www.omdbapi.com/?apikey=c53e54a4&t="+encodeURI(name)+"&y="+year;
	$.ajax({
                type: "GET",
                url: url,
                contentType: 'application/json',
                xhrFields: {
    			    withCredentials: true
    			},
                dataType: 'json',
                async : false,
                success: function (apiResponse) {
                	var imdbRating = apiResponse["imdbRating"];
                	window.sessionStorage.setItem(name+":"+year,imdbRating);
                	addIMDBRating(imdbRating, name, year);
                },
                error: function (data) {
                }
    });
};
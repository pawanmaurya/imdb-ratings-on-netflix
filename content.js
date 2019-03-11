function fetchMovieNameYear() {
    var synopsis = document.querySelectorAll('.jawBone .jawbone-title-link');
    if (synopsis === null) {
        return;
    }

    var logoElement = document.querySelectorAll('.jawBone .jawbone-title-link .title');

    if (logoElement.length === 0)
        return;

    logoElement = logoElement[logoElement.length - 1];

    var title = logoElement.textContent;

    if (title === "")
        title = logoElement.querySelector(".logo").getAttribute("alt");

    var titleElement = document.querySelectorAll('.jawBone .jawbone-title-link .title .text').textContent;

    var yearElement = document.querySelectorAll('.jawBone .jawbone-overview-info .meta .year');
    if (yearElement.length === 0)
        return;
    var year = yearElement[yearElement.length - 1].textContent;

    var divId = getDivId(title, year);
    var divEl = document.getElementById(divId);
    if (divEl && (divEl.offsetWidth || divEl.offsetHeight || divEl.getClientRects().length)) {
        return;
    }

    var existingImdbRating = window.sessionStorage.getItem(title + ":" + year);
    if ((existingImdbRating !== "undefined") && (existingImdbRating !== null)) {
        addIMDBRating(existingImdbRating, title, year);
        //if imdbRating is fetched, rotten is fetched too
        var rottenRating = window.sessionStorage.getItem("rotten" + ":" + title + ":" + year);
        addRottenRating(rottenRating, title, year);
    } else {
        makeRequestAndAddRating(title, year)
    }
};

function addIMDBRating(imdbRating, name, year) {
    var divId = getDivId(name, year);

    var divEl = document.getElementById(divId);
    if (divEl && (divEl.offsetWidth || divEl.offsetHeight || divEl.getClientRects().length)) {
        return;
    }

    var synopsises = document.querySelectorAll('.jawBone .synopsis');
    if (synopsises.length) {
      var synopsis = synopsises[synopsis.length - 1];
      var div = document.createElement('div');
      div.innerHTML = 'IMDb rating : ' + ((imdbRating && imdbRating != 'undefined') ? imdbRating : "N/A");
      div.className = 'imdbRating';
      div.id = divId;
      synopsis.parentNode.insertBefore(div, synopsis);
    }
}

function addRottenRating(rottenRating, name, year) {
	if(rottenRating === "undefined" || rottenRating === "N/A")
		return;

    var divId = 'rotten' + getDivId(name, year);
    var divEl = document.getElementById(divId);
    if (divEl && (divEl.offsetWidth || divEl.offsetHeight || divEl.getClientRects().length)) {
        return;
    }

    var synopsises = document.querySelectorAll('.jawBone .synopsis');
    if (synopsises.length) {
      var synopsis = synopsises[synopsis.length - 1];
      var div = document.createElement('div');
      div.innerHTML = 'Rotten Tomatoes rating : ' + ((rottenRating && rottenRating !== 'undefined') ? rottenRating : "N/A");
      div.className = 'rottenRating';
      div.id = divId;
      synopsis.parentNode.insertBefore(div, synopsis);
    }
}

function getDivId(name, year) {
    name = name.replace(/[^a-z0-9\s]/gi, '');
    name = name.replace(/ /g, '');
    return "aaa" + name + "_" + year;
}

function makeRequestAndAddRating(name, year) {
    var url = "https://www.omdbapi.com/?apikey=<secret_key>&t=" + encodeURI(name) + "&y=" + year + "tomatoes=true";

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 200) {
        var apiResponse = JSON.parse(xhr.responseText);
        var imdbRating = apiResponse["imdbRating"];
        var rottenRating = extractRottenTomatoesRating(apiResponse["Ratings"]);
        window.sessionStorage.setItem(name + ":" + year, imdbRating);
        window.sessionStorage.setItem("rotten:" + name + ":" + year, rottenRating);
        addIMDBRating(imdbRating, name, year);
        addRottenRating(rottenRating, name, year);
      }
    };
    xhr.send();
}

function extractRottenTomatoesRating(ratings) {
    const rottenRating = ratings.filter(rating => rating.Source === "Rotten Tomatoes");
    return rottenRating[0] ? rottenRating[0].Value : "undefined";
}


if (window.sessionStorage !== "undefined") {
  var target = document.body;
  // create an observer instance
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      window.setTimeout(fetchMovieNameYear, 5);
    });
  });
  // configuration of the observer:
  var config = {
    attributes: true,
    childList: true,
    characterData: true
  };
  observer.observe(target, config);
}

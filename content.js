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

    if (document.querySelector("#" + divId) !== null && $("#" + divId).is(":visible")) {
        return;
    }

    var existingImdbRating = window.sessionStorage.getItem(title + ":" + year);
    if ((existingImdbRating !== "undefined") && (existingImdbRating !== null)) {
        addIMDBRating(existingImdbRating, title, year);
        //if imdbRating is fetched, rotten is fetched too
        var rottenRating = window.sessionStorage.getItem("rotten" + title + ":" + year);
        addRottenRating(rottenRating, title, year);
    } else {
        makeRequestAndAddRating(title, year)
    }
};

function addIMDBRating(imdbRating, name, year) {
    var divId = getDivId(name, year);

    if (document.querySelector("#" + divId) !== null && $("#" + divId).is(":visible")) {
        return;
    }

    $('.jawBone .synopsis').last().before(
        '<div class="imdbRating" id="' + divId + '">' + 'IMDb rating : ' + ((imdbRating && imdbRating != 'undefined') ? imdbRating : "N/A"));
}

function addRottenRating(rottenRating, name, year) {
    var divId = `rotten${getDivId(name, year)}`;

    if (document.querySelector("#" + divId) !== null && $("#" + divId).is(":visible")) {
        return;
    }

    $('.jawBone .synopsis').last().before(
        '<div class="rottenRating" id="' + divId + '">' + 'Rotten Tomatoes rating : ' + ((rottenRating && rottenRating != 'undefined') ? rottenRating : "N/A"));
}

function getDivId(name, year) {
    name = name.replace(/[^a-z0-9\s]/gi, '');
    name = name.replace(/ /g, '');
    return "aaa" + name + "_" + year;
}

function makeRequestAndAddRating(name, year) {
    var url = "https://www.omdbapi.com/?apikey=<secret_key>&t=" + encodeURI(name) + "&y=" + year + "tomatoes=true";
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        xhrFields: {
            withCredentials: true
        },
        dataType: 'json',
        async: false,
        success: function(apiResponse) {
            var imdbRating = apiResponse["imdbRating"];
            var rottenRating = extractRottenTomatoesRating(apiResponse["Ratings"]);
            window.sessionStorage.setItem(name + ":" + year, imdbRating);
            window.sessionStorage.setItem("rotten:" + name + ":" + year, rottenRating);
            addIMDBRating(imdbRating, name, year);
            addRottenRating(rottenRating, name, year);
        },
        error: function(data) {}
    });
};

function extractRottenTomatoesRating(ratings) {
    const rottenRating = ratings.filter(rating => rating.Source === "Rotten Tomatoes")
    return rottenRating[0] ? rottenRating[0].Value : undefined
};

$(document).ready(function(event) {
    if (window.sessionStorage === "undefined")
        return;

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
});

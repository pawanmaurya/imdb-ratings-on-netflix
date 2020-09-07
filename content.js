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
        //if imdbRating is fetched, rotten/metaScore is fetched too
        var rottenRating = window.sessionStorage.getItem("rotten" + ":" + title + ":" + year);
        addRottenRating(rottenRating, title, year);

        var metaScore = window.sessionStorage.getItem("metaScore" + ":" + title + ":" + year);
        addMetaScore(metaScore, title, year);
    } else {
        makeRequestAndAddRating(title, year)
    }
};

function addIMDBRating(imdbMetaData, name, year) {
    var divId = getDivId(name, year);

    var divEl = document.getElementById(divId);
    if (divEl && (divEl.offsetWidth || divEl.offsetHeight || divEl.getClientRects().length)) {
        return;
    }

    var synopsises = document.querySelectorAll('.jawBone .synopsis');
    if (synopsises.length) {
        var synopsis = synopsises[synopsises.length - 1];
        var div = document.createElement('div');

        var imdbRatingPresent = imdbMetaData && (imdbMetaData !== 'undefined') && (imdbMetaData !== "N/A");
        var imdbVoteCount = null;
        var imdbRating = null;
        var imdbId = null;
        if (imdbRatingPresent) {
            var imdbMetaDataArr = imdbMetaData.split(":");
            imdbRating = imdbMetaDataArr[0];
            imdbVoteCount = imdbMetaDataArr[1];
            imdbId = imdbMetaDataArr[2];
        }
        var imdbHtml = 'IMDb rating : ' + (imdbRatingPresent ? imdbRating : "N/A") + (imdbVoteCount ? ", Vote Count : " + imdbVoteCount : "");

        if (imdbId !== null) {
            imdbHtml = "<a target='_blank' href='https://www.imdb.com/title/" + imdbId + "'>" + imdbHtml + "</a>";
        }

        div.innerHTML = imdbHtml;
        div.className = 'imdbRating';
        div.id = divId;
        synopsis.parentNode.insertBefore(div, synopsis);
    }
}

function addRottenRating(rottenRating, name, year) {
    if (rottenRating === "undefined" || rottenRating === "N/A")
        return;

    var divId = 'rotten' + getDivId(name, year);
    var divEl = document.getElementById(divId);
    if (divEl && (divEl.offsetWidth || divEl.offsetHeight || divEl.getClientRects().length)) {
        return;
    }

    var synopsises = document.querySelectorAll('.jawBone .synopsis');
    if (synopsises.length) {
        var synopsis = synopsises[synopsises.length - 1];
        var div = document.createElement('div');
        div.innerHTML = 'Rotten Tomatoes rating : ' + rottenRating;
        div.className = 'rottenRating';
        div.id = divId;
        synopsis.parentNode.insertBefore(div, synopsis);
    }
}

function addMetaScore(metaScore, name, year) {
    if (metaScore === "undefined" || metaScore === "N/A")
        return;

    var divId = 'metaScore' + getDivId(name, year);
    var divEl = document.getElementById(divId);
    if (divEl && (divEl.offsetWidth || divEl.offsetHeight || divEl.getClientRects().length)) {
        return;
    }

    var synopsises = document.querySelectorAll('.jawBone .synopsis');
    if (synopsises.length) {
        var synopsis = synopsises[synopsises.length - 1];
        var div = document.createElement('div');
        div.innerHTML = 'MetaCritic score : ' + metaScore;
        div.className = 'metaScore';
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

    var url = "https://www.omdbapi.com/?apikey=<secret_key>&t=" + encodeURI(name)
        + "&y=" + year + "tomatoes=true";

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function () {
        if (xhr.status === 200) {
            var apiResponse = JSON.parse(xhr.responseText);
            var imdbRating = apiResponse["imdbRating"];
            var imdbVoteCount = apiResponse["imdbVotes"];
            var imdbId = apiResponse["imdbID"];
            var rottenRating = extractRottenTomatoesRating(apiResponse["Ratings"]);
            var metaScore = apiResponse["Metascore"];
            var imdbMetaData = imdbRating + ":" + imdbVoteCount + ":" + imdbId;
            window.sessionStorage.setItem(name + ":" + year, imdbMetaData);
            window.sessionStorage.setItem("metaScore:" + name + ":" + year, metaScore)
            window.sessionStorage.setItem("rotten:" + name + ":" + year, rottenRating);
            addIMDBRating(imdbMetaData, name, year);
            addRottenRating(rottenRating, name, year);
            addMetaScore(metaScore, name, year);
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
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
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

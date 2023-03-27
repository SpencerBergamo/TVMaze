const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing";

async function searchShows(query) {
    // make an ajax request to the searchShows api.  Remove
    // hard coded data.
    let response = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);

    let shows = response.data.map(result => {
        let show = result.show;
        return {
            id: show.id,
            name: show.name,
            summary: show.summary,
            image: show.image ? show.image.medium : MISSING_IMAGE_URL,
        };
    });

    return shows;
}

// given a list of shows, add shows to DOM
// class="col-md-6 col-lg-3

async function populateShows(shows) {
    const $showsList = $("#shows-list");
    $showsList.empty();

    for (let show of shows) {
        let $item = $(
            `<div class="Show" data-show-id="${show.id}">
                <div class="card" data-show-id="${show.id}">
                    <img class="card-img-top" src="${show.image}">
                    <div class="card-body">
                        <h5 class="card-title">${show.name}</h5>
                        <p class="card-text">${show.summary}</p>
                        <button class="btn btn-primary">Episodes</button>
                    </div>
                </div>
            </div>
        `)
        $showsList.append($item);
    }
}

// handle search form submission
$("#search-form").on("submit", async function handleSearch(e) {
    console.log("searching")
    e.preventDefault();

    // get query string from input
    let query = $("#search-query").val();
    if (!query) return;

    // empty out shows list
    $("#episodes-area").hide();

    // get list of shows and add shows to DOM
    let shows = await searchShows(query);

    populateShows(shows);
});

// given a show ID, return list of episodes
async function getEpisodes(id) {
    // make an ajax request to the getEpisodes api
    let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

    // return array-of-episode-info, as described in docstring above
    let episodes = response.data.map(result => {
        let episode = result;
        return {
            id: episode.id,
            name: episode.name,
            season: episode.season,
            number: episode.number,
            image: episode.image ? episode.image.medium : MISSING_IMAGE_URL,
        };
    });

    return episodes;
}

// given list of episodes, populate DOM
async function populateEpisodes(episodes) {
    const $episodesList = $("#episodes-list");
    $episodesList.empty();

    for (let episode of episodes) {
        let $item = $(
            `<li>
                ${episode.name}
                (season ${episode.season}, number ${episode.number})
            </li>
        `);
        $episodesList.append($item);
    }

    $("#episodes-area").show();
}

// handle episode button click
$("#shows-list").on("click", "button", async function handleEpisodeClick(e) {
    console.log("getting episodes");
    let showId = $(e.target).closest(".Show").data("show-id");
    let episodes = await getEpisodes(showId);
    populateEpisodes(episodes);
});
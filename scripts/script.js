const modal = document.getElementById("zoomModal");
const pokemonContainer = document.getElementById('listPokemon');
let pokemonsData = []; 
let currentOffset = 0;
const limit = 20;
let isLoading = false;

async function renderPokemon(loadMore = false) {
    if (isLoading) return;
    isLoading = true;
    toggleLoadingState(true);

    if (!pokemonContainer) return handleContainerError();

    const URL = buildPokemonListUrl(limit, currentOffset);
    
    try {
        const dataList = await fetchData(URL);
        await processAndDisplayPokemons(dataList.results, loadMore);
        currentOffset += limit;
    } catch(error) {
        handleFetchError(error);
    } finally {
        finalizeLoadingState();
    }
}

async function searchPokemon() {
    const input = document.getElementById('searchInput');
    const value = input.value.toLowerCase().trim();
    if (value.length < 3) return showSearchWarning();

    prepareForSearch();

    const filteredPokemons = pokemonsData.filter(pokemon => 
        pokemon.name.toLowerCase().includes(value)
    );
    
    if (filteredPokemons.length > 0) {
        displayFilteredResult(filteredPokemons);
        showSearchSuccess(filteredPokemons.length);
        showShowAllButton();
        finalizeLoadingState();
        return;
    }

    const URL = buildPokemonDetailsUrl(value);
    
    try {
        const data = await fetchData(URL);
        displayFilteredResult([data]);
        showSearchSuccess(1);
        showShowAllButton();

    } catch (error) {
        handleSearchError(error, value);
    } finally {
        finalizeLoadingState();
    }
}

function resetSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    pokemonContainer.innerHTML = '';
    
    pokemonsData.forEach((pokemon, index) => {
        const cardHTML = createPokemonCardHTML(pokemon, typeColorsIcons);
        appendPokemonCard(cardHTML, pokemon, index);
    });
    
    showLoadMoreButton();
    hideShowAllButton(); 
}

function showShowAllButton() {
    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) {
        showAllBtn.style.display = 'inline-block';
    }
}

function hideShowAllButton() {
    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) {
        showAllBtn.style.display = 'none';
    }
}

async function processAndDisplayPokemons(pokemons, loadMore) {
    if (!loadMore) {
        pokemonContainer.innerHTML = '';
        pokemonsData = [];
    }

    for (const p of pokemons) {
        const details = await fetchPokemonDetails(p.url);
        pokemonsData.push(details);
        const cardHTML = createPokemonCardHTML(details, typeColorsIcons);
        appendPokemonCard(cardHTML, details, pokemonsData.length - 1);
    }
}

function appendPokemonCard(htmlContent, details, index) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card-container');
    const mainType = details.types[0].type.name;
    cardDiv.style.backgroundColor = typeColorsIcons[mainType];
    cardDiv.innerHTML = htmlContent;
    
    cardDiv.addEventListener('click', () => {
        openContainer(index);
    });

    pokemonContainer.appendChild(cardDiv);
}

function displayFilteredResult(filteredList) {
    pokemonContainer.innerHTML = '';
    filteredList.forEach((pokemon) => {
        const cardHTML = createPokemonCardHTML(pokemon, typeColorsIcons);
        let originalIndex = pokemonsData.findIndex(p => p.id === pokemon.id);
        if (originalIndex === -1) {
            pokemonsData.push(pokemon);
            originalIndex = pokemonsData.length - 1;
        }        appendPokemonCard(cardHTML, pokemon, originalIndex !== -1 ? originalIndex : 0);
    });
}

async function fetchData(URL) {
    const response = await fetch(URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

async function fetchPokemonDetails(url) {
    return fetchData(url);
}

function toggleLoadingState(state) {
    const loadButton = document.getElementById('loadMoreBtn');
    const loader = document.getElementById('loader');
    if (loadButton) loadButton.disabled = state;
    if (loader) loader.style.display = state ? 'block' : 'none';
}

function finalizeLoadingState() {
    isLoading = false;
    toggleLoadingState(false);
}

function enableSearchButton() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    if (!searchBtn || !searchInput) return;
    
    if (searchInput.value.trim().length >= 3) {
        searchBtn.disabled = false;
        searchBtn.style.opacity = '1';
        searchBtn.style.cursor = 'pointer';
    } else {
        searchBtn.disabled = true;
        searchBtn.style.opacity = '0.5';
        searchBtn.style.cursor = 'not-allowed';
    }
}

function buildPokemonListUrl(limit, offset) {
    return `https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`;
}

function buildPokemonDetailsUrl(value) {
    return `https://pokeapi.co/api/v2/pokemon/${value}`;
}

function handleContainerError() {
    console.error("The wished pokemon was not found!");
    isLoading = false;
}

function handleFetchError(error) {
    console.error("ERROR", error);
}

function showSearchWarning() {
    pokemonContainer.innerHTML = `
        <div class="no-results">
            <p>⚠️ Please enter at least 3 characters to search</p>
        </div>
    `;
}

function prepareForSearch() {
    toggleLoadingState(true);
    const loadButton = document.getElementById('loadMoreBtn');
    if (loadButton) loadButton.style.display = 'none';
    hideShowAllButton();
}

function showSearchSuccess(count) {
}

function handleSearchError(error, value) {
    console.error("ERROR", error);
    displayNoResults(value);
}

function displayNoResults(searchValue) {
    pokemonContainer.innerHTML = `
        <div class="no-results">
            <p>No Pokémon found matching "${searchValue}"</p>
        </div>
    `;
    showShowAllButton();
}

function showLoadMoreButton() {
    const loadButton = document.getElementById('loadMoreBtn');
    if (loadButton) loadButton.style.display = 'block';
}

renderPokemon();

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', (event) => {
        enableSearchButton();
        if (event.key === 'Enter' && searchInput.value.trim().length >= 3) {
            searchPokemon();
        }
    });
}

const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        renderPokemon(true);
    });
}

window.onclick = function(event) {
    if (event.target === modal) { 
        closeZoomContainer(); 
    }
}
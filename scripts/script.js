const modal = document.getElementById("zoomModal");
const pokemonContainer = document.getElementById('listPokemon');
let pokemonsData = []; 
let currentOffset = 0;
const limit = 20;
let isLoading = false;
let isSearchActive = false;
let filteredSearchResults = [];

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
    if (value.length < 3) {
        showSearchWarning();
        return;
    }
    
    prepareForSearch();
    const filteredPokemons = filterPokemonsByName(value);
    if (filteredPokemons.length > 0) return handleLocalSearchResults(filteredPokemons);
    await searchPokemonFromAPI(value);
}

function filterPokemonsByName(value) {
    return pokemonsData.filter(pokemon => 
        pokemon.name.toLowerCase().includes(value)
    );
}

function handleLocalSearchResults(filteredPokemons) {
    isSearchActive = true;
    filteredSearchResults = filteredPokemons;
    displayFilteredResult(filteredPokemons);
    showShowAllButton();
    hideLoadMoreButton();
    finalizeLoadingState();
}

async function searchPokemonFromAPI(value) {
    const URL = buildPokemonDetailsUrl(value);
    try {
        const data = await fetchData(URL);
        isSearchActive = true;
        filteredSearchResults = [data];
        displayFilteredResult([data]);
        showShowAllButton();
        hideLoadMoreButton();
    } catch (error) {
        handleSearchError(error, value);
    } finally {
        finalizeLoadingState();
    }
}

function resetSearch() {
    clearSearchInput();
    pokemonContainer.innerHTML = '';
    isSearchActive = false;
    filteredSearchResults = [];
    displayAllPokemons();
    showLoadMoreButton();
    hideShowAllButton(); 
}

function clearSearchInput() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
}

function displayAllPokemons() {
    pokemonsData.forEach((pokemon, index) => {
        const cardHTML = createPokemonCardHTML(pokemon, typeColorsIcons);
        appendPokemonCard(cardHTML, pokemon, index);
    });
}

function showShowAllButton() {
    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) showAllBtn.style.display = 'inline-block';
}

function hideShowAllButton() {
    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) showAllBtn.style.display = 'none';
}

async function processAndDisplayPokemons(pokemons, loadMore) {
    if (!loadMore) clearPokemonData();
    for (const p of pokemons) {
        const details = await fetchData(p.url);
        addPokemonToData(details);
    }
}

function clearPokemonData() {
    pokemonContainer.innerHTML = '';
    pokemonsData = [];
}

function addPokemonToData(details) {
    pokemonsData.push(details);
    const cardHTML = createPokemonCardHTML(details, typeColorsIcons);
    appendPokemonCard(cardHTML, details, pokemonsData.length - 1);
}

function appendPokemonCard(htmlContent, details, index) {
    const cardDiv = createCardElement(details);
    cardDiv.innerHTML = htmlContent;
    cardDiv.addEventListener('click', () => openContainer(index));
    pokemonContainer.appendChild(cardDiv);
}

function displayFilteredResult(filteredList) {
    pokemonContainer.innerHTML = '';
    filteredList.forEach((pokemon, index) => {
        const cardHTML = createPokemonCardHTML(pokemon, typeColorsIcons);
        appendPokemonCard(cardHTML, pokemon, index);
    });
}

async function fetchData(URL) {
    const response = await fetch(URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
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



function prepareForSearch() {
    toggleLoadingState(true);
    const loadButton = document.getElementById('loadMoreBtn');
    if (loadButton) loadButton.style.display = 'none';
    hideShowAllButton();
}

function handleSearchError(error, value) {
    console.error("ERROR", error);
    displayNoResults(value);
}



function showLoadMoreButton() {
    const loadButton = document.getElementById('loadMoreBtn');
    if (loadButton) loadButton.style.display = 'block';
}

function hideLoadMoreButton() {
    const loadButton = document.getElementById('loadMoreBtn');
    if (loadButton) loadButton.style.display = 'none';
}

function closeZoomContainer() {
    document.body.style.overflow = 'auto';
    const modal = document.getElementById('zoomModal');
    if (modal) modal.style.display = 'none';
}

function switchTab(event, tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

renderPokemon();

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', (event) => {
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
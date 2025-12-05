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
    if (filteredPokemons.length > 0) {
        handleLocalSearchResults(filteredPokemons);
    } else {
        handleSearchError(value);
        finalizeLoadingState();
    }
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

function createCardElement(details) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card-container');
    const mainType = details.types[0].type.name;
    cardDiv.style.backgroundColor = typeColorsIcons[mainType];
    return cardDiv;
}

function appendPokemonCard(htmlContent, details, index) {
    const cardDiv = createCardElement(details);
    cardDiv.innerHTML = htmlContent;
    cardDiv.addEventListener('click', () => openContainer(index));
    pokemonContainer.appendChild(cardDiv);
}

function showSearchWarning() {
    const pokemonContainer = document.getElementById('listPokemon');
    pokemonContainer.innerHTML = ''; 
    pokemonContainer.innerHTML = `
        <div class="no-results">
            <p>⚠️ Please enter at least 3 characters to search</p>
        </div>
    `;
    hideLoadMoreButton();
    showShowAllButton();
}

function displayNoResults(searchValue) {
    const pokemonContainer = document.getElementById('listPokemon');
    pokemonContainer.innerHTML = `
        <div class="no-results">
            <p>No Pokémon found matching "${searchValue}"</p>
        </div>
    `;
    showShowAllButton();
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

function prepareForSearch() {
    toggleLoadingState(true);
    const loadButton = document.getElementById('loadMoreBtn');
    if (loadButton) loadButton.style.display = 'none';
    hideShowAllButton();
}

function handleSearchError( value) {
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

async function fetchEvolutionHTML(pokemonDetails) {
    try {
        const speciesData = await (await fetch(pokemonDetails.species.url)).json();
        const evolutionData = await (await fetch(speciesData.evolution_chain.url)).json();
        return await getEvolutionChainHTML(evolutionData.chain);
    } catch (error) {
        return '<p style="text-align: center; color: #999; padding: 40px;">Evolution data unavailable</p>';
    }
}

function generateStatsHTML(stats) {
    let statsHtml = '';
    for (const statInfo of stats) {
        const statName = statInfo.stat.name.replace("-", ". ").toUpperCase();
        const statValue = statInfo.base_stat;
        const percentage = (statValue / 255) * 100;
        const barColor = statValue < 50 ? "#FF5959" : "#2ECC71";
        statsHtml += `<div class="stat-row"><span class="stat-name">${statName}</span><span class="stat-value">${statValue}</span><div class="stat-bar-container"><div class="stat-bar-fill" style="width: ${percentage}%; background-color: ${barColor};"></div></div></div>`;
    }
    return statsHtml;
}

function generateMovesHTML(moves) {
    return moves.slice(0, 8).map(moveInfo => {
        return `<div class="move-item">${moveInfo.move.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>`;
    }).join('');
}

function displayModal(htmlContent) {
    modal.innerHTML = htmlContent;
    document.body.style.overflow = 'hidden';
    modal.style.display = "flex";
}

async function openContainer(i) {
    const currentList = isSearchActive ? filteredSearchResults : pokemonsData;
    const pokemonDetails = currentList[i];
    const evolutionHtml = await fetchEvolutionHTML(pokemonDetails);
    const statsHtml = generateStatsHTML(pokemonDetails.stats);
    const movesHtml = generateMovesHTML(pokemonDetails.moves);
    const abilitiesHtml = formatAbilities(pokemonDetails.abilities);
    const formattedId = `#${String(pokemonDetails.id).padStart(3, "0")}`;
    const primaryType = pokemonDetails.types[0].type.name;
    const bgColor = typeColorsIcons[primaryType] || "#A8A878";
    const modalHTML = `<div class="details-panel" style="background: linear-gradient(to bottom, ${bgColor} 0%, ${bgColor} 40%, white 40%);"><div class="modal-header"><span class="back-button" onclick="closeZoomContainer()">✕</span></div>${i > 0 ? `<button class="nav-arrow nav-left" onclick="openContainer(${i - 1})">‹</button>` : ''}${i < currentList.length - 1 ? `<button class="nav-arrow nav-right" onclick="openContainer(${i + 1})">›</button>` : ''}<div class="modal-title"><h1>${pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1)}</h1><span class="modal-id">${formattedId}</span></div><div class="modal-types-top">${pokemonDetails.types.map(typeInfo => `<span class="type-pill">${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}</span>`).join('')}</div><div class="modal-image-large"><img src="${pokemonDetails.sprites.other['official-artwork'].front_default || pokemonDetails.sprites.front_default}" alt="${pokemonDetails.name}"></div><div class="modal-tabs"><button class="tab-button active" onclick="switchTab(event, 'about')">About</button><button class="tab-button" onclick="switchTab(event, 'stats')">Stats</button><button class="tab-button" onclick="switchTab(event, 'evolution')">Evolution</button><button class="tab-button" onclick="switchTab(event, 'moves')">Moves</button></div><div id="about" class="tab-content active"><div class="info-row"><span class="info-label">Species</span><span class="info-value">${pokemonDetails.species.name.charAt(0).toUpperCase() + pokemonDetails.species.name.slice(1)}</span></div><div class="info-row"><span class="info-label">Height</span><span class="info-value">${(pokemonDetails.height / 10).toFixed(1)} m</span></div><div class="info-row"><span class="info-label">Weight</span><span class="info-value">${(pokemonDetails.weight / 10).toFixed(1)} kg</span></div><div class="info-row"><span class="info-label">Abilities</span><span class="info-value">${abilitiesHtml}</span></div></div><div id="stats" class="tab-content">${statsHtml}</div><div id="evolution" class="tab-content">${evolutionHtml}</div><div id="moves" class="tab-content"><div class="moves-grid">${movesHtml}</div></div></div>`;
    displayModal(modalHTML);
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
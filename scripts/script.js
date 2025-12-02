const modal = document.getElementById("zoomModal");
const pokemonContainer = document.getElementById('listPokemon');
let pokemonsData = []; 
let currentOffset = 0;
const LIMIT = 20;
let isLoading = false;

async function renderPokemon(loadMore = false) {
    if (isLoading) return;
    isLoading = true;
    
    const loadButton = document.getElementById('loadMoreBtn');
    const loader = document.getElementById('loader');
    
    if (loadButton) loadButton.disabled = true;
    if (loader) loader.style.display = 'block';

    const URL = `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${currentOffset}`;
    
    if (!pokemonContainer) {
        console.error("The wished pokemon was not found!");
        return;
    }
    
    try {
        const responseList = await fetch(URL);
        const dataList = await responseList.json();
        const pokemons = dataList.results; 
          
        if (!loadMore) {
            pokemonContainer.innerHTML = '';
            pokemonsData = [];
        }

        for (let i = 0; i < pokemons.length; i++) { 
            const responseDetails = await fetch(pokemons[i].url);
            const dataDetails = await responseDetails.json(); 
            pokemonsData.push(dataDetails); 
            
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card-container');
            const mainType = dataDetails.types[0].type.name;  
            const mainColor = typeColorsIcons[mainType]; 
            cardDiv.style.backgroundColor = mainColor; 
            cardDiv.innerHTML = createPokemonCardHTML(dataDetails, typeColorsIcons);
         
            const currentIndex = pokemonsData.length - 1;
            cardDiv.addEventListener('click', () => {
                openContainer(currentIndex);
            });

            pokemonContainer.appendChild(cardDiv);
        }
     
        currentOffset += LIMIT;
        
    } catch(error) {
        console.error("ERROR", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to load Pokémon. Please try again.',
            confirmButtonColor: '#e74c3c'
        });
    } finally {
        isLoading = false;
        if (loadButton) loadButton.disabled = false;
        if (loader) loader.style.display = 'none';
    }
}

function searchPokemon() {
    const searchInput = document.getElementById('searchInput');
    const searchValue = searchInput.value.toLowerCase().trim();
    const loadButton = document.getElementById('loadMoreBtn');
    const loader = document.getElementById('loader');
    
    if (searchValue.length < 3) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter at least 3 characters to search!',
            confirmButtonColor: '#667eea'
        });
        return;
    }
    
    const filteredPokemon = pokemonsData.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchValue) || 
        pokemon.id.toString().includes(searchValue)
    );
    
    if (filteredPokemon.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Results',
            text: `No Pokémon found matching "${searchValue}"`,
            confirmButtonColor: '#667eea'
        });
        pokemonContainer.innerHTML = `
            <div class="no-results">
                <p>No Pokémon found matching "${searchValue}"</p>
                <button onclick="resetSearch()" class="showall">Show All</button>
            </div>
        `;
        if (loadButton) loadButton.style.display = 'none';
        if (loader) loader.style.display = 'none';
        return;
    }
    
    pokemonContainer.innerHTML = '';
    
    filteredPokemon.forEach((pokemon) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card-container');
        const mainType = pokemon.types[0].type.name;
        const mainColor = typeColorsIcons[mainType];
        cardDiv.style.backgroundColor = mainColor;
        cardDiv.innerHTML = createPokemonCardHTML(pokemon, typeColorsIcons);
        
        const originalIndex = pokemonsData.findIndex(p => p.id === pokemon.id);
        cardDiv.addEventListener('click', () => {
            openContainer(originalIndex);
        });
        
        pokemonContainer.appendChild(cardDiv);
    });

    if (loadButton) loadButton.style.display = 'none';
    if (loader) loader.style.display = 'none';

    Swal.fire({
        icon: 'success',
        title: `${filteredPokemon.length} Pokémon found!`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
    });
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

function resetSearch() {
    const searchInput = document.getElementById('searchInput');
    const loadButton = document.getElementById('loadMoreBtn');
    const loader = document.getElementById('loader');
    
    if (searchInput) searchInput.value = '';
    
    pokemonContainer.innerHTML = '';
    
    pokemonsData.forEach((pokemon, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card-container');
        const mainType = pokemon.types[0].type.name;
        const mainColor = typeColorsIcons[mainType];
        cardDiv.style.backgroundColor = mainColor;
        cardDiv.innerHTML = createPokemonCardHTML(pokemon, typeColorsIcons);
        
        cardDiv.addEventListener('click', () => {
            openContainer(index);
        });
        
        pokemonContainer.appendChild(cardDiv);
    });
    
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

window.onclick = function(event) {
    if (event.target === modal) { 
        closeZoomContainer();
    }
}
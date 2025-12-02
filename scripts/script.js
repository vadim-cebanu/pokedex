const modal = document.getElementById("zoomModal");
const pokemonContainer = document.getElementById('listPokemon');
let pokemonsData = []; 
 
async function renderPokemon() {
    const URL= 'https://pokeapi.co/api/v2/pokemon?limit=40'; 
    if (!pokemonContainer) {
        console.error("The wished pokemon was not found!");
        return;
    }
    try {
        const responseList = await fetch(URL);
        const dataList = await responseList.json();
        const pokemons = dataList.results; 
        pokemonContainer.innerHTML = ''; 
        pokemonsData = []; 

        for (let i = 0; i < pokemons.length; i++) { 
            const responseDetails = await fetch(pokemons[i].url);
            const dataDetails = await responseDetails.json(); 
            pokemonsData.push(dataDetails); 
            
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card-container');
            const mainType = dataDetails.types[0].type.name;  
            const mainColor = typeColorsIcons[mainType] || typeColorsIcons['default']; 
            cardDiv.style.backgroundColor = mainColor; 
            cardDiv.innerHTML = createPokemonCardHTML(dataDetails, typeColorsIcons);
         
            cardDiv.addEventListener('click', () => {
                openContainer(i); 
            });

            pokemonContainer.appendChild(cardDiv);
        }
    } catch(error) {
        console.error("ERROR", error);
    }
}

renderPokemon();

window.onclick = function(event) {
    if (event.target === modal) { 
        closeZoomContainer();
    }
}
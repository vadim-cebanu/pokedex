async function renderPokemon() {
    const URL= 'https://pokeapi.co/api/v2/pokemon';
    const pokemonContainer = document.getElementById('listPokemon');
    
    if (!pokemonContainer) {
        console.error("The wished pokemon was not found!");
        return;
    }
  try {
        const responseList = await fetch(URL);
        const dataList = await responseList.json();
        const pokemons = dataList.results; 
        pokemonContainer.innerHTML = ''; 

        for (const pokemonItem of pokemons) {
            const responseDetails = await fetch(pokemonItem.url);
            const dataDetails = await responseDetails.json(); 
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card-container');
            const mainType = dataDetails.types[0].type.name;  
            const mainColor = typeColorsIcons[mainType];
            cardDiv.style.backgroundColor = mainColor; 
            cardDiv.innerHTML = createPokemonCardHTML(dataDetails, typeColorsIcons);
            pokemonContainer.appendChild(cardDiv);
        }
    } catch(error) {
        console.error("ERROR", error);
    }
}
renderPokemon();
async function renderPokemon() {
    const URL= 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=40';
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

            const formattedId = `#${String(dataDetails.id).padStart(3, '0')}`;

            cardDiv.innerHTML = `
             <div class="pokemon">
                    <div class="pokemon-image">
                        <img src="${dataDetails.sprites.other.home.front_default}" alt="${dataDetails.name}">
                    </div>
                    <div class="pokemon-info">
                        <div class="pokemon-number">
                            <p class="pokemon-id">${formattedId}</p>
                            <h2 class="pokemon-name">${dataDetails.name.toUpperCase()}</h2>
                        </div>
                        <div class="pokemon-type">
                             ${dataDetails.types.map(typeInfo => 
                                `<p class="${typeInfo.type.name} type">${typeInfo.type.name.toUpperCase()}</p>`
                             ).join('')}
                        </div>
                        <div class="pokemon-status">
                            <p class="height">${dataDetails.height / 10} m</p>
                            <p class="weight">${dataDetails.weight / 10} kg</p>
                        </div>
                    </div>
                    
                </div> 
            `;
            
            pokemonContainer.appendChild(cardDiv);
        }

    } catch(error) {
        console.error("ERROR", error);
        pokemonContainer.innerHTML = '<p>Error to loading pokemons.</p>';
    }
}
    
renderPokemon();

function formatAbilities(abilitiesArray) {
    const formattedAbilities = abilitiesArray.map(abilityInfo => {
        const abilityName = abilityInfo.ability.name;
        
        return abilityName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
            .join(' '); 
    });
    return formattedAbilities.join(', ');
}

function createPokemonCardHTML(dataDetails, typeColorsIcons) {
        const plainId = String(dataDetails.id).padStart(3, "0");

    let typesHtml = '';
    for (const typeInfo of dataDetails.types) {
        const typeName = typeInfo.type.name;
        const typeColor = typeColorsIcons[typeName];
        typesHtml += `<p class="${typeName} type"
                         style="background-color: ${typeColor};">
                         ${typeName.toUpperCase()}
                     </p>`;
    }

    return `
        <div class="pokemon">
                    <div class="pokemon-watermark-card">${plainId}</div>
            <div class="pokemon-image">
                <img src="${dataDetails.sprites.other.home.front_default}" alt="${dataDetails.name}">
            </div>
            <div class="pokemon-info">
                <div>
                    <h2 class="pokemon-name">${dataDetails.name.toUpperCase()}</h2>
                </div>
                <div class="pokemon-type">
                     ${typesHtml}
                </div>
                <div class="pokemon-status">
                    <p class="height">${dataDetails.height / 10} m</p>
                    <p class="weight">${dataDetails.weight / 10} kg</p>
                </div>
            </div>
        </div> 
    `;
}

async function getEvolutionChainHTML(chain) {
    let evolutionHTML = '<div class="evolution-chain">';
    let current = chain;
    
    while (current) {
        const pokemonId = current.species.url.split('/').filter(Boolean).pop();
        const pokemonData = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)).json();
        
        evolutionHTML += `
            <div class="evolution-item">
                <img src="${pokemonData.sprites.other['official-artwork'].front_default}" 
                     alt="${current.species.name}">
                <p>${current.species.name.charAt(0).toUpperCase() + current.species.name.slice(1)}</p>
            </div>`;
        
        if (current.evolves_to.length > 0) {
            evolutionHTML += '<div class="evolution-arrow">→</div>';
            current = current.evolves_to[0];
        } else {
            current = null;
        }
    }
    
    evolutionHTML += '</div>';
    return evolutionHTML;
}
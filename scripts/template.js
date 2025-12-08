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

    const typesHtml = dataDetails.types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        const typeColor = typeColorsIcons[typeName];
        return `<p class="${typeName} type"
                   style="background-color: ${typeColor};">
                   ${typeName.toUpperCase()}
               </p>`;
    }).join('');

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
    const evolutionItems = await buildEvolutionItems(chain);
    return `<div class="evolution-chain">${evolutionItems}</div>`;
}

async function buildEvolutionItems(current) {
    if (!current) return '';
    
    const pokemonId = current.species.url.split('/').filter(Boolean).pop();
    const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then(r => r.json());
    
    const itemHTML = `
        <div class="evolution-item">
            <img src="${pokemonData.sprites.other['official-artwork'].front_default}" 
                 alt="${current.species.name}">
            <p>${current.species.name.charAt(0).toUpperCase() + current.species.name.slice(1)}</p>
        </div>`;
    
    if (current.evolves_to.length > 0) {
        const nextHTML = await buildEvolutionItems(current.evolves_to[0]);
        return itemHTML + '<div class="evolution-arrow">→</div>' + nextHTML;
    }
    
    return itemHTML;
}

function createModalHTML(pokemonDetails, currentIndex, totalCount, evolutionHtml, statsHtml, movesHtml, abilitiesHtml, bgColor) {
    const formattedId = `#${String(pokemonDetails.id).padStart(3, "0")}`;
    const capitalizedName = pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1);
    
    return `<div class="details-panel" style="background: linear-gradient(to bottom, ${bgColor} 0%, ${bgColor} 40%, white 40%);">
                    <div class="modal-header">
                        <span class="back-button close-modal-btn">✕</span>
                    </div>
                    ${currentIndex > 0 ? `<button class="nav-arrow nav-left" data-index="${currentIndex - 1}">‹</button>` : ''}
                    ${currentIndex < totalCount - 1 ? `<button class="nav-arrow nav-right" data-index="${currentIndex + 1}">›</button>` : ''}
                    <div class="modal-title">
                        <h1>${capitalizedName}</h1>
                        <span class="modal-id">${formattedId}</span>
                    </div>
                    <div class="modal-types-top">
                        ${pokemonDetails.types.map(typeInfo => 
                            `<span class="type-pill">${typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1)}</span>`
                        ).join('')}
                    </div>
                    <div class="modal-image-large">
                        <img src="${pokemonDetails.sprites.other['official-artwork'].front_default || pokemonDetails.sprites.front_default}" alt="${pokemonDetails.name}">
                    </div>
                    <div class="modal-tabs">
                        <button class="tab-button active" data-tab="about">About</button>
                        <button class="tab-button" data-tab="stats">Stats</button>
                        <button class="tab-button" data-tab="evolution">Evolution</button>
                        <button class="tab-button" data-tab="moves">Moves</button>
                    </div>
                    <div id="about" class="tab-content active">
                        <div class="info-row">
                            <span class="info-label">Species</span>
                            <span class="info-value">${pokemonDetails.species.name.charAt(0).toUpperCase() + pokemonDetails.species.name.slice(1)}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Height</span>
                            <span class="info-value">${(pokemonDetails.height / 10).toFixed(1)} m</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Weight</span>
                            <span class="info-value">${(pokemonDetails.weight / 10).toFixed(1)} kg</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Abilities</span>
                            <span class="info-value">${abilitiesHtml}</span>
                        </div>
                    </div>
                    <div id="stats" class="tab-content">${statsHtml}</div>
                    <div id="evolution" class="tab-content">${evolutionHtml}</div>
                    <div id="moves" class="tab-content">
                        <div class="moves-grid">${movesHtml}</div>
                    </div>
                </div>`;
}
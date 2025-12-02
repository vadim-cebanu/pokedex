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
    const formattedId = `#${String(dataDetails.id).padStart(3, "0")}`;
    
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
            <div class="pokemon-image">
                <img src="${dataDetails.sprites.other.home.front_default}" alt="${dataDetails.name}">
            </div>
            <div class="pokemon-info">
                <div class="pokemon-number">
                    <p class="pokemon-id">${formattedId}</p>
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

async function openContainer(i) {
    document.body.style.overflow = 'hidden';
    const pokemonDetails = pokemonsData[i];
    const formattedId = `#${String(pokemonDetails.id).padStart(3, "0")}`;
    const primaryType = pokemonDetails.types[0].type.name;
    const bgColor = typeColorsIcons[primaryType] || "#A8A878";

    let evolutionHtml = '<p style="text-align: center; color: #999; padding: 40px;">Loading evolution...</p>';
    try {
        const speciesResponse = await fetch(pokemonDetails.species.url);
        const speciesData = await speciesResponse.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        
        evolutionHtml = await getEvolutionChainHTML(evolutionData.chain);
    } catch (error) {
        evolutionHtml = '<p style="text-align: center; color: #999; padding: 40px;">Evolution data unavailable</p>';
    }

    const movesHtml = pokemonDetails.moves.slice(0, 20).map(moveInfo => {
        return `<div class="move-item">${moveInfo.move.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</div>`;
    }).join('');

    const abilitiesHtml = formatAbilities(pokemonDetails.abilities);

    let statsHtml = '';
    for (const statInfo of pokemonDetails.stats) {
        const statName = statInfo.stat.name.replace("-", ". ").toUpperCase();
        const statValue = statInfo.base_stat;
        const percentage = (statValue / 255) * 100;
        const barColor = statValue < 50 ? "#FF5959" : "#2ECC71";

        statsHtml += `
        <div class="stat-row">
            <span class="stat-name">${statName}</span>
            <span class="stat-value">${statValue}</span>
            <div class="stat-bar-container">
                <div class="stat-bar-fill" style="width: ${percentage}%; background-color: ${barColor};"></div>
            </div>
        </div>`;
    }
   
    modal.innerHTML = `
        <div class="details-panel" style="background: linear-gradient(to bottom, ${bgColor} 0%, ${bgColor} 40%, white 40%);">
            <div class="modal-header">
                <span class="back-button" onclick="closeZoomContainer()">✕</span>
            </div>
            
            ${i > 0 ? `<button class="nav-arrow nav-left" onclick="openContainer(${i - 1})">‹</button>` : ''}
            ${i < pokemonsData.length - 1 ? `<button class="nav-arrow nav-right" onclick="openContainer(${i + 1})">›</button>` : ''}
            
            <div class="modal-title">
                <h1>${pokemonDetails.name.charAt(0).toUpperCase() + pokemonDetails.name.slice(1)}</h1>
                <span class="modal-id">${formattedId}</span>
            </div>

            <div class="modal-types-top">
                ${pokemonDetails.types.map(typeInfo => {
                    const typeName = typeInfo.type.name;
                    return `<span class="type-pill">${typeName.charAt(0).toUpperCase() + typeName.slice(1)}</span>`;
                }).join('')}
            </div>

            <div class="modal-image-large">
                <img src="${pokemonDetails.sprites.other['official-artwork'].front_default || pokemonDetails.sprites.front_default}" 
                     alt="${pokemonDetails.name}">
            </div>

            <div class="modal-tabs">
                <button class="tab-button active" onclick="switchTab(event, 'about')">About</button>
                <button class="tab-button" onclick="switchTab(event, 'stats')">Base Stats</button>
                <button class="tab-button" onclick="switchTab(event, 'evolution')">Evolution</button>
                <button class="tab-button" onclick="switchTab(event, 'moves')">Moves</button>
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

            <div id="stats" class="tab-content">
                ${statsHtml}
            </div>

            <div id="evolution" class="tab-content">
                ${evolutionHtml}
            </div>

            <div id="moves" class="tab-content">
                <div class="moves-grid">
                    ${movesHtml}
                </div>
            </div>
        </div>
    `;
    modal.style.display = "flex";
}

async function getEvolutionChainHTML(chain) {
    let evolutionHTML = '<div class="evolution-chain">';
    let current = chain;
    
    while (current) {
        const pokemonId = current.species.url.split('/').filter(Boolean).pop();
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = await pokemonResponse.json();
        
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

function closeZoomContainer() {
    document.body.style.overflow = 'auto';
    modal.style.display = 'none';
}

function switchTab(event, tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}
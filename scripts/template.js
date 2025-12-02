function createPokemonCardHTML(dataDetails, typeColorsIcons) {
    const formattedId = `#${String(dataDetails.id).padStart(3, '0')}`;
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
                     ${dataDetails.types.map(typeInfo => {
                        const typeName = typeInfo.type.name;
                        const typeColor = typeColorsIcons[typeName];
                        return `<p class="${typeName} type"
                                    style="background-color: ${typeColor};">
                                    ${typeName.toUpperCase()}
                                </p>`;
                     }).join('')}
                </div>
                <div class="pokemon-status">
                    <p class="height">${dataDetails.height / 10} m</p>
                    <p class="weight">${dataDetails.weight / 10} kg</p>
                </div>
            </div>
        </div> 
    `;
}

function openContainer(i) {
    const pokemonDetails = pokemonsData[i]; 
    const formattedId = `#${String(pokemonDetails.id).padStart(3, '0')}`;
    const primaryType = pokemonDetails.types[0].type.name;
    const bgColor = typeColorsIcons[primaryType] || '#A8A878';

    modal.innerHTML = `
        <div class="details-panel" style="background: linear-gradient(to bottom, ${bgColor} 0%, ${bgColor} 40%, white 40%);">
            <div class="modal-header">
                <span class="back-button" onclick="closeZoomContainer()">←</span>
                <span class="favorite-button">♡</span>
            </div>
            
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
                    <span class="info-value">Seed</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Height</span>
                    <span class="info-value">${(pokemonDetails.height / 10).toFixed(1)} m (${Math.floor(pokemonDetails.height * 3.937 / 10)}' ${Math.round((pokemonDetails.height * 3.937 / 10 % 1) * 12)}'')</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Weight</span>
                    <span class="info-value">${(pokemonDetails.weight / 10).toFixed(1)} kg (${(pokemonDetails.weight * 0.2205).toFixed(1)} lbs)</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Abilities</span>
                    <span class="info-value">${pokemonDetails.abilities.map(a => a.ability.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ')}</span>
                </div>
              
            </div>

            <div id="stats" class="tab-content">
                ${pokemonDetails.stats.map(statInfo => {
                    const statName = statInfo.stat.name.replace('-', '. ').toUpperCase();
                    const statValue = statInfo.base_stat;
                    const percentage = (statValue / 255) * 100;
                    const barColor = statValue < 50 ? '#FF5959' : '#2ECC71';
                    
                    return `
                    <div class="stat-row">
                        <span class="stat-name">${statName}</span>
                        <span class="stat-value">${statValue}</span>
                        <div class="stat-bar-container">
                            <div class="stat-bar-fill" style="width: ${percentage}%; background-color: ${barColor};"></div>
                        </div>
                    </div>`;
                }).join('')}
                <div class="stat-row total">
                    <span class="stat-name">TOTAL</span>
                    <span class="stat-value">${pokemonDetails.stats.reduce((sum, s) => sum + s.base_stat, 0)}</span>
                    <div class="stat-bar-container"></div>
                </div>
            </div>

            <div id="evolution" class="tab-content">
                <p style="text-align: center; color: #999; padding: 40px;">Evolution chain coming soon...</p>
            </div>

            <div id="moves" class="tab-content">
                <p style="text-align: center; color: #999; padding: 40px;">Moves list coming soon...</p>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeZoomContainer() {
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
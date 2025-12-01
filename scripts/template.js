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
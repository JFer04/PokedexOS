const fs = require('fs');
const path = require('path');

async function fetchPokemonData() {
    console.log('Fetching Kanto & Kalos Pokémon...');
    
    // Kanto: 1-151
    // Kalos: 650-721
    const ranges = [
        { start: 1, end: 151 },
        { start: 650, end: 721 }
    ];

    let allDetailedPokemons = [];

    for (const range of ranges) {
        console.log(`Processing range ${range.start} to ${range.end}...`);
        const pokemons = await Promise.all(
            Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i).map(async (id) => {
                try {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                    const details = await res.json();
                    return {
                        id,
                        name: details.name,
                        types: details.types.map(t => t.type.name),
                        region: id <= 151 ? 'Kanto' : 'Kalos'
                    };
                } catch (e) {
                    console.error(`Error fetching ID ${id}:`, e.message);
                    return null;
                }
            })
        );
        allDetailedPokemons = allDetailedPokemons.concat(pokemons.filter(p => p !== null));
    }

    const dir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(dir, 'pokemon.json'),
        JSON.stringify(allDetailedPokemons, null, 2)
    );
    console.log(`Successfully saved ${allDetailedPokemons.length} Pokémon to src/data/pokemon.json`);
}

fetchPokemonData().catch(console.error);

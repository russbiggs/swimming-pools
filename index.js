const fs = require('fs').promises;
const promisify = require('util').promisify;
const queryOverpass = require('query-overpass');
const queryOverpassAsync = promisify(queryOverpass);
const topology = require('topojson').topology;

async function main() {
    const query = await fs.readFile('./query.txt', 'utf-8')
    const data = await queryOverpassAsync(query);
    console.log(`${data.features.length} pools`)
    await fs.writeFile('pools.geojson', JSON.stringify(data));
    await fs.writeFile('pools.json', JSON.stringify(topology({pools:data})));
}

main();
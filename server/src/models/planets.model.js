const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

async function loadPlanetsData() {
  const fileStream = fs.createReadStream(
    path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
  );
  const parser = parse({
    comment: '#',
    columns: true,
  });
  const planetUpdates = [];

  fileStream.on('error', (error) => parser.destroy(error));
  fileStream.pipe(parser);

  for await (const data of parser) {
    if (isHabitablePlanet(data)) {
      planetUpdates.push({
        updateOne: {
          filter: { keplerName: data.kepler_name },
          update: { keplerName: data.kepler_name },
          upsert: true,
        },
      });
    }
  }

  if (planetUpdates.length > 0) {
    await planets.bulkWrite(planetUpdates);
  }

  const countPlanetsFound = (await getAllPlanets()).length;
  console.log(`${countPlanetsFound} habitable planets found!`);
}

async function getAllPlanets() {
  return await planets.find({}, {
    '_id': 0, '__v': 0,
  });
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
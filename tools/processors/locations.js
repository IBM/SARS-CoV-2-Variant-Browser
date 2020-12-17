const parse = require('csv-parse');
const fs = require('fs');

const dataDir = process.env.DATA_DIR;
const version = process.env.DATA_VERSION;
const dataSet = process.env.DATA_SET;

const readFile = async (fileName, columns, delimiter = ',') => {
  return new Promise((resolve) => {
    const output = [];
    const parser = parse({delimiter, columns});
    parser.on('readable', () => {
      let record;
      while (record = parser.read()) {
        output.push(record);
      }
    });
    parser.on('end', () => resolve(output));
    parser.on('error', () => resolve([]));
    const stream = fs.createReadStream(fileName);
    stream.on('error', () => {
      console.log(fileName + ' not found');
      resolve([]);
    });
    stream.pipe(parser);
  });
};

const load = async () => {
  const columns = ['country', 'lat', 'lng'];
  let locations = await readFile(`${dataDir}/${version}/locations_${version}.csv`, columns);
  locations = locations.map((item) => {
    return {
      country: item.country,
      lat: Number(item.lat),
      lng: Number(item.lng),
    };
  });

  return {locations};
};

module.exports = async () => {
  const store = require('../../server/data-store');
  const data = await load();
  const postfix = dataSet ? `-${dataSet}` : '';
  await store.set('locations' + postfix, data);
};

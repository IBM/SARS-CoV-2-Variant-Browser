require('dotenv').config();
const parse = require('csv-parse');
const fs = require('fs');

const dataDir = process.env.DATA_DIR;
const version = process.env.DATA_VERSION;
const dataSet = process.env.DATA_SET;
const versionSet = version + (dataSet ? `_${dataSet}` : '');

const readFile = async (fileName, columns, from_line = 1, delimiter = '\t', relax_column_count = true) => {
  return new Promise((resolve) => {
    const output = [];
    const parser = parse({delimiter, columns, from_line, relax_column_count});
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

const checkLocations = async () => {
  const columns = ['country', 'lat', 'lng'];
  const locations = await readFile(`${dataDir}/${version}/locations_${version}.csv`, columns, 1, ',');
  const sampleColumns = process.env.DATA_COLUMNS_SAMPLES.split('|');
  const samples = await readFile(`${dataDir}/${version}/${dataSet}/samples_${versionSet}.tsv`, sampleColumns, 2);

  const notFound = {};
  samples.forEach((sample) => {
    const location = locations.find((item) => item.country === sample.country);
    if (!location) {
      notFound[sample.country] = true;
    }
  });

  if (Object.keys(notFound).length === 0) {
    console.log('Location data for sample data is valid.');
  } else {
    console.log('The following countries on location data are missing');
    console.log(Object.keys(notFound));
  }
};

checkLocations();

const parse = require('csv-parse');
const fs = require('fs');

const dataDir = process.env.DATA_DIR;
const version = process.env.DATA_VERSION;
const dataSet = process.env.DATA_SET;
const versionSet = version + (dataSet ? `_${dataSet}` : '');

const readFile = async (fileName, columns = true, delimiter = ',') => {
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
  const basicInformation = await readFile(`${dataDir}/${version}/Stat-${dataSet}/00_basic_infomaction_${versionSet}.csv`);
  // const geneVariant = await readFile(`${dataDir}/${version}/Stat-${dataSet}/00_gene_variant_${versionSet}.csv`);
  // const ORF1abSubVariant = await readFile(`${dataDir}/${version}/Stat-${dataSet}/00_ORF1ab_sub_variant_${versionSet}.csv`);
  const continentSamples = await readFile(`${dataDir}/${version}/Stat-${dataSet}/01_continent_samples_${versionSet}.csv`);
  const countrySamples = await readFile(`${dataDir}/${version}/Stat-${dataSet}/01_country_samples_${versionSet}.csv`);
  // const continentSamplesCollectionMonth = await readFile(`${dataDir}/${version}/Stat-${dataSet}/02_continent_samples_collection_month_${versionSet}.csv`);
  // const countrySamplesCollectionMonth = await readFile(`${dataDir}/${version}/Stat-${dataSet}/02_country_samples_collection_month_${versionSet}.csv`);
  // const continentVariantsMonth = await readFile(`${dataDir}/${version}/Stat-${dataSet}/03_continent_variants_month_${versionSet}.csv`);
  // const countryVariantsMonth = await readFile(`${dataDir}/${version}/Stat-${dataSet}/03_country_variants_month_${versionSet}.csv`);
  // const continentCladeMonth = await readFile(`${dataDir}/${version}/Stat-${dataSet}/04_continent_clade_month_${versionSet}.csv`);
  // const countryCladeMonth = await readFile(`${dataDir}/${version}/Stat-${dataSet}/04_country_clade_month_${versionSet}.csv`);
  const continentSamplesCollectionWeek = await readFile(`${dataDir}/${version}/Stat-${dataSet}/05_continent_samples_collection_week_${versionSet}.csv`);
  const countrySamplesCollectionWeek = await readFile(`${dataDir}/${version}/Stat-${dataSet}/05_country_samples_collection_week_${versionSet}.csv`);
  // const continentVariantsWeek = await readFile(`${dataDir}/${version}/Stat-${dataSet}/06_continent_variants_week_${versionSet}.csv`);
  // const countryVariantsWeek = await readFile(`${dataDir}/${version}/Stat-${dataSet}/06_country_variants_week_${versionSet}.csv`);
  const continentCladeWeek = await readFile(`${dataDir}/${version}/Stat-${dataSet}/07_continent_clade_week_${versionSet}.csv`);
  const countryCladeWeek = await readFile(`${dataDir}/${version}/Stat-${dataSet}/07_country_clade_week_${versionSet}.csv`);
  return {
    basicInformation,
    // geneVariant,
    // ORF1abSubVariant,
    continentSamples,
    countrySamples,
    // continentSamplesCollectionMonth,
    // countrySamplesCollectionMonth,
    // continentVariantsMonth,
    // countryVariantsMonth,
    // continentCladeMonth,
    // countryCladeMonth,
    continentSamplesCollectionWeek,
    countrySamplesCollectionWeek,
    // continentVariantsWeek,
    // countryVariantsWeek,
    continentCladeWeek,
    countryCladeWeek,
  };
};

module.exports = async () => {
  const store = require('../../server/data-store');
  const data = await load();
  const postfix = dataSet ? `-${dataSet}` : '';
  await store.set('stat' + postfix, data);
};

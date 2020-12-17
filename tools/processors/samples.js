const parse = require('csv-parse');
const fs = require('fs');
const moment = require('moment-timezone');

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

const loadSupplements = (data) => {
  const mutationToValue = (mutation) => {
    const i = mutation.search(/[^0-9]/);
    return Number(mutation.substring(0, i));
  };
  const toArray = (set, comparator = null) => {
    const array = Array.from(set);
    if (comparator) {
      array.sort(comparator);
    } else {
      array.sort();
    }
    return array;
  };
  const samples = new Set();
  const isolates = new Set();
  const types = new Set();
  const mutations = new Set();
  const genes = new Set();
  const aaChanges = new Set();
  const continents = new Set();
  const countries = new Set();
  const clades = new Set();
  const locations = [];
  const genesAAChanges = [];
  data.forEach((s) => {
    // stop populate some supplemental information since they are not used
    // samples.add(s.sample);
    // isolates.add(s.isolate);
    // continents.add(s.continent);
    // countries.add(s.country);
    clades.add(s.cladeDetail);
    if (!locations.find((i) => i.category === s.continent && i.value === '')) {
      locations.push({category: s.continent, value: '', label: s.continent + '  (Continent)'});
    }
    if (!locations.find((i) => i.category === s.continent && i.value === s.country)) {
      locations.push({category: s.continent, value: s.country, label: s.continent + ' - ' + s.country});
    }
    s.mutations.forEach((m) => {
      types.add(m.type);
      // genes.add(m.gene);
      if (!genesAAChanges.find((i) => i.category === m.gene && i.value === '')) {
        genesAAChanges.push({category: m.gene, value: '', label: m.gene + '  (Gene)'});
      }
      // mutations.add(m.mutation);
      if (m.AA_change) {
        // aaChanges.add(m.AA_change);
        if (!genesAAChanges.find((i) => i.category === m.gene && i.value === m.AA_change)) {
          genesAAChanges.push({category: m.gene, value: m.AA_change, label: m.gene + ' - ' + m.AA_change});
        }
      }
    });
  });
  locations.sort((x, y) => x.label.localeCompare(y.label));
  genesAAChanges.sort((x, y) => x.label.localeCompare(y.label));
  return {
    samples: toArray(samples),
    isolates: toArray(isolates),
    continents: toArray(continents),
    countries: toArray(countries),
    types: toArray(types),
    mutations: toArray(mutations, (x, y) => mutationToValue(x) - mutationToValue(y)),
    genes: toArray(genes),
    aaChanges: toArray(aaChanges),
    locations: locations,
    genesAAChanges: genesAAChanges,
    clades: toArray(clades),
  };
};

const loadSamples = async () => {
  const clusterColumns = process.env.DATA_COLUMNS_CLUSTER.split('|');
  const clusters = await readFile(`${dataDir}/${version}/${dataSet}/cluster_${versionSet}.tsv`, clusterColumns, 2);
  const cladeColumns = process.env.DATA_COLUMNS_CLADE.split('|');
  const clades = await readFile(`${dataDir}/${version}/${dataSet}/clade_${versionSet}.tsv`, cladeColumns, 2);
  const sampleColumns = process.env.DATA_COLUMNS_SAMPLES.split('|');
  const samples = await readFile(`${dataDir}/${version}/${dataSet}/samples_${versionSet}.tsv`, sampleColumns, 2);
  const mutationColumns = process.env.DATA_COLUMNS_VARIANT.split('|');
  const mutations = await readFile(`${dataDir}/${version}/${dataSet}/variant_${versionSet}.tsv`, mutationColumns, 2);
  // group by
  const mutationsCount = mutations.reduce((map, item) => {
    if (!map[item.mutation]) {
      map[item.mutation] = 0;
    }
    map[item.mutation]++;
    return map;
  }, {});
  const mutationsBySample = mutations.reduce((map, item) => {
    if (!map[item.sample]) {
      map[item.sample] = [];
    }
    map[item.sample].push({...item, c: mutationsCount[item.mutation]});
    return map;
  }, {});
  const result = [];
  clusters.forEach((item, index) => {
    const clade = clades.find((clade) => item.sample === clade.sample);
    const sample = samples.find((sample) => item.sample === sample.sample);
    const object = {
      i: index,
      sample: item.sample,
      cladeDetail: clade ? clade.cladeDetail : '',
      collectionDate: sample.collectionDate,
      country: sample.country,
      continent: sample.continent,
      mutations: mutationsBySample[item.sample] ? mutationsBySample[item.sample] : [],
    };
    result.push(object);
  });
  return result;
};

module.exports = async () => {
  const store = require('../../server/data-store');
  const postfix = dataSet ? `-${dataSet}` : '';
  const threshhold = 10000;

  // data load
  console.log('-- loading data --');
  const samples = await loadSamples();
  // await store.set('samples' + postfix, samples);

  // generate supplumental data
  console.log('-- building supplemental data --');
  const supplments = await loadSupplements(samples);
  await store.set('supplements' + postfix, supplments);

  // data splitting
  console.log('-- spliting data --');
  const sortSamples = [...samples];
  sortSamples.sort((x, y) => y.collectionDate.localeCompare(x.collectionDate));
  // calculate date to split sample data to makes each chunk length becomes < 10,000
  const splitDate = [];
  let searchIndex = sortSamples.length < threshhold ? sortSamples.length : threshhold;
  while (searchIndex !== sortSamples.length) {
    const searchDate = sortSamples[--searchIndex].collectionDate;
    while (searchDate === sortSamples[searchIndex].collectionDate) {
      searchIndex--;
    }
    splitDate.push(sortSamples[searchIndex].collectionDate);
    searchIndex = searchIndex + (sortSamples.length - searchIndex < threshhold ? sortSamples.length - searchIndex : threshhold);
  }
  splitDate.push(sortSamples[searchIndex - 1].collectionDate);
  // split data by date
  const splitData = samples.reduce((map, item) => {
    const date = splitDate.find((d) => item.collectionDate.localeCompare(d) >= 0);
    if (!map[date]) {
      map[date] = [];
    }
    map[date].push(item);
    return map;
  }, {});
  for (let i = 0; i < splitDate.length; i++) {
    console.log(splitDate[i] + ' - ' + splitData[splitDate[i]].length);
    await store.set(`samples${i}` + postfix, splitData[splitDate[i]]);
  }

  // metadata
  console.log('-- generating metadata --');
  const getDateStr = (d) => moment(d, 'YYYY-MM-DD').format('MM/DD/YYYY');
  const latestCollectionDate = sortSamples.length > 0 ? getDateStr(sortSamples[0].collectionDate) : '';
  const initialCollectionDateFrom = getDateStr(splitDate[0]);
  const metadata = {latestCollectionDate, initialCollectionDateFrom, splitDate, total: samples.length};
  console.log(metadata);
  await store.set('meta' + postfix, metadata);

  // data validation
  // console.log('  generating validation data');
  // const restore = [];
  // for (let i = 0; i < splitDate.length; i++) {
  //   restore.push(...splitData[splitDate[i]]);
  // }
  // restore.sort((x, y) => x.i - y.i);
  // await store.set('samples-restore' + postfix, restore);
};

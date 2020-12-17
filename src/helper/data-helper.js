import moment from 'moment-timezone';

/* eslint-disable camelcase */

const Genes = [
  '5\'-UTR',
  'ORF1ab',
  'S',
  'ORF3a',
  'E',
  'M',
  'ORF6',
  'ORF7a',
  'ORF8',
  'N',
  'ORF10',
  '3\'-UTR',
  'intergenic',
];

const GenesWithPosition = [
  {start: 266, end: 21555, name: 'ORF1ab', label: 'ORF1ab', color: '#F5F382', x: 0, y: -18},
  {start: 21563, end: 25384, name: 'S', label: 'S', color: '#92D4F4', x: 1600, y: 0},
  {start: 25393, end: 26220, name: 'ORF3a', label: 'ORF3a', color: '#C7C1E0', x: -2500, y: -18},
  {start: 26245, end: 26472, name: 'E', label: 'E', color: '#D18F4C', x: -300, y: -18},
  {start: 26523, end: 27191, name: 'M', label: 'M', color: '#ED5B62', x: 0, y: 0},
  {start: 27202, end: 27387, name: 'ORF6', label: 'ORF6', color: '#C7C1E0', x: -3200, y: 18},
  {start: 27394, end: 27759, name: 'ORF7a', label: 'ORF7a', color: '#C7C1E0', x: -500, y: -18},
  {start: 27894, end: 28259, name: 'ORF8', label: 'ORF8', color: '#C7C1E0', x: -1500, y: 18},
  {start: 28274, end: 29533, name: 'N', label: 'N', color: '#5CC2CF', x: 0, y: 0},
  {start: 29558, end: 29674, name: 'ORF10', label: 'ORF10', color: '#C7C1E0', x: -900, y: 18},
];

const ORF1abCDS = [
  {start: 266, end: 805, name: 'NSP1', label: 'NSP1', color: '#CCCCCC', x: 0, y: 18},
  {start: 806, end: 2719, name: 'NSP2', label: 'NSP2', color: '#CCCCCC', x: 0, y: 0},
  {start: 2720, end: 8554, name: 'NSP3', label: 'NSP3', color: '#CCCCCC', x: 0, y: 0},
  {start: 8555, end: 10054, name: 'NSP4', label: 'NSP4', color: '#CCCCCC', x: -700, y: -18},
  {start: 10055, end: 10972, name: '3CLPro', label: '3CLPro', color: '#CCCCCC', x: -1500, y: 18},
  {start: 10973, end: 11842, name: 'NSP6', label: 'NSP6', color: '#CCCCCC', x: -500, y: -18},
  {start: 11843, end: 12091, name: 'NSP7', label: 'NSP7', color: '#CCCCCC', x: -500, y: 18},
  {start: 12092, end: 12685, name: 'NSP8', label: 'NSP8', color: '#CCCCCC', x: 700, y: -18},
  {start: 12686, end: 13024, name: 'NSP9', label: 'NSP9', color: '#CCCCCC', x: 800, y: 18},
  {start: 13025, end: 13441, name: 'NSP10', label: 'NSP10', color: '#CCCCCC', x: 2000, y: -18},
  {start: 13442, end: 16236, name: 'RdRp', label: 'RdRp', color: '#CCCCCC', x: 0, y: 0},
  {start: 16237, end: 18039, name: 'helicase', label: 'helicase', color: '#CCCCCC', x: -200, y: 18},
  {start: 18040, end: 19620, name: 'ExoN', label: 'ExoN', color: '#CCCCCC', x: 0, y: 0},
  {start: 19621, end: 20658, name: 'endoRNase', label: 'endoRNase', color: '#CCCCCC', x: -200, y: 18},
  {start: 20659, end: 21552, name: 'OMT', label: 'OMT', color: '#CCCCCC', x: 0, y: -18},
];

const CarbonCategory14 = [
  '#6929c4', // 1. Purple 70
  '#1192e8', // 2. Cyan 50
  '#005d5d', // 3. Teal 70
  '#9f1853', // 4. Magenta 70
  '#fa4d56', // 5. Red 50
  '#520408', // 6. Red 90
  '#198038', // 7. Green 60
  '#002d9c', // 8. Blue 80
  '#ee5396', // 9. Magenta 50
  '#b28600', // 10. Yello 50
  '#009d9a', // 11. Teal 50
  '#012749', // 12. Cyan 90
  '#8a3800', // 13. Orange 70
  '#a56eff', // 14. Purple 50
];

const Types = [
  'missense',
  'synonymous mutation',
  'non-coding',
  'non-coding deletion',
  'non-coding insertion',
  'stop gain',
  'start loss',
  'frameshift deletion',
  'frameshift insertion',
  'in-frame deletion',
  'in-frame insertion',
  'insertion',
  // 'complex deletion',
];

const TypeColors = [
  '#ef6c2b',
  CarbonCategory14[1],
  CarbonCategory14[2],
  '#6fdc8c',
  '#6fdc8c',
  '#ff0000',
  '#ff0000',
  '#000000',
  '#000000',
  CarbonCategory14[0],
  CarbonCategory14[0],
  '#cccccc',
  // '#cccccc',
];

const Clades = [
  'D614G',
  'D614G/Q57H',
  'D614G/Q57H/T265I',
  'D614G/203_204delinsKR',
  'D614G/203_204delinsKR/T175M',
  'L84S',
  'L84S/P5828L',
  'L3606F',
  'L3606F/V378I',
  'L3606F/G251V',
  'L3606F/G251V/P765S',
  'D448del',
  'G392D',
  'basal',
];

const CladeColors = [
  '#CCEFFC',
  '#F2F7FC',
  '#DAE3F3',
  '#AFCBE3',
  '#C4CBDA',
  '#FFF1C5',
  '#FFE79E',
  '#DEE5D3',
  '#B3BFAB',
  '#D6EDBC',
  '#9EE1BC',
  '#FBE1D0',
  '#E79E9E',
  '#BBBBBB',
];


const Continents = [
  'Asia',
  'Africa',
  'Europe',
  'North America',
  'South America',
  'Oceania',
];
const ContinentColors = [
  'rgb(34, 34, 256)',
  'rgb(256, 100, 0)',
  'rgb(34, 140, 34)',
  'rgb(256, 34, 34)',
  'rgb(255, 215, 0)',
  'rgb(140, 40, 140)',
];

const Countries = [
  'USA', // 'United States'
  'United Kingdom',
  'Australia',
  'Iceland',
  'Netherlands',
  'China',
  'Belgium',
  'Denmark',
  'France',
  'Spain',
  'Russia',
  'Canada',
  'Luxembourg',
  'Sweden',
  'Portugal',
  'Japan',
  'Italy',
  'India',
  'Switzerland',
  'Finland',
  'Brazil',
  'South Korea',
  'Norway',
  'Senegal',
  'Austria',
  'Democratic Republic of the Congo',
  'Georgia',
  'Ireland',
  'Latvia',
  'Viet Nam', // 'Vietnam'
  'Germany',
  'Chile',
  'Greece',
  'Kuwait',
  'Mexico',
  'Malaysia',
  'Thailand',
  'Estonia',
  'Slovakia',
  'Algeria',
  'Argentina',
  'Hungary',
  'Israel',
  'Pakistan',
  'Taiwan',
  'Slovenia',
  'Singapore',
  'Belarus',
  'Nepal',
  'New Zealand',
  'Peru',
  'Cambodia',
  'Colombia',
  'Iran',
  'Lithuania',
  'Poland',
  'South Africa',
  'Turkey',
  'Qatar',
  'Gambia',
  'Saudi Arabia',
  'Hong Kong',
  'Jordan',
  'Philippines',
  'Czech Republic',
  'Columbia',
  'Sri Lanka',
  'Indonesia',
  'Egypt',
  'Costa Rica',
];

const CountryColors = [
  'rgb(31, 119, 180)',
  'rgb(152, 223, 138)',
  'rgb(174, 199, 232)',
  'rgb(214,39, 40)',
  'rgb(255, 127, 14)',
  'rgb(255, 152, 150)',
  'rgb(255, 187, 120)',
  'rgb(148, 103, 189)',
  'rgb(44, 160, 44)',
  'rgb(197, 176, 213)',
  'rgb(140, 86, 75)',
  'rgb(196, 156, 148)',
  'rgb(227, 119, 194)',
  'rgb(23,190, 207)',
  'rgb(188, 189, 34)',
  ...CarbonCategory14,
  ...CarbonCategory14,
  ...CarbonCategory14,
  ...CarbonCategory14,
];

const sampleLabels = ['sample', 'isolate', 'continent', 'country', 'cladeDetail'];
const mutationLabels = ['mutation', 'type', 'gene', 'AA_change'];

const isFilterBlank = (filter) => {
  return !filter.collectionDateFrom && !filter.collectionDateTo &&
    sampleLabels.reduce((acc, val) => acc && (!filter[val] || filter[val].length === 0), true) &&
    mutationLabels.reduce((acc, val) => acc && (!filter[val] || filter[val].length === 0), true) &&
    (!filter.geneAA_change || filter.geneAA_change.length === 0) &&
    (!filter.location || filter.location.length === 0);
};

const filterData = (data, filter) => {
  const filterBlank = isFilterBlank(filter);
  const samples = [];
  const filteredSamples = [];
  const tableItems = new Map();
  const addTableItem = (entry) => {
    entry.mutations.forEach((mutation) => {
      const item = {
        id: mutation.sample + '-' + mutation.mutation,
        mutation: mutation.mutation,
        gene: mutation.gene,
        amino_acid_change: !!mutation.subGene ? mutation.AA_change + ' (' + mutation.subGene + ' ' + mutation.subAA_change + ')' : mutation.AA_change,
        mutation_type: mutation.type,
        reported_location: entry.continent,
        count: 1,
        isSelected: !(filterBlank || entry.match),
      };
      // remove duplicate mutations - increase count value, merge locations
      if (!item.isSelected) {
        if (tableItems.has(item.mutation)) {
          const value = tableItems.get(item.mutation);
          const locationSet = new Set(value.reported_location.split(', '));
          // value.isSelected = !(!value.isSelected || !item.isSelected);
          value.count++;
          value.reported_location = [...locationSet.add(item.reported_location)].filter((v) => v).join(', ');
        } else {
          tableItems.set(item.mutation, item);
        }
      }
    });
  };
  if (filterBlank) {
    data.forEach((entry) => {
      entry.match = false;
      entry.mutations.forEach((mutation) => mutation.match = false);
      samples.push(entry);
      filteredSamples.push(entry);
      addTableItem(entry);
    });
  } else {
    const filterCollectionDateFrom = moment(filter.collectionDateFrom, 'MM/DD/YYYY');
    const filterCollectionDateTo = moment(filter.collectionDateTo, 'MM/DD/YYYY');
    const continent = filter.location.filter((i) => isCategory(i) && i.selected === 'true').map((i) => i.category);
    const country = filter.location.filter((i) => !isCategory(i) && i.selected === 'true' && getCategoryItem(filter.location, i.category).selected === 'mixed').map((i) => i.value);
    const genes = filter.geneAA_change.filter((i) => isCategory(i) && i.selected === 'true').map((i) => i.category);
    const AA_changes = filter.geneAA_change.filter((i) => !isCategory(i) && i.selected === 'true' && getCategoryItem(filter.geneAA_change, i.category).selected === 'mixed').map((i) => i.value);
    data.forEach((entry) => {
      entry.match = true;
      entry.mCollectionDate = moment(entry.collectionDate, 'YYYY-MM-DD');
      if (filter.collectionDateFrom && entry.mCollectionDate.isBefore(filterCollectionDateFrom)) {
        entry.match = false;
      } else if (filter.collectionDateTo && entry.mCollectionDate.isAfter(filterCollectionDateTo)) {
        entry.match = false;
      }
      sampleLabels.forEach((label) => {
        if (entry.match && filter[label].length > 0 && !filter[label].reduce((acc, v) => acc || ((entry[label] ? entry[label].includes(v) : false) ), false)) {
          entry.match = false;
        }
      });
      // categorical filtering for continent - country
      if (entry.match && filter.location.length > 0) {
        entry.match = continent.includes(entry.continent) || country.includes(entry.country);
      }
      if (entry.match) {
        if (entry.mutations.length === 0) {
          if (mutationLabels.find((label) => filter[label].length > 0) || filter.geneAA_change.length > 0) {
            entry.match = false;
          }
        } else {
          entry.match = entry.mutations.reduce((acc, mutation) => {
            mutation.match = true;
            mutationLabels.forEach((label) => {
              if (filter[label].length > 0 && !filter[label].reduce((acc, v) => acc || mutation[label].startsWith(v), false)) {
                mutation.match = false;
              }
            });
            // categorical filtering for gene - AA_change
            if (mutation.match && filter.geneAA_change.length > 0) {
              mutation.match = genes.includes(mutation.gene) || AA_changes.includes(mutation.AA_change);
            }
            return acc || mutation.match;
          }, false);
        }
      } else {
        entry.mutations.forEach((mutation) => mutation.match = false);
      }
      samples.push(entry);
      if (entry.match) {
        filteredSamples.push(entry);
      }
      addTableItem(entry);
    });
  }
  const tableSamples = [...tableItems.values()].sort((a, b) => b.count - a.count);
  return {samples, filteredSamples, tableSamples};
};

const mutationToValue = (mutation) => {
  const i = mutation.search(/[^0-9]/);
  return Number(mutation.substring(0, i));
};

const isCategory = (item) => !item.value;

const getCategoryItem = (list, category) => list.find((i) => i.category === category && !i.value);

const getItem = (list, item) => list.find((i) => i.category === item.category && i.value === item.value);

const getSameCategoryItems = (list, category) => list.filter((i) => i.category === category && i.value);

const FilterTemplate = {
  collectionDateFrom: null,
  collectionDateTo: null,
  sample: [],
  isolate: [],
  mutation: [],
  type: [],
  gene: [],
  AA_change: [],
  geneAA_change: [],
  continent: [],
  country: [],
  location: [],
  cladeDetail: [],
};

const FilterPreset = {
  latest: {...FilterTemplate},
  locationUsa: {
    ...FilterTemplate,
    location: [{
      category: 'North America',
      label: 'North America  (Continent)',
      value: '',
      selected: 'mixed',
    }, {
      category: 'North America',
      label: 'North America - USA',
      value: 'USA',
      selected: 'true',
    }],
  },
  full: {...FilterTemplate},
};

export {
  Genes,
  GenesWithPosition,
  ORF1abCDS,
  CarbonCategory14,
  Types,
  TypeColors,
  Clades,
  CladeColors,
  Continents,
  ContinentColors,
  Countries,
  CountryColors,
  filterData,
  isFilterBlank,
  mutationToValue,
  isCategory,
  getCategoryItem,
  getItem,
  getSameCategoryItems,
  FilterTemplate,
  FilterPreset,
};

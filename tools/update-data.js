require('dotenv').config();
const store = require('../server/data-store');

const load = async (mode) => {
  console.log('data store type: ' + process.env.DATA_STORE_TYPE);
  try {
    if (mode === 'variant') {
      console.log('updating samples...');
      await require('./processors/samples')();
      console.log('updating stat...');
      await require('./processors/stat')();
      console.log('updating locations...');
      await require('./processors/locations')();
    }
    if (store.client) {
      store.client.quit();
    }
  } catch (e) {
    console.log(e);
  }
};

const target = ['variant'];
if (process.argv.length !== 3 || !target.includes(process.argv[2])) {
  console.log('usage: node update-data [' + target.join('|') + ']');
} else {
  load(process.argv[2]);
}

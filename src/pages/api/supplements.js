const store = require('../../../server/data-store');

const emptyResponse = {
  ncbi: [],
  gisaid: [],
};

const cacheInterval = Number(process.env.CACHE_REFRESH_INTERVAL);
let cache = {};
const getCache = (key) => cache[key];
const putCache = (key, data) => {
  if (cacheInterval > 0) {
    cache[key] = data;
  }
};
const refresh = () => {
  cache = {};
  if (cacheInterval > 0) {
    setTimeout(refresh, cacheInterval);
  }
};
refresh();

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const dataSet = req.session ? req.session.datasetSuffix : process.env.DEFAULT_DATA_SET;
    const key = 'supplements' + (dataSet ? `-${dataSet}` : '');
    let data = emptyResponse;
    try {
      data = getCache(key);
      if (!data) {
        data = await store.get(key);
        putCache(key, data);
      }
    } catch (e) {
      console.warn(e);
    }
    res.status(200).json(data ? data : emptyResponse);
  } else {
    res.status(404).send('Not Found');
  }
};

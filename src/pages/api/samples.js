const store = require('../../../server/data-store');

const emptyResponse = {
  samples: [],
  supplements: {},
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
    let data = emptyResponse;
    const dataSet = req.session ? req.session.datasetSuffix : process.env.DEFAULT_DATA_SET;
    const date = req.query.date ? req.query.date : '0';
    const key = `samples${date}` + (dataSet ? `-${dataSet}` : '');
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

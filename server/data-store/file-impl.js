const fs = require('fs');
const dir = process.env.DATA_STORE_FILE_DIR;

module.exports = {
  get: async (key) => JSON.parse(fs.readFileSync(`${dir}/${key}.json`)),
  set: async (key, json) => fs.writeFileSync(`${dir}/${key}.json`, JSON.stringify(json)),
};

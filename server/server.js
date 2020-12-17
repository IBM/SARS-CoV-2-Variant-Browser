require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const history = require('connect-history-api-fallback');
const path = require('path');
const compression = require('compression');

const meta = require('../src/pages/api/meta');
const samples = require('../src/pages/api/samples');
const supplements = require('../src/pages/api/supplements');
const locations = require('../src/pages/api/locations');
const stat = require('../src/pages/api/stat');

const app = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// health check
app.use('/health', (req, res) => res.status(200).send('OK'));

// security
app.use(helmet());

// API
app.use('/api/meta', meta);
app.use('/api/samples', samples);
app.use('/api/supplements', supplements);
app.use('/api/locations', locations);
app.use('/api/stat', stat);

// serve SPA contents
app.use(history({index: '/index.html'}));
app.use('/', express.static(path.join(__dirname, '../out')));

// start http server
const port = Number.parseInt(process.env.PORT || process.env.VCAP_APP_PORT || '3000');
app.listen(port, '0.0.0.0', () => {
  console.log('server starting on port: ' + port);
  console.log(`data store is ${process.env.DATA_STORE_TYPE}`);
});

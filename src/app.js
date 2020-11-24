require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const logger = require('./logger');
const organizationsRouter = require('./organizations/organizations-router');
const causesRouter = require('./causes/causes-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/orgs', organizationsRouter);
app.use('/api/causes', causesRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    const message = 'server error';
    logger.error(message)
    response = { message };
  } else {
    logger.error(`${req.method}: ${error.message}`);
    logger.error(error.stack);
    response = { message: error.message, stack: error.stack };
  }

  res.status(500).json(response);
});

module.exports = app;
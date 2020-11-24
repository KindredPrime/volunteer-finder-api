const express = require('express');
const xss = require('xss');
const CausesService = require('./causes-service');

const causesRouter = express.Router();

const sanitizeCause = (cause) => {
  const { cause_name } = cause;
  return {
    ...cause,
    cause_name: xss(cause_name)
  };
}

causesRouter
  .route('/')
  .get((req, res, next) => {
    return CausesService.getAllCauses(req.app.get('db'))
      .then((causes) => {
        return res
          .json(causes.map(sanitizeCause));
      })
      .catch(next);
  });

module.exports = causesRouter;
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

causesRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id } = req.params;
    return CausesService.getById(req.app.get('db'), id)
      .then((cause) => {
        if (!cause) {
          return res
            .status(404)
            .json({ message: `Cause with id ${id} does not exist` });
        }

        req.cause = cause;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.json(sanitizeCause(req.cause));
  });

module.exports = causesRouter;
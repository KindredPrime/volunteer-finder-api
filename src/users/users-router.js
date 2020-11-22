const express = require('express');
const xss = require('xss');
const UsersService = require('./users-service');
const logger = require('../logger');
const { validateUserPost, validateUserPatch } = require('../util');

const usersRouter = express.Router();
const bodyParser = express.json();

const sanitizeUser = (user) => {
  return {
    ...user,
    email: xss(user.email),
    username: xss(user.username)
  };
};

usersRouter
  .route('/')
  .get((req, res, next) => {
    return UsersService.getAllUsers(req.app.get('db'))
      .then((users) => {
        return res
          .json(users.map(sanitizeUser));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const newUser = req.body;

    const errorMsgs = validateUserPost(newUser);
    if (errorMsgs.length > 0) {
      const message = errorMsgs.join('; ');
      logger.error(`${req.method}: ${message}`);
      return res
        .status(400)
        .json({ message });
    }

    return UsersService.insertUser(req.app.get('db'), newUser)
      .then((user) => {
        return res
          .status(201)
          .location(`/api/users/${user.id}`)
          .json(sanitizeUser(user));
      })
      .catch(next);
  });

usersRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id } = req.params;
    return UsersService.getById(req.app.get('db'), id)
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .json({ message: `User with id ${id} does not exist` });
        }

        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    return res.json(sanitizeUser(res.user));
  })
  .patch(bodyParser, (req, res, next) => {
    const { id } = req.params;
    const { username, email } = req.body;
    const newFields = { username, email };

    const errorMsgs = validateUserPatch(newFields);
    if (errorMsgs.length > 0) {
      const message = errorMsgs.join('; ');
      logger.error(`${req.method}: ${message}`);
      return res
        .status(400)
        .json({ message });
    }

    return UsersService.updateUser(req.app.get('db'), id, newFields)
      .then(() => {
        return res
          .status(204)
          .end();
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { id } = req.params;
    return UsersService.deleteUser(req.app.get('db'), id)
      .then(() => {
        return res
          .status(204)
          .end();
      })
      .catch(next);
  });

module.exports = usersRouter;
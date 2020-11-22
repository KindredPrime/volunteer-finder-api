const express = require('express');
const xss = require('xss');
const UsersService = require('./users-service');

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
  });

module.exports = usersRouter;
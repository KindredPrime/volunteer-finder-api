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

module.exports = usersRouter;
const knex = require('knex');
const UsersService = require('../src/users/users-service');
const { makeUsersArray } = require('./users-fixtures');

describe.only('UsersService', () => {
  let db;
  before('Connect to the database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
  });

  const truncateTable = 'TRUNCATE users RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTable));

  afterEach('Clean up tables', () => db.raw(truncateTable));

  after('Disconnect from database', () => db.destroy());

  context('Given no users', () => {
    it('getAllUsers() returns an empty array', () => {
      return UsersService.getAllUsers(db)
        .then((results) => expect(results).to.eql([]));
    });

    it(`insertUser() adds user to 'users' and returns the new user`, () => {
      const newUser = {
        email: 'newEmail@gmail.com',
        username: 'newUser'
      };

      const expectedUser = {
        id: 1,
        ...newUser
      };

      return UsersService.insertUser(db, newUser)
        .then((result) => expect(result).to.eql(expectedUser))
        .then(() => UsersService.getById(db, 1))
        .then((result) => expect(result).to.eql(expectedUser));
    });
  });

  context('Given the table has users', () => {
    const testUsers = makeUsersArray();

    beforeEach('Populate users', () => {
      return db
        .insert(testUsers)
        .into('users');
    });

    it(`getAllUsers() returns all users from 'users'`, () => {
      return UsersService.getAllUsers(db)
        .then((results) => expect(results).to.eql(testUsers));
    });

    it(`getById() returns the user with id`, () => {
      const id = 1;
      return UsersService.getById(db, id)
        .then((result) => expect(result).to.eql(testUsers[id - 1]));
    });

    it(`updateUser() updates the user with id`, () => {
      const id = 1;
      const newFields = {
        email: 'updatedEmail@gmail.com',
        username: 'updatedUsername'
      };

      return UsersService.updateUser(db, id, newFields)
        .then(() => UsersService.getById(db, id))
        .then((result) => expect(result).to.eql({
          id,
          ...newFields
        }));
    });

    it(`deleteUser() removes the user with id from 'users'`, () => {
      const id = 1;
      return UsersService.deleteUser(db, id)
        .then(() => UsersService.getAllUsers(db))
        .then((results) => expect(results).to.eql(testUsers.filter((user) => user.id !== id)));
    });
  });
});
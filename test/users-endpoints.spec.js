const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray, makeMaliciousUser } = require('./users-fixtures');

describe('Users Endpoints', () => {
  let db;
  before('Connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });

    app.set('db', db);
  });

  const truncateTables = 'TRUNCATE users RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTables));

  afterEach('Clean up tables', () => db.raw(truncateTables));

  after('Disconnect from database', () => db.destroy());

  describe('GET /api/users', () => {
    context('Given no users', () => {
      it('Responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, []);
      });
    });

    context('Given the table has users', () => {
      const testUsers = makeUsersArray();

      beforeEach('Populate users', () => {
        return db
          .insert(testUsers)
          .into('users');
      });

      it('Responds with 200 and all users', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, testUsers);
      });
    });

    context('Given users with XSS attack content', () => {
      const { maliciousUser, sanitizedUser } = makeMaliciousUser();

      beforeEach('Populate users with malicious content', () => {
        return db
          .insert(maliciousUser)
          .into('users');
      });

      it('Responds with 200 and all users, without their XSS content', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, [sanitizedUser]);
      });
    });
  });

  describe.only('GET /api/users/:id', () => {
    context('Given no users', () => {
      it('Responds with 404 and an error message', () => {
        const id = 1000;
        return supertest(app)
          .get(`/api/users/${id}`)
          .expect(404, { message: `User with id ${id} does not exist` });
      });
    });

    context('Given the table has users', () => {
      const testUsers = makeUsersArray();

      beforeEach('Populate users', () => {
        return db
          .insert(testUsers)
          .into('users');
      });

      it('Responds with 200 and the user with id', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/users/${id}`)
          .expect(200, testUsers[id - 1]);
      });
    });

    context('Given the user has XSS attack content', () => {
      const { maliciousUser, sanitizedUser } = makeMaliciousUser();

      beforeEach('Populate users with malicious content', () => {
        return db
          .insert(maliciousUser)
          .into('users');
      });

      it('Responds with 200 and the user with id, without its XSS content', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/users/${id}`)
          .expect(200, sanitizedUser);
      });
    });
  });
});
const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray, makeMaliciousUser } = require('./users-fixtures');

describe.only('Users Endpoints', () => {
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
});
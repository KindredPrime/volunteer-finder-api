const app = require('../src/app');
const knex = require('knex');
const { makeUsersArray } = require('./fixtures');
const { makeOrganizationsArray, makeMaliciousOrg } = require('./organizations-fixtures');

describe.only('Organizations Endpoints', () => {
  let db;
  before('Connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });

    app.set('db', db);
  });

  const truncateTables = 'TRUNCATE users, organizations RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTables));

  afterEach('Clean up tables', () => db.raw(truncateTables));

  after('Disconnect from database', () => db.destroy());

  describe('GET /api/orgs', () => {
    context('Given no organizations', () => {
      it('Responds with 200 and no organizations', () => {
        return supertest(app)
          .get('/api/orgs')
          .expect(200, []);
      });
    });

    context('Given the table has organizations', () => {
      const testUsers = makeUsersArray();
      const testOrgs = makeOrganizationsArray();

      beforeEach('Populate users and orgs', () => {
        return db
          .insert(testUsers)
          .into('users')
          .then(() => {
            return db
              .insert(testOrgs)
              .into('organizations');
          });
      });

      it('Responds with 200 and all organizations', () => {
        return supertest(app)
          .get('/api/orgs')
          .expect(200, testOrgs);
      });
    });

    context('Given XSS attack content', () => {
      const testUsers = makeUsersArray();
      const { maliciousOrg, expectedOrg } = makeMaliciousOrg();

      beforeEach('Insert users and malicious org', () => {
        return db
          .insert(testUsers)
          .into('users')
          .then(() => {
            return db
              .insert(maliciousOrg)
              .into('organizations');
          });
      });

      it('Removes XSS attack content', () => {
        return supertest(app)
          .get('/api/orgs')
          .expect(200, [expectedOrg]);
      });
    });
  });
});
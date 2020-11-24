const knex = require('knex');
const app = require('../src/app');
const { makeCausesArray, makeMaliciousCause } = require('./causes-fixtures');

describe('Causes Endpoints', () => {
  let db;
  before('Connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });

    app.set('db', db);
  });

  const truncateTables = 'TRUNCATE causes RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTables));

  afterEach('Clean up tables', () => db.raw(truncateTables));

  after('Disconnect from database', () => db.destroy());

  describe('GET /api/causes', () => {
    context('Given no causes', () => {
      it('Responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/causes')
          .expect(200, []);
      });
    });

    context('Given the table has causes', () => {
      const testCauses = makeCausesArray();

      beforeEach('Populate causes', () => {
        return db
          .insert(testCauses)
          .into('causes');
      });

      it(`Responds with 200 and all the causes in 'causes'`, () => {
        return supertest(app)
          .get('/api/causes')
          .expect(200, testCauses);
      });
    });

    context('Given the causes have XSS attack content', () => {
      const { maliciousCause, sanitizedCause } = makeMaliciousCause();

      beforeEach('Populate malicious causes', () => {
        return db
          .insert(maliciousCause)
          .into('causes');
      });

      it(`Responds with 200 and all causes, without their XSS content`, () => {
        return supertest(app)
          .get('/api/causes')
          .expect(200, [sanitizedCause]);
      });
    });
  });

  describe('GET /api/causes/:id', () => {
    context('Given no causes', () => {
      it('Responds with 404 and an error message', () => {
        const id = 1000;
        return supertest(app)
          .get(`/api/causes/${id}`)
          .expect(404, { message: `Cause with id ${id} does not exist` });
      });
    });

    context('Given the table has causes', () => {
      const testCauses = makeCausesArray();

      beforeEach('Populate causes', () => {
        return db
          .insert(testCauses)
          .into('causes');
      });

      it(`Responds with 200 and the cause with id`, () => {
        const id = 1;
        return supertest(app)
          .get(`/api/causes/${id}`)
          .expect(200, testCauses[id - 1]);
      });
    });

    context('Given the cause has XSS attack content', () => {
      const { maliciousCause, sanitizedCause } = makeMaliciousCause();

      beforeEach('Populate malicious cause', () => {
        return db
          .insert(maliciousCause)
          .into('causes');
      });

      it(`Responds with 200 and the causes, without its XSS content`, () => {
        const id = 1;
        return supertest(app)
          .get(`/api/causes/${id}`)
          .expect(200, sanitizedCause);
      });
    });
  });
});
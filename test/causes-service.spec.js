const knex = require('knex');
const CausesService = require('../src/causes/causes-service');
const { makeCausesArray } = require('./fixtures');

describe('CausesService', () => {
  let db;
  before('Connect to the database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
  });
  const truncateTable = 'TRUNCATE causes RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTable));

  afterEach('Clean up tables', () => db.raw(truncateTable));

  after('Disconnect from database', () => db.destroy());

  context('Given no causes', () => {
    it(`getAllCauses() returns an empty array`, () => {
      return CausesService.getAllCauses(db)
        .then((results) => expect(results).to.eql([]));
    });

    it(`insertCause() adds cause to 'causes' table and returns it`, () => {
      const newCause = {
        cause_name: 'New Cause'
      };
      const expectedResult = {
        id: 1,
        ...newCause
      };

      return CausesService.insertCause(db, newCause)
        .then((result) => {
          expect(result).to.eql(expectedResult);

          return CausesService.getById(db, 1);
        })
        .then((result) => expect(result).to.eql(expectedResult));
    });
  });

  context('Given the table has causes', () => {
    const testCauses = makeCausesArray();

    beforeEach('Populate causes', () => {
      return db
        .insert(testCauses)
        .into('causes');
    });

    it(`getAllCauses() returns all causes in the 'causes' table`, () => {
      return CausesService.getAllCauses(db)
        .then((results) => expect(results).to.eql(testCauses));
    });

    it(`getById() returns the cause with the id`, () => {
      const id = 1;
      return CausesService.getById(db, id)
        .then((result) => expect(result).to.eql(testCauses[id - 1]));
    });

    it(`updateCause() updates the cause with id in 'causes' table`, () => {
      const id = 1;
      const newFields = {
        cause_name: 'Updated Name'
      };

      return CausesService.updateCause(db, id, newFields)
        .then(() => CausesService.getById(db, id))
        .then((result) => expect(result).to.eql({
          id,
          ...newFields
        }));
    });

    it(`deleteCause() removes the cause with id from 'causes' table`, () => {
      const id = 1;
      return CausesService.deleteCause(db, id)
        .then(() => CausesService.getAllCauses(db))
        .then((results) => expect(results).to.eql(testCauses.filter((cause) => cause.id !== id)));
    });
  });
});
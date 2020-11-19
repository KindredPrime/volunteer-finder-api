const knex = require('knex');
const OrgCausesService = require('../src/org_causes/org_causes-service');
const { makeUsersArray, makeOrganizationsArray, makeCausesArray } = require('./fixtures');
const { makeOrgCausesArray } = require('./org_causes-fixtures');

describe('OrgCausesService', () => {
  let db;
  before('Connect to the database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
  });

  const truncateTable = 'TRUNCATE org_causes, users, organizations, causes RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTable));

  afterEach('Clean up tables', () => db.raw(truncateTable));

  after('Disconnect from database', () => db.destroy());

  context('Given no org_causes', () => {
    const testUsers = makeUsersArray();
    const testOrgs = makeOrganizationsArray();
    const testCauses = makeCausesArray();

    beforeEach('Populate users, orgs, causes, and orgCauses', () => {
      return db
        .insert(testUsers)
        .into('users')
        .then(() => {
          return db
            .insert(testOrgs)
            .into('organizations')
            .then(() => {
              return db
                .insert(testCauses)
                .into('causes');
            });
        });
    });

    it('getAllOrgCauses() returns an empty array', () => {
      return OrgCausesService.getAllOrgCauses(db)
        .then((results) => expect(results).to.eql([]));
    });

    it(`insertOrgCause() adds org_cause to 'org_causes', and returns it`, () => {
      const newOrgCause = {
        org_id: 2,
        cause_id: 1
      };
      return OrgCausesService.insertOrgCause(db, newOrgCause)
        .then((result) => {
          expect(result).to.eql(newOrgCause);
          return OrgCausesService.getAllOrgCauses(db);
        })
        .then((results) => expect(results).to.eql([newOrgCause]));
    });
  });

  context('Given the table has org_causes', () => {
    const testUsers = makeUsersArray();
    const testOrgs = makeOrganizationsArray();
    const testCauses = makeCausesArray();
    const testOrgCauses = makeOrgCausesArray();

    beforeEach('Populate users, orgs, causes, and orgCauses', () => {
      return db
        .insert(testUsers)
        .into('users')
        .then(() => {
          return db
            .insert(testOrgs)
            .into('organizations')
            .then(() => {
              return db
                .insert(testCauses)
                .into('causes')
                .then(() => {
                  return db
                    .insert(testOrgCauses)
                    .into('org_causes');
                });
            });
        });
    });

    it(`getAllOrgCauses() returns all org_causes in 'org_causes' table`, () => {
      return OrgCausesService.getAllOrgCauses(db)
        .then((results) => expect(results).to.eql(testOrgCauses));
    });

    it(`getByOrgId() returns the org_causes with id`, () => {
      const orgId = 1;
      return OrgCausesService.getByOrgId(db, orgId)
        .then((results) => {
          expect(results).to.eql(testOrgCauses.filter((orgCause) => orgCause.org_id === orgId));
        });
    });

    it(`getByCauseId() returns the org_causes with id`, () => {
      const causeId = 1;
      return OrgCausesService.getByCauseId(db, causeId)
        .then((results) => {
          expect(results).to.eql(testOrgCauses.filter((orgCause) => orgCause.cause_id === causeId));
        });
    });

    it(`deleteOrgCause() deletes org_cause from 'org_causes' table`, () => {
      const orgId = 1;
      const causeId = 1;
      return OrgCausesService.deleteOrgCause(db, orgId, causeId)
        .then(() => OrgCausesService.getAllOrgCauses(db))
        .then((results) => expect(results).to.eql(
          testOrgCauses.filter((org_cause) => (
            org_cause.org_id !== orgId || org_cause.cause_id !== causeId
          ))));
    });
  });
});
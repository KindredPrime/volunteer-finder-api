const knex = require('knex');
const OrganizationsService = require('../src/organizations/organizations-service');
const OrgCausesService = require('../src/org_causes/org_causes-service');
const { makeUsersArray } = require('./users-fixtures');
const { makeOrganizationsArray, makeFullOrganizationsArray } = require('./organizations-fixtures');
const { makeOrgCausesArray } = require('./org_causes-fixtures');
const { makeCausesArray } = require('./causes-fixtures');

describe('OrganizationsService', () => {
  let db;
  before('Connect to the database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
  });
  const truncateTables = 'TRUNCATE users, organizations, causes, org_causes RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTables));

  afterEach('Clean up tables', () => db.raw(truncateTables));

  after('Disconnect from database', () => db.destroy());

  context('Given no organizations', () => {
    const testUsers = makeUsersArray();
    const testCauses = makeCausesArray();

    beforeEach('Populate users and causes', () => {
      return db
        .insert(testUsers)
        .into('users')
        .then(() => {
          return db
            .insert(testCauses)
            .into('causes');
        });
    });

    it('getAllOrganizations() returns an empty array', () => {
      return OrganizationsService.getAllOrganizations(db)
        .then((result) => expect(result).to.eql([]));
    });

    it('getAllFullOrganizations() returns an empty array', () => {
      return OrganizationsService.getAllFullOrganizations(db)
        .then((results) => expect(results).to.eql([]));
    });

    it(
      `insertOrganization() inserts the organization and causes and returns the new organization`, 
      () => {
        const newOrg = {
          org_name: 'New Org',
          website: 'https://www.org.com',
          phone: '555-867-5309',
          email: 'contact@org.com',
          org_address: '123 Fake Street',
          org_desc: 'A description for New Org',
          causes: [testCauses[0], testCauses[1]],
          creator: testUsers[0]
        };
        const expectedOrg = {
          id: 1,
          org_name: newOrg.org_name,
          website: newOrg.website,
          phone: newOrg.phone,
          email: newOrg.email,
          org_address: newOrg.org_address,
          org_desc: newOrg.org_desc,
          creator: testUsers[0].id
        };
        const expectedOrgCauses = [
          {
            org_id: 1,
            cause_id: testCauses[0].id
          },
          {
            org_id: 1,
            cause_id: testCauses[1].id
          }
        ];

        return OrganizationsService.insertOrganization(db, newOrg)
          .then((result) => expect(result).to.eql(expectedOrg))
          .then(() => OrganizationsService.getAllOrganizations(db))
          .then((orgResults) => {
            expect(orgResults).to.eql([expectedOrg]);
            return orgResults[0].id;
          })
          .then((orgId) => OrgCausesService.getByOrgId(db, orgId))
          .then((orgCauseResults) => expect(orgCauseResults).to.eql(expectedOrgCauses));
      });
  });

  context('Given table has organizations', () => {
    const testUsers = makeUsersArray();
    const testOrgs = makeOrganizationsArray();
    const testCauses = makeCausesArray();
    const testOrgCauses = makeOrgCausesArray();
    const testFullOrgs = makeFullOrganizationsArray(testOrgs, testCauses, testOrgCauses, testUsers);

    beforeEach('Populate users, organizations, causes, and org_causes', () => {
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
    
    it(`getAllOrganizations() returns all organizations from 'organizations'`, () => {
      return OrganizationsService.getAllOrganizations(db)
        .then((result) => expect(result).to.eql(testOrgs));
    });

    it(`getAllFullOrganizations() returns all organizations from 'organizations', combined with their causes and creator`, 
      () => {
        return OrganizationsService.getAllFullOrganizations(db)
          .then((results) => expect(results).to.eql(testFullOrgs));
      });

    it(`getById() returns the organization with the provided id`, () => {
      const id = 1;
      return OrganizationsService.getById(db, id)
        .then((result) => expect(result).to.eql(testOrgs[id - 1]));
    });

    it('getFullById() returns the org with id, combined with its causes', () => {
      const id = 1;
      return OrganizationsService.getFullById(db, id)
        .then((result) => expect(result).to.eql(testFullOrgs[id - 1]));
    });

    it(`updateOrganization() updates the organization with the provided id`, () => {
      const id = 1;
      const newFields = {
        org_name: 'Updated Name',
        website: 'https://www.updated.com',
        phone: '1-800-123-4567',
        email: 'contact@updated.com',
        org_address: '1 Updated Street',
        org_desc: 'The description has been updated.',
        causes: [testCauses[2], testCauses[3]],
        creator: testUsers[2]
      };

      const expectedOrg = {
        id,
        org_name: newFields.org_name,
        website: newFields.website,
        phone: newFields.phone,
        email: newFields.email,
        org_address: newFields.org_address,
        org_desc: newFields.org_desc,
        creator: newFields.creator.id
      };

      const expectedOrgCauses = [
        {
          org_id: id,
          cause_id: testCauses[2].id
        },
        {
          org_id: id,
          cause_id: testCauses[3].id
        }
      ];

      return OrganizationsService.updateOrganization(db, id, newFields)
        .then(() => OrganizationsService.getById(db, id))
        .then((orgResult) => {
          expect(orgResult).to.eql(expectedOrg);
          return orgResult.id;
        })
        .then((orgId) => OrgCausesService.getByOrgId(db, orgId))
        .then((orgCauseResults) => expect(orgCauseResults).to.eql(expectedOrgCauses));
    });

    it(
      `deleteOrganization() deletes the organization with id, and removes its causes from 'org_causes'`, 
      () => {
        const id = 1;

        return OrganizationsService.deleteOrganization(db, id)
          .then(() => OrganizationsService.getAllOrganizations(db))
          .then((orgResults) => expect(orgResults).to.eql(testOrgs.filter((org) => org.id !== id)))
          .then(() => OrgCausesService.getByOrgId(db, id))
          .then((orgCauseResults) => expect(orgCauseResults).to.eql([]));
      });
  });
});
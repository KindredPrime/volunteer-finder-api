const knex = require('knex');
const OrganizationsService = require('../src/organizations/organizations-service');
const { makeUsersArray } = require('./fixtures');
const { makeOrganizationsArray } = require('./organizations-fixtures');

describe('OrganizationsService', () => {
  let db;
  before('Connect to the database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
  });

  afterEach('Clear tables', () => db.raw('TRUNCATE users, organizations RESTART IDENTITY CASCADE'));

  after('Disconnect from database', () => db.destroy());

  context('Given no organizations', () => {
    const testUsers = makeUsersArray();

    beforeEach('Populate users table', () => {
      return db
        .insert(testUsers)
        .into('users');
    });

    it('getAllOrganizations() returns an empty array', () => {
      return OrganizationsService.getAllOrganizations(db)
        .then((result) => expect(result).to.eql([]));
    });

    it(
      `insertOrganization() inserts the organization and returns the new organization with its id`, 
      () => {
        const newOrg = {
          org_name: 'New Org',
          website: 'https://www.org.com',
          phone: '555-867-5309',
          email: 'contact@org.com',
          org_address: '123 Fake Street',
          org_desc: 'A description for New Org',
          creator: 1
        };
        return OrganizationsService.insertOrganization(db, newOrg)
          .then((result) => {
            expect(result).to.eql({
              id: 1,
              ...newOrg
            });
          });
      });
  });

  context('Given table has organizations', () => {
    const testUsers = makeUsersArray();
    const testOrgs = makeOrganizationsArray();

    beforeEach('Populate the users and organizations tables', () => {
      return db
        .insert(testUsers)
        .into('users')
        .then(() => {
          return db
            .insert(testOrgs)
            .into('organizations');
        });
    });
    
    it(`getAllOrganizations() returns all organizations from 'organizations' table`, () => {
      return OrganizationsService.getAllOrganizations(db)
        .then((result) => expect(result).to.eql(testOrgs));
    });

    it(`getById() returns the organization with the provided id`, () => {
      const id = 1;
      return OrganizationsService.getById(db, id)
        .then((result) => expect(result).to.eql(testOrgs[id - 1]));
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
        creator: 2
      };

      return OrganizationsService.updateOrganization(db, id, newFields)
        .then(() => OrganizationsService.getById(db, id))
        .then((result) => expect(result).to.eql({
          id,
          ...newFields
        }));
    });
  });
});
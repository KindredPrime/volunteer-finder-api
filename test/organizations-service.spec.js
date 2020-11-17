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

  //afterEach(): clear table
  afterEach('Clear tables', () => db.raw('TRUNCATE users, organizations RESTART IDENTITY CASCADE'));

  after('Disconnect from database', () => db.destroy());

  context('Given no organizations', () => {
    it('getAllOrganizations() returns an empty array', () => {
      return OrganizationsService.getAllOrganizations(db)
        .then((result) => expect(result).to.eql([]));
    });
  });

  context('Given table has organizations', () => {
    const testUsers = makeUsersArray();
    const testOrgs = makeOrganizationsArray();

    beforeEach('Populate the database', () => {
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
  });
});
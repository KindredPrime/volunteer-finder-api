const app = require('../src/app');
const knex = require('knex');
const { makeUsersArray, testValidationFields } = require('./fixtures');
const { makeOrganizationsArray, makeMaliciousOrg } = require('./organizations-fixtures');

describe('Organizations Endpoints', () => {
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

      it('Responds with 200 and the organizations, without their XSS content', () => {
        return supertest(app)
          .get('/api/orgs')
          .expect(200, [expectedOrg]);
      });
    });
  });

  describe('GET /api/orgs/:id', () => {
    context('Given no organizations', () => {
      it('Responds with 404 and an error message', () => {
        const id = 1000;
        return supertest(app)
          .get(`/api/orgs/${id}`)
          .expect(404, {
            message: `Organization with id ${id} does not exist`
          });
      });
    });

    context('Given the table has organizations', () => {
      const testUsers = makeUsersArray();
      const testOrgs = makeOrganizationsArray();

      beforeEach('Populate users and organizations', () => {
        return db
          .insert(testUsers)
          .into('users')
          .then(() => {
            return db
              .insert(testOrgs)
              .into('organizations');
          });
      });

      it('Responds with 200 and the organization with the id', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/orgs/${id}`)
          .expect(200, testOrgs[id - 1]);
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

      it('Responds with 200 and the organization with id, without its XSS attack content', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/orgs/${id}`)
          .expect(200, expectedOrg);
      });
    });
  });

  describe('POST /api/orgs', () => {
    const testUsers = makeUsersArray();

    beforeEach('Populate users table', () => {
      return db
        .insert(testUsers)
        .into('users');
    });

    it(`Responds with 201 and the created organization, and adds the organization to the database`, () => {
      const newOrg = {
        org_name: 'New Org',
        website: 'https://www.new-org.com',
        phone: '1-800-123-4567',
        email: 'contact@new-org.com',
        org_address: '1 New Street',
        org_desc: 'A description for New Org',
        creator: 1
      };
      return supertest(app)
        .post('/api/orgs')
        .send(newOrg)
        .expect(201)
        .expect((res) => {
          const resOrg = res.body;
          expect(resOrg).to.have.property('id');
          expect(resOrg.org_name).to.eql(newOrg.org_name);
          expect(resOrg.website).to.eql(newOrg.website);
          expect(resOrg.phone).to.eql(newOrg.phone);
          expect(resOrg.email).to.eql(newOrg.email);
          expect(resOrg.org_address).to.eql(newOrg.org_address);
          expect(resOrg.org_desc).to.eql(newOrg.org_desc);
          expect(resOrg.creator).to.eql(newOrg.creator);
          expect(res.headers.location).to.eql(`/api/orgs/${resOrg.id}`);
        })
        .then((postRes) => {
          const { id } = postRes.body;
          const expectedOrg = {
            id,
            ...newOrg
          };

          return supertest(app)
            .get(postRes.headers.location)
            .expect(200, expectedOrg);
        });
    });

    /*
      Test Validation Errors
    */
    const validationOrg = {
      org_name: 'Org Name',
      website: 'https://www.website.com',
      phone: '111-111-1111',
      email: 'contact@website.com',
      org_address: '123 Org Street Org City, Org State',
      org_desc: 'Org description text',
      creator: 1
    };

    const requiredFieldErrors = {
      org_name: [`'org_name' is missing from the request body`, `'org_name' must be a string`],
      org_desc: [`'org_desc' is missing from the request body`, `'org_desc' must be a string`],
      creator: [`'creator' is missing from the request body`, `'creator' must be a number`]
    };
    testValidationFields(
      app,
      'POST',
      (fieldName) => `Responds with 400 and an error message when ${fieldName} is missing`,
      'post',
      () => '/api/orgs',
      requiredFieldErrors,
      validationOrg,
      (org, fieldName) => {
        delete org[fieldName];
        return org;
      }
    );

    const stringFieldErrors = {
      org_name: [`'org_name' must be a string`],
      website: [`'website' must be a string`],
      phone: [`'phone' must be a string`],
      email: [`'email' must be a string`],
      org_address: [`'org_address' must be a string`],
      org_desc: [`'org_desc' must be a string`]
    }
    testValidationFields(
      app,
      'POST',
      (fieldName) => `Responds with 400 and an error message when ${fieldName} isn't a string`,
      'post',
      () => '/api/orgs',
      stringFieldErrors,
      validationOrg,
      (org, fieldName) => {
        org[fieldName] = 6;
        return org;
      }
    );

    const numberFieldErrors = {
      creator: [`'creator' must be a number`]
    };
    testValidationFields(
      app,
      'POST',
      (fieldName) => `Responds with 400 and an error message when ${fieldName} isn't a number`,
      'post',
      () => '/api/orgs',
      numberFieldErrors,
      validationOrg,
      (org, fieldName) => {
        org[fieldName] = '6';
        return org;
      }
    );

    context('Given XSS attack content', () => {
      const { maliciousOrg, expectedOrg } = makeMaliciousOrg();

      it('Responds with 201 and the created organization, without its XSS content', () => {
        return supertest(app)
          .post('/api/orgs')
          .send(maliciousOrg)
          .expect(201, expectedOrg);
      });
    });
  });

  describe('PATCH /api/orgs/:id', () => {
    context('Given no organizations', () => {
      it('Responds with 404 and an error message', () => {
        const id = 1000;
        const newFields = {
          org_name: 'Updated Name',
          website: 'https://www.updated-org.com',
          phone: '132-645-0798',
          email: 'contact@updated-org.com',
          org_address: '1 Updated Street Updated City, Updated State',
          org_desc: 'A description that has been updated',
          creator: 2
        };

        return supertest(app)
          .patch(`/api/orgs/${id}`)
          .send(newFields)
          .expect(404, { message: `Organization with id ${id} does not exist` });
      });
    });

    context('Given the table has organizations', () => {
      const testUsers = makeUsersArray();
      const testOrgs = makeOrganizationsArray();

      beforeEach('Populate users and organizations', () => {
        return db
          .insert(testUsers)
          .into('users')
          .then(() => {
            return db
              .insert(testOrgs)
              .into('organizations');
          });
      });

      it('Responds with 204 and updates the organization with the id', () => {
        const id = 1;
        const newFields = {
          org_name: 'Updated Name',
          website: 'https://www.updated-org.com',
          phone: '132-645-0798',
          email: 'contact@updated-org.com',
          org_address: '1 Updated Street Updated City, Updated State',
          org_desc: 'A description that has been updated',
          creator: 2
        };

        return supertest(app)
          .patch(`/api/orgs/${id}`)
          .send(newFields)
          .expect(201)
          .then(() => {
            return supertest(app)
              .get(`/api/orgs/${id}`)
              .expect(200, {
                id,
                ...newFields
              });
          });
      });

      it('Responds with 400 and an error message when no organization fields are provided', () => {
        const id = 1;
        return supertest(app)
          .patch(`/api/orgs/${id}`)
          .send({ irrelevant: 'foo' })
          .expect(400, { 
            message: `Request body must include 'org_name', 'website', 'phone', 'email', 'org_address', 'org_desc', or 'creator'`
          });
      });

      /*
        Test Validation Errors
      */
      const validationOrg = {
        org_name: 'Org Name',
        website: 'https://www.website.com',
        phone: '111-111-1111',
        email: 'contact@website.com',
        org_address: '123 Org Street Org City, Org State',
        org_desc: 'Org description text',
        creator: 1
      };

      const stringFieldErrors = {
        org_name: [`'org_name' must be a string`],
        website: [`'website' must be a string`],
        phone: [`'phone' must be a string`],
        email: [`'email' must be a string`],
        org_address: [`'org_address' must be a string`],
        org_desc: [`'org_desc' must be a string`]
      }
      testValidationFields(
        app,
        'PATCH',
        (fieldName) => `Responds with 400 and an error message when ${fieldName} isn't a string`,
        'patch',
        (id) => `/api/orgs/${id}`,
        stringFieldErrors,
        validationOrg,
        (org, fieldName) => {
          org[fieldName] = 6;
          return org;
        }
      );

      const numberFieldErrors = {
        creator: [`'creator' must be a number`]
      };
      testValidationFields(
        app,
        'PATCH',
        (fieldName) => `Responds with 400 and an error message when ${fieldName} isn't a number`,
        'patch',
        (id) => `/api/orgs/${id}`,
        numberFieldErrors,
        validationOrg,
        (org, fieldName) => {
          org[fieldName] = 'six';
          return org;
        }
      );
    });
  });

  describe('DELETE /api/orgs/:id', () => {
    context('Given no organizations', () => {
      it('Responds with 404 and an error message', () => {
        const id = 1000;
        return supertest(app)
          .delete(`/api/orgs/${id}`)
          .expect(404, { message: `Organization with id ${id} does not exist` });
      });
    });

    context('Given the table has organizations', () => {
      const testUsers = makeUsersArray();
      const testOrgs = makeOrganizationsArray();

      beforeEach('Populate users and organizations', () => {
        return db
          .insert(testUsers)
          .into('users')
          .then(() => {
            return db
              .insert(testOrgs)
              .into('organizations');
          });
      });

      it(
        `Responds with 204 and removes the organization with the id from the 'organizations' table`,
        () => {
          const id = 1;
          return supertest(app)
            .delete(`/api/orgs/${id}`)
            .expect(204)
            .then(() => {
              return supertest(app)
                .get(`/api/orgs`)
                .expect(200, testOrgs.filter((org) => org.id !== id));
            });
        });
    });
  });
});
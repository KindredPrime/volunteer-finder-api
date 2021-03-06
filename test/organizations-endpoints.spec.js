const app = require('../src/app');
const knex = require('knex');
const _ = require('lodash');
const { testValidationFields } = require('./fixtures');
const {
  makeOrganizationsArray,
  makeMaliciousOrg,
  makeFullOrganizationsArray
} = require('./organizations-fixtures');
const { makeCausesArray, makeMaliciousCause } = require('./causes-fixtures');
const { makeOrgCausesArray } = require('./org_causes-fixtures');

describe('Organizations Endpoints', () => {
  let db;
  before('Connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });

    app.set('db', db);
  });

  const truncateTables = 'TRUNCATE organizations, causes, org_causes RESTART IDENTITY CASCADE';

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
      const testOrgs = makeOrganizationsArray();
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();
      const testFullOrgs = makeFullOrganizationsArray(
        testOrgs, testCauses, testOrgCauses
      );

      beforeEach('Populate orgs, causes, and org_causes', () => {
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

      it('Responds with 200 and all organizations, with their causes', () => {
        return supertest(app)
          .get('/api/orgs')
          .expect(200, testFullOrgs);
      });

      it(`Responds with 200 and all full organizations that match the search term`, () => {

        /*
          One org has this term only in its name, another only in its address, and a third only in
          its description.
        */
        const term = 'virginia';
        const regEx = new RegExp(`.*${term}.*`, 'i');

        return supertest(app)
          .get('/api/orgs')
          .query({ term })
          .expect(200, testFullOrgs.filter((fullOrg) => {
            return regEx.test(fullOrg.org_name)
              || regEx.test(fullOrg.org_address)
              || regEx.test(fullOrg.org_desc);
          }));
      });

      it(
        'Responds with 200 and all full organizations that have any of the provided causes',
        () => {
          const causes = 'Youth,Animals';
          const causesArray = causes.split(',');
          return supertest(app)
            .get('/api/orgs')
            .query({ causes })
            .expect(200, testFullOrgs.filter((fullOrg) => {
              const fullOrgCauses = fullOrg.causes.map((cause) => cause.cause_name);
              return _.intersection(fullOrgCauses, causesArray).length > 0;
            }));
        });
    });

    context('Given XSS attack content', () => {
      const { maliciousCause } = makeMaliciousCause();
      const { maliciousOrg, maliciousOrgCause, sanitizedFullOrg } = makeMaliciousOrg();

      beforeEach('Insert malicious cause, malicious org, and org_cause', () => {
        return db
          .insert(maliciousCause)
          .into('causes')
          .then(() => {
            return db
              .insert(maliciousOrg)
              .into('organizations')
              .then(() => {
                return db
                  .insert(maliciousOrgCause)
                  .into('org_causes');
              });
          });
      });

      it('Responds with 200 and the full organizations, without their XSS content', () => {
        return supertest(app)
          .get('/api/orgs')
          .expect(200, [sanitizedFullOrg]);
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
      const testOrgs = makeOrganizationsArray();
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();
      const testFullOrgs = makeFullOrganizationsArray(
        testOrgs, testCauses, testOrgCauses
      );

      beforeEach('Populate organizations, causes, and org_causes', () => {
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

      it('Responds with 200 and the organization id, including its causes', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/orgs/${id}`)
          .expect(200, testFullOrgs[id - 1]);
      });
    });

    context('Given XSS attack content', () => {
      const { maliciousCause } = makeMaliciousCause();
      const { maliciousOrg, maliciousOrgCause, sanitizedFullOrg } = makeMaliciousOrg();

      beforeEach('Insert and malicious org', () => {
        return db
          .insert(maliciousOrg)
          .into('organizations')
          .then(() => {
            return db
              .insert(maliciousCause)
              .into('causes')
              .then(() => {
                return db
                  .insert(maliciousOrgCause)
                  .into('org_causes');
              });
          });
      });

      it(
        'Responds with 200 and the full organization with id, without its XSS attack content',
        () => {
          const id = 1;
          return supertest(app)
            .get(`/api/orgs/${id}`)
            .expect(200, sanitizedFullOrg);
        });
    });
  });

  describe('POST /api/orgs', () => {
    const testCauses = makeCausesArray();

    beforeEach('Populate causes', () => {
      return db
        .insert(testCauses)
        .into('causes');
    });

    it(
      `Responds with 201 and the created organization, and adds the organization to the database`,
      () => {
        const newOrg = {
          org_name: 'New Org',
          website: 'https://www.new-org.com',
          phone: '1-800-123-4567',
          email: 'contact@new-org.com',
          org_address: '1 New Street',
          org_desc: 'A description for New Org',
          causes: [testCauses[0]]
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
    -------------------------------
      Test Validation Errors
    -------------------------------
    */

    // Organization template to use for validation tests
    const validationFullOrg = {
      org_name: 'Org Name',
      website: 'https://www.website.com',
      phone: '111-111-1111',
      email: 'contact@website.com',
      org_address: '123 Org Street Org City, Org State',
      org_desc: 'Org description text',
      causes: [testCauses[0]]
    };

    // Expected validation errors for required fields
    const requiredFieldErrors = {
      org_name: [`'org_name' is missing from the request body`, `'org_name' must be a string`],
      org_desc: [`'org_desc' is missing from the request body`, `'org_desc' must be a string`]
    };
    testValidationFields(
      app,
      'POST',
      (fieldName) => `Responds with 400 and an error message when ${fieldName} is missing`,
      'post',
      () => '/api/orgs',
      requiredFieldErrors,
      validationFullOrg,
      (org, fieldName) => {
        delete org[fieldName];
        return org;
      }
    );

    // Expected validation errors for string fields
    const stringFieldErrors = {
      org_name: [`'org_name' must be a string`],
      website: [`'website' must be a string`],
      phone: [`'phone' must be a string`],
      email: [`'email' must be a string`],
      org_address: [`'org_address' must be a string`],
      org_desc: [`'org_desc' must be a string`]
    };
    testValidationFields(
      app,
      'POST',
      (fieldName) => `Responds with 400 and an error message when ${fieldName} isn't a string`,
      'post',
      () => '/api/orgs',
      stringFieldErrors,
      validationFullOrg,
      (org, fieldName) => {
        org[fieldName] = 6;
        return org;
      }
    );

    // Expected validation errors for the causes field array
    const causesFieldErrors = {
      causes: [
        `'causes' must be an array`
      ]
    };
    testValidationFields(
      app,
      'POST',
      () => `Responds with 400 and an error message when 'causes' isn't an array`,
      'post',
      () => '/api/orgs',
      causesFieldErrors,
      validationFullOrg,
      (org) => {
        org.causes = testCauses[0];

        return org;
      }
    );

    // Expected validation errors for fields within each cause of the causes field
    const causesElementErrors = {
      causes: [
        `the id of each cause in 'causes' must be a number`,
        `the 'cause_name' of each cause in 'causes' must be a string`
      ]
    };
    testValidationFields(
      app,
      'POST',
      () => `Responds with 400 and an error message when elements of 'causes' are invalid`,
      'post',
      () => '/api/orgs',
      causesElementErrors,
      validationFullOrg,
      (org) => {
        org.causes = [
          {
            id: 'six',
            cause_name: 6
          }
        ];

        return org;
      }
    );

    context('Given XSS attack content', () => {
      const { maliciousFullOrg, sanitizedOrg } = makeMaliciousOrg();

      it('Responds with 201 and the created organization, without its XSS content', () => {
        return supertest(app)
          .post('/api/orgs')
          .send(maliciousFullOrg)
          .expect(201, sanitizedOrg);
      });
    });
  });

  describe('PATCH /api/orgs/:id', () => {
    context('Given no organizations', () => {
      const testCauses = makeCausesArray();

      it('Responds with 404 and an error message', () => {
        const id = 1000;
        const newFields = {
          org_name: 'Updated Name',
          website: 'https://www.updated-org.com',
          phone: '132-645-0798',
          email: 'contact@updated-org.com',
          org_address: '1 Updated Street Updated City, Updated State',
          org_desc: 'A description that has been updated',
          causes: [testCauses[0]]
        };

        return supertest(app)
          .patch(`/api/orgs/${id}`)
          .send(newFields)
          .expect(404, { message: `Organization with id ${id} does not exist` });
      });
    });

    context('Given the table has organizations', () => {
      const testOrgs = makeOrganizationsArray();
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();

      beforeEach('Populate organizations, causes, and org_causes', () => {
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

      it('Responds with 204 and updates the organization with id', () => {
        const id = 1;
        const newFields = {
          org_name: 'Updated Name',
          website: 'https://www.updated-org.com',
          phone: '132-645-0798',
          email: 'contact@updated-org.com',
          org_address: '1 Updated Street Updated City, Updated State',
          org_desc: 'A description that has been updated',
          causes: [testCauses[0]]
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
            message: `Request body must include 'org_name', 'website', 'phone', 'email', 'org_address', 'org_desc', or 'causes'`
          });
      });

      /*
      -------------------------------
      Test Validation Errors
      -------------------------------
      */

      // Organization template to use for validation tests
      const validationFullOrg = {
        org_name: 'Org Name',
        website: 'https://www.website.com',
        phone: '111-111-1111',
        email: 'contact@website.com',
        org_address: '123 Org Street Org City, Org State',
        org_desc: 'Org description text',
        causes: [testCauses[0]]
      };

      // Expected validation errors for string fields
      const stringFieldErrors = {
        org_name: [`'org_name' must be a string`],
        website: [`'website' must be a string`],
        phone: [`'phone' must be a string`],
        email: [`'email' must be a string`],
        org_address: [`'org_address' must be a string`],
        org_desc: [`'org_desc' must be a string`]
      };
      testValidationFields(
        app,
        'PATCH',
        (fieldName) => `Responds with 400 and an error message when ${fieldName} isn't a string`,
        'patch',
        (id) => `/api/orgs/${id}`,
        stringFieldErrors,
        validationFullOrg,
        (org, fieldName) => {
          org[fieldName] = 6;
          return org;
        }
      );

      // Expected validation errors for causes field array
      const causesFieldErrors = {
        causes: [
          `'causes' must be an array`
        ]
      };
      testValidationFields(
        app,
        'PATCH',
        () => `Responds with 400 and an error message when 'causes' isn't an array`,
        'patch',
        (id) => `/api/orgs/${id}`,
        causesFieldErrors,
        validationFullOrg,
        (org) => {
          org.causes = testCauses[0];

          return org;
        }
      );

      // Expected validation errors for elements within each cause of the causes field
      const causesElementErrors = {
        causes: [
          `the id of each cause in 'causes' must be a number`,
          `the 'cause_name' of each cause in 'causes' must be a string`
        ]
      };
      testValidationFields(
        app,
        'PATCH',
        () => `Responds with 400 and an error message when elements of 'causes' are invalid`,
        'patch',
        (id) => `/api/orgs/${id}`,
        causesElementErrors,
        validationFullOrg,
        (org) => {
          org.causes = [
            {
              id: 'six',
              cause_name: 6
            }
          ];

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
      const testOrgs = makeOrganizationsArray();
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();
      const testFullOrgs = makeFullOrganizationsArray(
        testOrgs, testCauses, testOrgCauses
      );

      beforeEach('Populate organizations, causes, and org_causes', () => {
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

      it(
        `Responds with 204, removes organization with id from 'organizations'`,
        () => {
          const id = 1;
          return supertest(app)
            .delete(`/api/orgs/${id}`)
            .expect(204)
            .then(() => {
              return supertest(app)
                .get(`/api/orgs`)
                .expect(200, testFullOrgs.filter((org) => org.id !== id));
            });
        });
    });
  });
});
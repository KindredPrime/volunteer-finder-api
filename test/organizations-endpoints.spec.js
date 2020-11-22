const app = require('../src/app');
const knex = require('knex');
const { 
  makeUsersArray,
  makeOrganizationsArray,
  makeCausesArray,
  makeOrgCausesArray,
  testValidationFields
} = require('./fixtures');
const { makeMaliciousOrg, makeFullOrganizationsArray } = require('./organizations-fixtures');
const { makeMaliciousUser } = require('./users-fixtures');
const { makeMaliciousCause } = require('./causes-fixtures');

describe('Organizations Endpoints', () => {
  let db;
  before('Connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });

    app.set('db', db);
  });

  const truncateTables = 'TRUNCATE users, organizations, causes, org_causes RESTART IDENTITY CASCADE';

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
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();
      const fullTestOrgs = makeFullOrganizationsArray(
        testOrgs, testCauses, testOrgCauses, testUsers
      );

      beforeEach('Populate users, orgs, causes, and org_causes', () => {
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

      it('Responds with 200 and all organizations, with their causes and creator', () => {
        return supertest(app)
          .get('/api/orgs')
          .expect(200, fullTestOrgs);
      });
    });

    context('Given XSS attack content', () => {
      const { maliciousUser } = makeMaliciousUser();
      const { maliciousCause } = makeMaliciousCause();
      const { maliciousOrg, maliciousOrgCause, sanitizedFullOrg } = makeMaliciousOrg();

      beforeEach('Insert malicious user, malicious cause, malicious org, and org_cause', () => {
        return db
          .insert(maliciousUser)
          .into('users')
          .then(() => {
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
      const testUsers = makeUsersArray();
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();
      const fullTestOrgs = makeFullOrganizationsArray(
        testOrgs, testCauses, testOrgCauses, testUsers
      );

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

      it('Responds with 200 and the organization id, including its causes and creator', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/orgs/${id}`)
          .expect(200, fullTestOrgs[id - 1]);
      });
    });

    context('Given XSS attack content', () => {
      const { maliciousUser } = makeMaliciousUser();
      const { maliciousCause } = makeMaliciousCause();
      const { maliciousOrg, maliciousOrgCause, sanitizedFullOrg } = makeMaliciousOrg();

      beforeEach('Insert users and malicious org', () => {
        return db
          .insert(maliciousUser)
          .into('users')
          .then(() => {
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

    it(
      `Responds with 201 and the created organization, adds the organization to the database`, 
      () => {
        const newOrg = {
          org_name: 'New Org',
          website: 'https://www.new-org.com',
          phone: '1-800-123-4567',
          email: 'contact@new-org.com',
          org_address: '1 New Street',
          org_desc: 'A description for New Org',
          causes: [testCauses[0]],
          creator: testUsers[0]
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
            expect(resOrg.creator).to.eql(newOrg.creator.id);
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
    const validationFullOrg = {
      org_name: 'Org Name',
      website: 'https://www.website.com',
      phone: '111-111-1111',
      email: 'contact@website.com',
      org_address: '123 Org Street Org City, Org State',
      org_desc: 'Org description text',
      causes: [testCauses[0]],
      creator: testUsers[0]
    };

    const requiredFieldErrors = {
      org_name: [`'org_name' is missing from the request body`, `'org_name' must be a string`],
      org_desc: [`'org_desc' is missing from the request body`, `'org_desc' must be a string`],
      creator: [
        `'creator' is missing from the request body`,
        `creator id must be a number; creator username must be a string; creator email must be a string`
      ]
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

    const creatorFieldErrors = {
      creator: [
        `creator id must be a number`,
        'creator username must be a string',
        'creator email must be a string'
      ]
    };
    testValidationFields(
      app,
      'POST',
      () => `Responds with 400 and an error message when 'creator' has invalid fields`,
      'post',
      () => '/api/orgs',
      creatorFieldErrors,
      validationFullOrg,
      (org) => {
        org.creator = {
          id: 'six',
          username: 6,
          email: 6
        };

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
      const testUsers = makeUsersArray();
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
          causes: [testCauses[0]],
          creator: testUsers[1]
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
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();
      const fullTestOrgs = makeFullOrganizationsArray(
        testOrgs, testCauses, testOrgCauses, testUsers
      );

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

      it('Responds with 204 and updates the organization with id', () => {
        const id = 1;
        const newFields = {
          org_name: 'Updated Name',
          website: 'https://www.updated-org.com',
          phone: '132-645-0798',
          email: 'contact@updated-org.com',
          org_address: '1 Updated Street Updated City, Updated State',
          org_desc: 'A description that has been updated',
          causes: [testCauses[0]],
          creator: testUsers[1]
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
            message: `Request body must include 'org_name', 'website', 'phone', 'email', 'org_address', 'org_desc', 'causes', or 'creator'`
          });
      });

      /*
        Test Validation Errors
      */
      const validationFullOrg = {
        org_name: 'Org Name',
        website: 'https://www.website.com',
        phone: '111-111-1111',
        email: 'contact@website.com',
        org_address: '123 Org Street Org City, Org State',
        org_desc: 'Org description text',
        causes: [testCauses[0]],
        creator: testUsers[0]
      };

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

      const creatorFieldErrors = {
        creator: [
          `creator id must be a number`,
          'creator username must be a string',
          'creator email must be a string'
        ]
      };
      testValidationFields(
        app,
        'POST',
        () => `Responds with 400 and an error message when 'creator' has invalid fields`,
        'post',
        () => '/api/orgs',
        creatorFieldErrors,
        validationFullOrg,
        (org) => {
          org.creator = {
            id: 'six',
            username: 6,
            email: 6
          };

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
      const testCauses = makeCausesArray();
      const testOrgCauses = makeOrgCausesArray();
      const fullTestOrgs = makeFullOrganizationsArray(
        testOrgs, testCauses, testOrgCauses, testUsers
      );

      beforeEach('Populate users and organizations', () => {
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
                .expect(200, fullTestOrgs.filter((org) => org.id !== id));
            });
        });
    });
  });
});
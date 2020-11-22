const knex = require('knex');
const app = require('../src/app');
const { testValidationFields } = require('./fixtures');
const { makeUsersArray, makeMaliciousUser } = require('./users-fixtures');

describe('Users Endpoints', () => {
  let db;
  before('Connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });

    app.set('db', db);
  });

  const truncateTables = 'TRUNCATE users RESTART IDENTITY CASCADE';

  before('Clear tables', () => db.raw(truncateTables));

  afterEach('Clean up tables', () => db.raw(truncateTables));

  after('Disconnect from database', () => db.destroy());

  describe('GET /api/users', () => {
    context('Given no users', () => {
      it('Responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, []);
      });
    });

    context('Given the table has users', () => {
      const testUsers = makeUsersArray();

      beforeEach('Populate users', () => {
        return db
          .insert(testUsers)
          .into('users');
      });

      it('Responds with 200 and all users', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, testUsers);
      });
    });

    context('Given users with XSS attack content', () => {
      const { maliciousUser, sanitizedUser } = makeMaliciousUser();

      beforeEach('Populate users with malicious content', () => {
        return db
          .insert(maliciousUser)
          .into('users');
      });

      it('Responds with 200 and all users, without their XSS content', () => {
        return supertest(app)
          .get('/api/users')
          .expect(200, [sanitizedUser]);
      });
    });
  });

  describe('GET /api/users/:id', () => {
    context('Given no users', () => {
      it('Responds with 404 and an error message', () => {
        const id = 1000;
        return supertest(app)
          .get(`/api/users/${id}`)
          .expect(404, { message: `User with id ${id} does not exist` });
      });
    });

    context('Given the table has users', () => {
      const testUsers = makeUsersArray();

      beforeEach('Populate users', () => {
        return db
          .insert(testUsers)
          .into('users');
      });

      it('Responds with 200 and the user with id', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/users/${id}`)
          .expect(200, testUsers[id - 1]);
      });
    });

    context('Given the user has XSS attack content', () => {
      const { maliciousUser, sanitizedUser } = makeMaliciousUser();

      beforeEach('Populate users with malicious content', () => {
        return db
          .insert(maliciousUser)
          .into('users');
      });

      it('Responds with 200 and the user with id, without its XSS content', () => {
        const id = 1;
        return supertest(app)
          .get(`/api/users/${id}`)
          .expect(200, sanitizedUser);
      });
    });
  });

  describe('POST /api/users', () => {
    it('Responds with 201 and the created user, and adds it to database', () => {
      const newUser = {
        email: 'newUser@gmail.com',
        username: 'newUser'
      };

      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          const resUser = res.body;
          expect(resUser).to.have.property('id');
          expect(resUser.email).to.eql(newUser.email);
          expect(resUser.username).to.eql(newUser.username);
          expect(res.headers.location).to.eql(`/api/users/${resUser.id}`);
        })
        .then((postRes) => {
          return supertest(app)
            .get(postRes.headers.location)
            .expect(200, {
              id: postRes.body.id,
              ...newUser
            });
        });
    });

    /*
      Test Validation Errors
    */
    const validationUser = {
      username: 'validationUser',
      email: 'validationEmail@email.com'
    };

    const requiredFieldErrors = {
      username: [`'username' is missing from the request body`, `'username' must be a string`],
      email: [`'email' is missing from the request body`, `'email' must be a string`],
    };
    testValidationFields(
      app,
      'POST',
      (fieldName) => `Responds with 400 and an error message when ${fieldName} is missing`,
      'post',
      () => '/api/users',
      requiredFieldErrors,
      validationUser,
      (user, fieldName) => {
        delete user[fieldName];
        return user;
      }
    );

    const stringFieldErrors = {
      username: [`'username' must be a string`],
      email: [`'email' must be a string`],
    };
    testValidationFields(
      app,
      'POST',
      (fieldName) => `Responds with 400 and an error message when ${fieldName} is not a string`,
      'post',
      () => '/api/users',
      stringFieldErrors,
      validationUser,
      (user, fieldName) => {
        user[fieldName] = 6;
        return user;
      }
    );

    context('Given the new user has XSS attack content', () => {
      it('Responds with 201 and the new user, without its XSS content', () => {
        const { maliciousUser, sanitizedUser } = makeMaliciousUser();
        return supertest(app)
          .post('/api/users')
          .send(maliciousUser)
          .expect(201, sanitizedUser);
      });
    });
  });

  describe('PATCH /api/users/:id', () => {
    context('Given no users', () => {
      it('Responds with 404 and an error message', () => {
        const id = 1000;
        const newFields = {
          email: 'updatedUser@gmail.com',
          username: 'updatedUser'
        };

        return supertest(app)
          .patch(`/api/users/${id}`)
          .send(newFields)
          .expect(404, { message: `User with id ${id} does not exist` });
      });
    });

    context('Given the table has users', () => {
      const testUsers = makeUsersArray();

      beforeEach('Populate users', () => {
        return db
          .insert(testUsers)
          .into('users');
      });

      it(`Responds with 204 and updates the user in 'users'`, () => {
        const id = 1;
        const newFields = {
          email: 'updatedUser@gmail.com',
          username: 'updatedUser'
        };

        return supertest(app)
          .patch(`/api/users/${id}`)
          .send(newFields)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get(`/api/users/${id}`)
              .expect(200, {
                id,
                ...newFields
              });
          });
      });

      it('Responds with 400 and an error message if no fields provided', () => {
        const id = 1;
        return supertest(app)
          .patch(`/api/users/${id}`)
          .send({ irrelevant: 'foo' })
          .expect(400, { message: `Request body must include 'username' or 'email'` });
      });

      /*
        Test Validation Errors
      */
      const validationUser = {
        username: 'validationUser',
        email: 'validationEmail@email.com'
      };

      const stringFieldErrors = {
        username: [`'username' must be a string`],
        email: [`'email' must be a string`],
      };
      testValidationFields(
        app,
        'PATCH',
        (fieldName) => `Responds with 400 and an error message when ${fieldName} is not a string`,
        'patch',
        (id) => `/api/users/${id}`,
        stringFieldErrors,
        validationUser,
        (user, fieldName) => {
          user[fieldName] = 6;
          return user;
        }
      );
    });
  });
});
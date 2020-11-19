function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'email1@email.com',
      username: 'user1'
    },
    {
      id: 2,
      email: 'email2@email.com',
      username: 'user2'
    },
    {
      id: 3,
      email: 'email3@email.com',
      username: 'user3'
    }
  ];
}

function testValidationFields(app, testTitle, testDescriptionWriter, method, pathCreator, validationFieldErrors, entity, invalidator) {
  const id = 1;

  for(const [fieldName, fieldErrors] of Object.entries(validationFieldErrors)) {
    let invalidEntity = {};
    for(const [fieldName, fieldValue] of Object.entries(entity)) {
      invalidEntity[fieldName] = fieldValue;
    }

    it(`(testValidationFields) ${testTitle}: ${testDescriptionWriter(fieldName)}`, () => {
      invalidEntity = invalidator(invalidEntity, fieldName);

      return supertest(app)[method](pathCreator(id))
        .send(invalidEntity)
        .expect(400, { message: fieldErrors.join('; ') });
    });
  }
}

module.exports = {
  makeUsersArray,
  testValidationFields
};
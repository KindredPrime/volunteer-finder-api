function testValidationFields(
  app,
  testTitle,
  testDescriptionWriter,
  method,
  pathCreator,
  validationFieldErrors,
  entity,
  invalidator) {
    const id = 1;

    for(const [validationFieldName, fieldErrors] of Object.entries(validationFieldErrors)) {
      let invalidEntity = {};
      for(const [fieldName, fieldValue] of Object.entries(entity)) {
        invalidEntity[fieldName] = fieldValue;
      }

      it(
        `(testValidationFields) ${testTitle}: ${testDescriptionWriter(validationFieldName)}`,
        () => {
          invalidEntity = invalidator(invalidEntity, validationFieldName);

          return supertest(app)[method](pathCreator(id))
            .send(invalidEntity)
            .expect(400, { message: fieldErrors.join('; ') });
        });
    }
}

module.exports = {
  testValidationFields
};
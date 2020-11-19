const validateRequired = (fieldName) => (fieldValue) => {
  if (!fieldValue) {
    return `'${fieldName}' is missing from the request body`;
  }
};

const validateString = (fieldName) => (fieldValue) => {
  if (typeof fieldValue !== 'string') {
    return `'${fieldName}' must be a string`;
  }
}

const validateNumber = (fieldName) => (fieldValue) => {
  if (typeof fieldValue !== 'number') {
    return `'${fieldName}' must be a number`;
  }
}

/**
 * Validates fields of the provided entity
 * 
 * @param {*} validators - a list of fields to be validated and the functions used to validate them
 */
const validate = (validators) => (entity) => {
  const errors = [];
  for(const [fieldName, fs] of validators) {
    let fieldRequired = fs.find((f) => f.name === 'validateRequired');

    // skip testing if the field is missing and it isn't required
    if (!fieldRequired && !entity[fieldName]) {
      // do nothing
    }
    else {
      const vFs = fs.map((v) => v(fieldName));
      const errorMsgs = vFs.map((f) => f(entity[fieldName])).filter(Boolean);
      errors.push(...errorMsgs);
    }
  }

  return errors;
};

const validateOrganizationPost = validate([
  ['org_name', [validateRequired, validateString]],
  ['website', [validateString]],
  ['phone', [validateString]],
  ['email', [validateString]],
  ['org_address', [validateString]],
  ['org_desc', [validateRequired, validateString]],
  ['creator', [validateRequired, validateNumber]]
]);

const validateOrganizationPatch = (newFields) => {
  const errors = [];

  // check if any fields are provided
  const numFields = Object.values(newFields).filter(Boolean).length;
  if (numFields === 0) {
    errors.push(`Request body must include 'org_name', 'website', 'phone', 'email', 'org_address', 'org_desc', or 'creator'`);
    return errors;
  }

  // call validate method
  errors.push(...validate([
    ['org_name', [validateString]],
    ['website', [validateString]],
    ['phone', [validateString]],
    ['email', [validateString]],
    ['org_address', [validateString]],
    ['org_desc', [validateString]],
    ['creator', [validateNumber]]
  ])(newFields));

  return errors;
}

module.exports = {
  validateOrganizationPost,
  validateOrganizationPatch
};
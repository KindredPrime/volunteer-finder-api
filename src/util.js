const validateRequired = (fieldName) => (fieldValue) => {
  if (!fieldValue) {
    return `'${fieldName}' is missing from the request body`;
  }
};

const validateString = (fieldName) => (fieldValue) => {
  if (typeof fieldValue !== 'string') {
    return `'${fieldName}' must be a string`;
  }
};

const validateNumber = (fieldName) => (fieldValue) => {
  if (typeof fieldValue !== 'number') {
    return `'${fieldName}' must be a number`;
  }
};

const validateCauses = (causes) => {
  const errors = [];

  if (!Array.isArray(causes)) {
    errors.push(`'causes' must be an array`);
  }

  else {
    if (causes.find((cause) => typeof cause.id !== 'number')) {
      errors.push(`the id of each cause in 'causes' must be a number`);
    }

    if (causes.find((cause) => typeof cause.cause_name !== 'string')) {
      errors.push(`the 'cause_name' of each cause in 'causes' must be a string`);
    }
  }

  return errors.join('; ');
};

const validateCreator = (creator) => {
  const errors = [];
  if (!creator || validateNumber('creator.id')(creator.id)) {
    errors.push(`creator id must be a number`);
  }
  
  if (!creator || validateString('creator.username')(creator.username)) {
    errors.push('creator username must be a string');
  }

  if (!creator || validateString('creator.email')(creator.email)) {
    errors.push('creator email must be a string');
  }

  return errors.join('; ');
};

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
      const vFs = fs.map((v) => {
        return (v.name === 'validateCreator' || v.name === 'validateCauses')
          ? v 
          : v(fieldName);
      });
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
  ['causes', [validateCauses]],
  ['creator', [validateRequired, validateCreator]]
]);

const validateOrganizationPatch = (newFields) => {
  const errors = [];

  // check if any fields are provided
  const numFields = Object.values(newFields).filter(Boolean).length;
  if (numFields === 0) {
    errors.push(`Request body must include 'org_name', 'website', 'phone', 'email', 'org_address', 'org_desc', 'causes', or 'creator'`);
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
    ['causes', [validateCauses]],
    ['creator', [validateCreator]]
  ])(newFields));

  return errors;
}

const validateUserPost = validate([
  ['username', [validateRequired, validateString]],
  ['email', [validateRequired, validateString]]
]);

const validateUserPatch = (newFields) => {
  const errors = [];

  // check if any fields are provided
  const numFields = Object.values(newFields).filter(Boolean).length;
  if (numFields === 0) {
    return [`Request body must include 'username' or 'email'`];
  }

  // call validate method
  errors.push(...validate([
    ['username', [validateString]],
    ['email', [validateString]]
  ])(newFields));

  return errors;
};

module.exports = {
  validateOrganizationPost,
  validateOrganizationPatch,
  validateUserPost,
  validateUserPatch
};
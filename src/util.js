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

const validateCauses = (causes) => {
  const errors = [];

  if (!Array.isArray(causes)) {
    errors.push(`'causes' must be an array`);
  } else {
    if (causes.find((cause) => typeof cause.id !== 'number')) {
      errors.push(`the id of each cause in 'causes' must be a number`);
    }

    if (causes.find((cause) => typeof cause.cause_name !== 'string')) {
      errors.push(`the 'cause_name' of each cause in 'causes' must be a string`);
    }
  }

  return errors.join('; ');
};

/**
 * Validates fields of the provided entity, and returns a list of error messages for any fields
 * that fail.
 *
 * @param {Array} validators - A list of fields to be validated and the functions used to validate
 *  them. Format: [
 *    [<first field name>, [<validate function>, <other validate function>]],
 *    [<second field name>, [<validate function>, <other validate function>]]
 *  ]
 * @return {Array} errors
 */
const validate = (validators) => (entity) => {
  const errors = [];
  for(const [fieldName, fs] of validators) {
    let fieldRequired = fs.find((f) => f.name === 'validateRequired');

    // skip testing if the field is missing and it isn't required
    if (!fieldRequired && !entity[fieldName]) {

      // do nothing
    } else {

      // Supply the field name to each validate function
      const vFs = fs.map((v) => {
        return (v.name === 'validateCauses')
          ? v
          : v(fieldName);
      });

      /*
        Run the validate function with the field's value, and filter out any results that are
        falsy.
      */
      const errorMsgs = vFs.map((f) => f(entity[fieldName])).filter(Boolean);
      errors.push(...errorMsgs);
    }
  }

  return errors;
};

// Validates the fields in a POST request for Organizations
const validateOrganizationPost = validate([
  ['org_name', [validateRequired, validateString]],
  ['website', [validateString]],
  ['phone', [validateString]],
  ['email', [validateString]],
  ['org_address', [validateString]],
  ['org_desc', [validateRequired, validateString]],
  ['causes', [validateCauses]]
]);

// Validates the fields in a PATCH request for Organizations
const validateOrganizationPatch = (newFields) => {
  const errors = [];

  // check if any fields are provided
  const numFields = Object.values(newFields).filter(Boolean).length;
  if (numFields === 0) {
    errors.push(`Request body must include 'org_name', 'website', 'phone', 'email', ` +
    `'org_address', 'org_desc', or 'causes'`);
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
    ['causes', [validateCauses]]
  ])(newFields));

  return errors;
}

module.exports = {
  validateOrganizationPost,
  validateOrganizationPatch
};
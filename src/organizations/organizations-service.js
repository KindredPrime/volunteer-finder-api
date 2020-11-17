const OrganizationsService = {
  getAllOrganizations(db) {
    return db.select('*').from('organizations');
  },
  getById(db, id) {
    return db.select('*').from('organizations').where({ id }).first();
  },
  insertOrganization(db, org) {
    return db.insert(org).into('organizations').returning('*')
      .then((rows) => rows[0]);
  }
};

module.exports = OrganizationsService;
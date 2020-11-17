const OrganizationsService = {
  getAllOrganizations(db) {
    return db.select('*').from('organizations');
  },
  getById(db, id) {
    return db.select('*').from('organizations').where({ id }).first();
  }
};

module.exports = OrganizationsService;
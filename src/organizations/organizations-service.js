const OrganizationsService = {
  getAllOrganizations(db) {
    return db.select('*').from('organizations');
  }
};

module.exports = OrganizationsService;
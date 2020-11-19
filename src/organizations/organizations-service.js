const OrganizationsService = {
  getAllOrganizations(db) {
    return db.select('*').from('organizations');
  },
  getById(db, id) {
    return this.getAllOrganizations(db).where({ id }).first();
  },
  insertOrganization(db, org) {
    return db.insert(org).into('organizations').returning('*')
      .then((rows) => rows[0]);
  },
  updateOrganization(db, id, newFields) {
    return this.getById(db, id).update(newFields);
  },
  deleteOrganization(db, id) {
    return this.getById(db, id).del();
  }
};

module.exports = OrganizationsService;
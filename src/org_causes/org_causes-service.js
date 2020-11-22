const OrgCausesService = {
  getAllOrgCauses(db) {
    return db.select('*').from('org_causes');
  },
  getByOrgId(db, org_id) {
    return this.getAllOrgCauses(db).where({ org_id });
  },
  getByCauseId(db, cause_id) {
    return this.getAllOrgCauses(db).where({ cause_id });
  },
  insertOrgCause(db, orgCause) {
    return db.insert(orgCause).into('org_causes').returning('*')
      .then((results) => results[0]);
  },
  deleteOrgCause(db, org_id, cause_id) {
    return this.getAllOrgCauses(db).where({ org_id, cause_id }).del();
  }
};

module.exports = OrgCausesService;
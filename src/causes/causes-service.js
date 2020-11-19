const CausesService = {
  getAllCauses(db) {
    return db.select('*').from('causes');
  },
  getById(db, id) {
    return this.getAllCauses(db).where({ id }).first();
  },
  insertCause(db, cause) {
    return db.insert(cause).into('causes').returning('*')
      .then((results) => results[0]);
  },
  updateCause(db, id, newFields) {
    return this.getById(db, id).update(newFields);
  },
  deleteCause(db, id) {
    return this.getById(db, id).del();
  }
};

module.exports = CausesService;
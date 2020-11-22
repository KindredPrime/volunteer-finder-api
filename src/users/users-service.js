const UsersService = {
  getAllUsers(db) {
    return db.select('*').from('users');
  },
  getById(db, id) {
    return this.getAllUsers(db).where({ id }).first();
  },
  insertUser(db, newUser) {
    return db.insert(newUser).into('users').returning('*')
      .then((results) => results[0]);
  },
  updateUser(db, id, newFields) {
    return this.getById(db, id).update(newFields);
  },
  deleteUser(db, id) {
    return this.getById(db, id).del();
  }
};

module.exports = UsersService;
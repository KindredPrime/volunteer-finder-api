const OrgCausesService = require('../org_causes/org_causes-service');

const OrganizationsService = {
  _joinTables(db) {
    return db
      .select(
        'o.id as id',
        'org_name',
        'website',
        'phone',
        'o.email',
        'org_address',
        'org_desc',
        'c.id as cause_id',
        'cause_name'
      )
      .from('organizations as o')
      .leftJoin('org_causes as oc', 'o.id', 'oc.org_id')
      .leftJoin('causes as c', 'c.id', 'oc.cause_id');
  },
  getAllOrganizations(db) {
    return db.select('*').from('organizations');
  },
  getAllFullOrganizations(db, searchTerm='', causes) {
    let q = this._joinTables(db)
      .where(function() {
        return this.where('org_name', 'ilike', `%${searchTerm}%`)
          .orWhere('org_address', 'ilike', `%${searchTerm}%`)
          .orWhere('org_desc', 'ilike', `%${searchTerm}%`);
      });
      
    if (causes) {
      q = q.andWhere(function() {
        this.whereExists(function() {
          this.select('cause_name')
            .from('causes as c2')
            .join('org_causes as oc2', 'oc2.cause_id', 'c2.id')
            .join('organizations as o2', function() {
              this.on('o2.id', '=', 'o.id')
              this.andOn('o2.id', '=', 'oc2.org_id')
            })
            .whereIn('c2.cause_name', causes);
        });
      });
    }
      
    return q.orderBy('o.id').then(this._convertToJavaScript);
  },
  getById(db, id) {
    return this.getAllOrganizations(db).where({ id }).first();
  },
  getFullById(db, id) {
    return this._joinTables(db).where('o.id', id)
      .then(this._convertToJavaScript)
      .then((orgs) => orgs[0]);
  },
  insertOrganization(db, fullOrg) {
    const {
      org_name,
      website,
      phone,
      email,
      org_address,
      org_desc,
      causes
    } = fullOrg;

    const org = {
      org_name,
      website,
      phone,
      email,
      org_address,
      org_desc
    };

    return db.transaction((trx) => {
      return trx.insert(org).into('organizations').returning('*')
        .then((orgRows) => {
          const { id } = orgRows[0];
          const orgCauses = [];
          for(const cause of causes) {
            orgCauses.push({
              org_id: id,
              cause_id: cause.id
            });
          };

          return Promise.all(orgCauses.map((orgCause) => {
            return trx.insert(orgCause).into('org_causes');
          }))
            .then(() => orgRows[0]);
        });
    });
  },
  /**
   * Update the fields of the organization with any provided organization fields,
   * and update the org_causes table if any new causes are provided.
   * 
   * @param {*} db - The knex instance
   * @param {*} id - The id of the organization to update
   * @param {*} newFields - All of the organization-related fields to be updated
   */
  updateOrganization(db, id, newFields) {
    const { 
      org_name,
      website,
      phone,
      email,
      org_address,
      org_desc,
      causes
    } = newFields;

    const orgNewFields = {
      org_name,
      website,
      phone,
      email,
      org_address,
      org_desc
    };

    const newOrgCauses = causes.map((cause) => {
      return {
        org_id: id,
        cause_id: cause.id
      };
    });

    return db.transaction((trx) => {
      return trx
        .from('organizations')
        .where({ id })
        .update(orgNewFields)
        .then(() => {
          if (newOrgCauses.length > 0) {
            // Get existing org_causes for the org
            return OrgCausesService.getByOrgId(db, id)
              .then((oldOrgCauses) => {
                // Delete existing org_causes
                return Promise.all(oldOrgCauses.map((orgCause) => {
                  return OrgCausesService.deleteOrgCause(db, id, orgCause.cause_id);
                }));
              })
              .then(() => {
                // Add the new org_causes for the org
                return Promise.all(newOrgCauses.map((orgCause) => {
                  return OrgCausesService.insertOrgCause(db, orgCause);
                }));
              });
          }
        });
    });
  },
  deleteOrganization(db, id) {
    return this._joinTables(db).where({ id }).del();
  },
  _convertToJavaScript(rows) {
    const orgs = [];

    // Combine all rows for an org, each with a separate cause, into one org with several causes
    const seen = new Set();
    for(const row of rows) {
      const { id, cause_id, cause_name } = row;
  
      // This is only run if there is more than one cause for the organization
      if (seen.has(id)) {
        const org = orgs.find((elem) => elem.id === id);
        org.causes.push({ 
          id: cause_id,
          cause_name
        });
      }
      else {
        const org = Object.fromEntries(Object.entries(row));
        delete org.cause_name;
        delete org.cause_id;
  
        // If there are no causes, set 'causes' field to an empty array
        orgs.push({
          ...org,
          causes: cause_id 
            ? [{ 
              id: cause_id,
              cause_name
            }]
            : []
        });
  
        seen.add(id);
      }
    }
  
    return orgs;
  }
};

module.exports = OrganizationsService;
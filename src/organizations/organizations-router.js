const express = require('express');
const xss = require('xss');
const OrganizationsService = require('./organizations-service');
const logger = require('../logger');
const { validateOrganizationPost, validateOrganizationPatch } = require('../util');

const organizationsRouter = express.Router();
const bodyParser = express.json();

const sanitizeOrganization = (organization) => {
  const { org_name, website, phone, email, org_address, org_desc } = organization;
  return {
    ...organization,
    org_name: xss(org_name),
    website: xss(website),
    phone: xss(phone),
    email: xss(email),
    org_address: xss(org_address),
    org_desc: xss(org_desc)
  };
}

const sanitizeFullOrganization = (organization) => {
  const {
    causes
  } = organization;
  
  return {
    ...sanitizeOrganization(organization),
    causes: causes.map((cause) => (
      {
        ...cause,
        cause_name: xss(cause.cause_name)
      }
    ))
  };
}

organizationsRouter
  .route('/')
  // Return all organizations, along with their causes, optionally filtered by a search term and a
  // comma-separated list of causes
  .get((req, res, next) => {
    const { term, causes } = req.query;
    const causesArray = causes && causes.split(/,\s*/);
    return OrganizationsService.getAllFullOrganizations(req.app.get('db'), term, causesArray)
      .then((orgs) => {
        return res.json(orgs.map(sanitizeFullOrganization));
      })
      .catch(next);
  })
  // Post a full organization, with its causes, to the database and updates all associated tables
  .post(bodyParser, (req, res, next) => {
    const org = req.body;
    const errorMsgs = validateOrganizationPost(org);
    if (errorMsgs.length > 0) {
      const message = errorMsgs.join('; ');
      logger.error(`${req.method}: ${message}`);
      return res
        .status(400)
        .json({ message });
    }

    return OrganizationsService.insertOrganization(req.app.get('db'), org)
      .then((org) => {
        return res
          .location(`/api/orgs/${org.id}`)
          .status(201)
          .json(sanitizeOrganization(org));
      })
      .catch(next);
  });

organizationsRouter
  .route('/:id')
  .all((req, res, next) => {
    const { id } = req.params;
    return OrganizationsService.getFullById(req.app.get('db'), id)
      .then((org) => {
        if (!org) {
          const message = `Organization with id ${id} does not exist`;
          logger.error(`${req.method}: ${message}`);
          return res
            .status(404)
            .json({ message });
        }

        res.org = org;
        next();
      })
      .catch(next);
  })
  // Return the organization with the provided id, along with its causes
  .get((req, res, next) => {
    return res.json(sanitizeFullOrganization(res.org));
  })
  // Patch an existing organization, and its causes, updating all associated tables.
  .patch(bodyParser, (req, res, next) => {
    const { id } = req.params;
    const {
      org_name,
      website,
      phone,
      email,
      org_address,
      org_desc,
      causes
    } = req.body;
    const newFields = { org_name, website, phone, email, org_address, org_desc, causes };

    const errorMsgs = validateOrganizationPatch(newFields);
    if (errorMsgs.length > 0) {
      const message = errorMsgs.join('; ');
      logger.error(`${req.method}: ${message}`);
      return res
        .status(400)
        .json({ message });
    }

    return OrganizationsService.updateOrganization(req.app.get('db'), id, newFields)
      .then(() => {
        return res
          .status(201)
          .end();
      })
      .catch(next);
  })
  // Delete an organization from the database, cascading through all associated data
  .delete((req, res, next) => {
    const { id } = req.params;
    return OrganizationsService.deleteOrganization(req.app.get('db'), id)
      .then(() => {
        return res
          .status(204)
          .end();
      })
      .catch(next);
  });

module.exports = organizationsRouter;
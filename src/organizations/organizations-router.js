const express = require('express');
const xss = require('xss');
const OrganizationsService = require('./organizations-service');
const { validateOrganizationPost } = require('../util');

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

organizationsRouter
  .route('/')
  .get((req, res, next) => {
    return OrganizationsService.getAllOrganizations(req.app.get('db'))
      .then((orgs) => {
        return res.json(orgs.map(sanitizeOrganization));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const org = req.body;
    const errorMsgs = validateOrganizationPost(org);
    if (errorMsgs.length > 0) {
      return res
        .status(400)
        .json({ message: errorMsgs.join('; ') });
    }

    return OrganizationsService.insertOrganization(req.app.get('db'), org)
      .then((org) => {
        return res
          .location(`/api/orgs/${org.id}`)
          .status(201)
          .json(sanitizeOrganization(org));
      });
  });

organizationsRouter
  .route('/:id')
  .get((req, res, next) => {
    const { id } = req.params;
    return OrganizationsService.getById(req.app.get('db'), id)
      .then((org) => {
        if (!org) {
          return res
            .status(404)
            .json({
              message: `Organization with id ${id} does not exist`
            });
        }

        return res.json(sanitizeOrganization(org));
      })
      .catch(next);
  });

module.exports = organizationsRouter;
const express = require('express');
const xss = require('xss');
const OrganizationsService = require('./organizations-service');

const organizationsRouter = express.Router();

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
  });

module.exports = organizationsRouter;
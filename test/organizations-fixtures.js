function makeMaliciousOrg() {
  const maliciousOrg = {
    id: 1,
    org_name: (
      `Humane Society of Fairfax County <img src="doesn't exist" onerror="alert('malicious stuff')" />`
    ),
    website: `https://hsfc.org/ <script>alert('malicious stuff')</script>`,
    phone: '703-385-7387 <script>evilscript()</script>',
    email: 'volunteer_coordinator@HSFC.org <img src="does not exist" onerror="alert(bankInfo)" />',
    org_address: '4057 Chain Bridge Road, Fairfax, VA 22030 <script>stealIdentity()</script>',
    org_desc: `The mission of the Humane Society of Fairfax County, Inc. is to promote humane education, to prevent all forms of cruelty to animals, both domestic and wild, by every legitimate means, and to assist the community with all matters pertaining to the welfare of animals.<script>sendEvilKittens()</script>`,
    creator: 2
  };

  const expectedOrg = {
    id: 1,
    org_name: `Humane Society of Fairfax County <img src />`,
    website: `https://hsfc.org/ &lt;script&gt;alert('malicious stuff')&lt;/script&gt;`,
    phone: `703-385-7387 &lt;script&gt;evilscript()&lt;/script&gt;`,
    email: `volunteer_coordinator@HSFC.org <img src />`,
    org_address: (
      `4057 Chain Bridge Road, Fairfax, VA 22030 &lt;script&gt;stealIdentity()&lt;/script&gt;`
    ),
    org_desc: (
      `The mission of the Humane Society of Fairfax County, Inc. is to promote humane education, to prevent all forms of cruelty to animals, both domestic and wild, by every legitimate means, and to assist the community with all matters pertaining to the welfare of animals.&lt;script&gt;sendEvilKittens()&lt;/script&gt;`
    ),
    creator: 2
  };

  return { maliciousOrg, expectedOrg };
}

/**
 * Returns a new array of organizations, with their causes and creator added to them
 * 
 * @param {*} orgs - A list of organizations
 * @param {*} causes - A list of causes
 * @param {*} orgCauses - A list of every cause id for each organization id
 * @param {*} users - A list of all users
 */
function makeFullOrganizationsArray(orgs, causes, orgCauses, users) {
  return orgs.map((org) => {
    const newOrg = Object.fromEntries(Object.entries(org));

    newOrg.causes = orgCauses
      .filter((orgCause) => orgCause.org_id === org.id)
      .map(({ __, cause_id }) => cause_id);
    newOrg.causes = newOrg.causes.map((causeId) => (
      causes.find((cause) => cause.id === causeId)
    ));

    newOrg.creator = users.find((user) => user.id === org.creator);

    return newOrg;
  });
}

module.exports = {
  makeMaliciousOrg,
  makeFullOrganizationsArray
};
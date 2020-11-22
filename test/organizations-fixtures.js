const { makeMaliciousUser } = require('./users-fixtures');
const { makeMaliciousCause } = require('./causes-fixtures');

function makeOrganizationsArray() {
  return [
    {
      id: 1,
      org_name: 'YMCA DC',
      website: 'https://www.ymcadc.org/locations/ymca-fairfax-county-reston/',
      phone: '703-742-8800',
      email: 'Carson.Henry@ymcadc.org',
      org_address: '12196 Sunset Hills Road, Reston, VA 20190',
      org_desc: `Today, the Y engages more than 10,000 neighborhoods across the U.S. As the nation’s leading nonprofit committed to helping people and communities to learn, grow and thrive, our contributions are both far-reaching and intimate—from influencing our nation’s culture during times of profound social change to the individual support we provide an adult learning to read.
  
      By empowering young people to reach their full potential, improving individual and community well-being and giving back and inspiring action in our communities, the Y ensures that everyone has the opportunity to become healthier, more confident, connected and secure.`,
      creator: 1
    },
    {
      id: 2,
      org_name: 'Humane Society of Fairfax County, Inc',
      website: 'https://hsfc.org/',
      phone: '703-385-7387',
      email: 'volunteer_coordinator@HSFC.org',
      org_address: '4057 Chain Bridge Road, Fairfax, VA 22030',
      org_desc: `The mission of the Humane Society of Fairfax County, Inc. is to promote humane education, to prevent all forms of cruelty to animals, both domestic and wild, by every legitimate means, and to assist the community with all matters pertaining to the welfare of animals.`,
      creator: 2
    },
    {
      id: 3,
      org_name: 'National VOAD',
      website: 'https://www.nvoad.org',
      phone: '703-778-5088',
      email: 'info@nvoad.org',
      org_address: 'P.O. Box 26125 Alexandria, VA 22314',
      org_desc: `National VOAD is a coalition of 70+ of the nation’s most reputable national organizations (faith-based, community-based and other non-profit organizations) and 56 State/Territory VOADs, which represent Local/Regional VOADs and hundreds of other member organizations throughout the country.
  
      Recognizing that all sectors of society must work together to foster more resilient, self-reliant communities nationwide, we facilitate partnerships with federal, state and local emergency management and other governmental agencies, as well as for-profit corporations, foundations, and educational and research institutions. National VOAD Members represent a powerful force of goodwill in America. They are the leaders who do the work to make our communities stronger and more resilient. In times of need they deliver hope for a more positive future.`,
      creator: 3
    }
  ];
}

/**
 * Return a malicious organization with a malicious creator, the full version of the malicious 
 * organization with its malicious causes and malicious creator, the org_cause connecting it to a 
 * malicious cause, the sanitized organization, and the sanitized full organization with its causes
 * and its full creator
 */
function makeMaliciousOrg() {
  const { maliciousUser, sanitizedUser } = makeMaliciousUser();
  const { maliciousCause, sanitizedCause } = makeMaliciousCause();

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
    creator: maliciousUser.id
  };

  const maliciousOrgCause = {
    org_id: maliciousOrg.id,
    cause_id: maliciousCause.id
  };

  const maliciousFullOrg = {
    ...maliciousOrg,
    causes: [maliciousCause],
    creator: maliciousUser
  };

  const sanitizedOrg = {
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
    creator: sanitizedUser.id
  };

  const sanitizedFullOrg = {
    ...sanitizedOrg,
    causes: [sanitizedCause],
    creator: sanitizedUser
  };

  return { maliciousOrg, maliciousFullOrg, maliciousOrgCause, sanitizedOrg, sanitizedFullOrg };
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
  makeOrganizationsArray,
  makeMaliciousOrg,
  makeFullOrganizationsArray
};
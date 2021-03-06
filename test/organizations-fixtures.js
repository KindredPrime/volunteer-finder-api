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
      org_desc: `Today, the Y engages more than 10,000 neighborhoods across the U.S. As the ` +
        `nation’s leading nonprofit committed to helping people and communities to learn, grow ` +
        `and thrive, our contributions are both far-reaching and intimate—from influencing our ` +
        `nation’s culture during times of profound social change to the individual support we ` +
        `provide an adult learning to read.

        By empowering young people to reach their full potential, improving individual and ` +
        `community well-being and giving back and inspiring action in our communities, the Y ` +
        `ensures that everyone has the opportunity to become healthier, more confident, ` +
        `connected and secure.`
    },
    {
      id: 2,
      org_name: 'Humane Society of Fairfax County, Inc',
      website: 'https://hsfc.org/',
      phone: '703-385-7387',
      email: 'volunteer_coordinator@HSFC.org',
      org_address: '4057 Chain Bridge Road, Fairfax, VA 22030',
      org_desc: `The mission of the Humane Society of Fairfax County, Inc. is to promote ` +
        `humane education, to prevent all forms of cruelty to animals, both domestic and wild, ` +
        `by every legitimate means, and to assist the community with all matters pertaining to ` +
        `the welfare of animals.`
    },
    {
      id: 3,
      org_name: 'National VOAD',
      website: 'https://www.nvoad.org',
      phone: '703-778-5088',
      email: 'info@nvoad.org',
      org_address: 'P.O. Box 26125 Alexandria, VA 22314',
      org_desc: `National VOAD is a coalition of 70+ of the nation’s most reputable national ` +
        `organizations (faith-based, community-based and other non-profit organizations) and 56 ` +
        `State/Territory VOADs, which represent Local/Regional VOADs and hundreds of other ` +
        `member organizations throughout the country.

        Recognizing that all sectors of society must work together to foster more resilient, ` +
        `self-reliant communities nationwide, we facilitate partnerships with federal, state ` +
        `and local emergency management and other governmental agencies, as well as for-profit ` +
        `corporations, foundations, and educational and research institutions. National VOAD ` +
        `Members represent a powerful force of goodwill in America. They are the leaders who do ` +
        `the work to make our communities stronger and more resilient. In times of need they ` +
        `deliver hope for a more positive future.`
    },
    {
      id: 4,
      org_name: 'Sully Historic Site',
      website: 'https://www.fairfaxcounty.gov/parks/sully-historic-site/',
      phone: '703-437-1794',
      email: 'FCPASully@fairfaxcounty.gov',
      org_address: '3650 Historic Sully Way Chantilly, VA',
      org_desc: `Sully was completed in 1799 by Richard Bland Lee, Northern Virginia's first ` +
        `Representative to Congress. It is on the National Register for Historic Places and is ` +
        `accredited by the American Alliance of Museums.`
    },
    {
      id: 5,
      org_name: 'Vecinos Unidos',
      website: 'http://vecinosunidos.org/',
      phone: '703-201-2809',
      email: 'info@vecinosunidos.org',
      org_address: '1086 Elden Street Herndon, Virginia 20170',
      org_desc: `Vecinos Unidos makes a difference in the lives of students in grades 1-6 ` +
        `through homework assistance and summer enrichment programs—and has been doing so since ` +
        `1997. With caring volunteers to guide them, students experience improved academic ` +
        `success and greater confidence in their ability to learn and achieve.`
    },
    {
      id: 6,
      org_name: 'Girls on the Run of Northern Virginia',
      website: 'https://gotrnova.org/',
      phone: '703-273-3153',
      email: 'info@gotrnova.org',
      org_address: '10301 Democracy Lane, Suite 100 Fairfax',
      org_desc: `At Girls on the Run of NOVA, we are creating a community of girls empowered ` +
        `to be their best, by teaching them the skills they need to be strong, confident, and ` +
        `healthy women. As a 501(c)(3) non-profit organization serving more than 70,000 girls ` +
        `since 2000, GOTR NOVA works to engage the entire community to positively impact the ` +
        `health and well being of the girls of Northern VA, their families and communities, and ` +
        `the volunteer coaches who serve them. GOTR NOVA is an Independent Council of Girls on ` +
        `the Run International, a network of more than 200 councils across 50 states and the ` +
        `District of Columbia. By connecting our councils’ deep local roots with our strong ` +
        `national unity, Girls on the Run has become a powerful movement that is making a ` +
        `difference in the holistic health of girls, families and communities across North ` +
        `America. Together, we are inspiring girls to know their limitless potential and boldly ` +
        `pursue their dreams.`
    }
  ];
}

/**
 * Return a malicious organization, the full version of the malicious organization with its
 * malicious causes, the org_cause connecting the organization to a malicious cause, the sanitized
 * organization, and the sanitized full organization with its causes
 */
function makeMaliciousOrg() {
  const { maliciousCause, sanitizedCause } = makeMaliciousCause();

  const maliciousOrg = {
    id: 1,
    org_name: (
      `Humane Society of Fairfax County <img src="doesn't exist" ` +
      `onerror="alert('malicious stuff')" />`
    ),
    website: `https://hsfc.org/ <script>alert('malicious stuff')</script>`,
    phone: '703-385-7387 <script>evilscript()</script>',
    email: 'volunteer_coordinator@HSFC.org <img src="does not exist" onerror="alert(bankInfo)" />',
    org_address: '4057 Chain Bridge Road, Fairfax, VA 22030 <script>stealIdentity()</script>',
    org_desc: `The mission of the Humane Society of Fairfax County, Inc. is to promote humane ` +
      `education, to prevent all forms of cruelty to animals, both domestic and wild, by every ` +
      `legitimate means, and to assist the community with all matters pertaining to the welfare ` +
      `of animals.<script>sendEvilKittens()</script>`
  };

  const maliciousOrgCause = {
    org_id: maliciousOrg.id,
    cause_id: maliciousCause.id
  };

  const maliciousFullOrg = {
    ...maliciousOrg,
    causes: [maliciousCause]
  };

  const sanitizedOrg = {
    id: 1,
    org_name: `Humane Society of Fairfax County <img src />`,
    website: `https://hsfc.org/ &lt;script&gt;alert('malicious stuff')&lt;/script&gt;`,
    phone: `703-385-7387 &lt;script&gt;evilscript()&lt;/script&gt;`,
    email: `volunteer_coordinator@HSFC.org <img src />`,
    org_address: `4057 Chain Bridge Road, Fairfax, VA 22030 ` +
    `&lt;script&gt;stealIdentity()&lt;/script&gt;`,
    org_desc: `The mission of the Humane Society of Fairfax County, Inc. is to promote humane ` +
      `education, to prevent all forms of cruelty to animals, both domestic and wild, by every ` +
      `legitimate means, and to assist the community with all matters pertaining to the ` +
      `welfare of animals.&lt;script&gt;sendEvilKittens()&lt;/script&gt;`
  };

  const sanitizedFullOrg = {
    ...sanitizedOrg,
    causes: [sanitizedCause]
  };

  return { maliciousOrg, maliciousFullOrg, maliciousOrgCause, sanitizedOrg, sanitizedFullOrg };
}

/**
 * Combine the organizations with their causes
 *
 * @param {Array} orgs
 * @param {Array} causes
 * @param {Array} orgCauses - Every cause id for each organization id
 * @return {Array}
 */
function makeFullOrganizationsArray(orgs, causes, orgCauses) {
  return orgs.map((org) => {

    // Make a copy of org
    const newOrg = Object.fromEntries(Object.entries(org));

    // Create a list of the cause ids tied to the organization
    newOrg.causes = orgCauses
      .filter((orgCause) => orgCause.org_id === newOrg.id)
      .map(({ __, cause_id }) => cause_id);

    // Convert the list of cause ids to a list of cause objects
    newOrg.causes = newOrg.causes.map((causeId) => (
      causes.find((cause) => cause.id === causeId)
    ));

    return newOrg;
  });
}

module.exports = {
  makeOrganizationsArray,
  makeMaliciousOrg,
  makeFullOrganizationsArray
};
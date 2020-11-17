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

module.exports = {
  makeOrganizationsArray
};
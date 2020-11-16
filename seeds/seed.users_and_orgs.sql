TRUNCATE users, organizations RESTART IDENTITY CASCADE;

INSERT INTO users (email, username)
  VALUES 
    ('email1@email.com', 'user1'),
    ('email2@email.com', 'user2'),
    ('email3@email.com', 'user3'),
    ('email4@email.com', 'user4'),
    ('email5@email.com', 'user5'),
    ('email6@email.com', 'user6'),
    ('email7@email.com', 'user7'),
    ('email8@email.com', 'user8'),
    ('email9@email.com', 'user9'),
    ('email10@email.com', 'user10');

INSERT INTO organizations (org_name, website, phone, email, org_address, org_desc, creator)
  VALUES
    ('YMCA_DC', 'https://www.ymcadc.org/locations/ymca-fairfax-county-reston/', '703-742-8800', 'Carson.Henry@ymcadc.org', '12196 Sunset Hills Road, Reston, VA 20190', 'Today, the Y engages more than 10,000 neighborhoods across the U.S. As the nation’s leading nonprofit committed to helping people and communities to learn, grow and thrive, our contributions are both far-reaching and intimate—from influencing our nation’s culture during times of profound social change to the individual support we provide an adult learning to read.

    By empowering young people to reach their full potential, improving individual and community well-being and giving back and inspiring action in our communities, the Y ensures that everyone has the opportunity to become healthier, more confident, connected and secure.', 1),
    ('Humane Society of Fairfax County, Inc', 'https://hsfc.org/', '703-385-7387', 'volunteer_coordinator@HSFC.org', '4057 Chain Bridge Road, Fairfax, VA 22030', 'The mission of the Humane Society of Fairfax County, Inc. is to promote humane education, to prevent all forms of cruelty to animals, both domestic and wild, by every legitimate means, and to assist the community with all matters pertaining to the welfare of animals.', 2),
    ('National VOAD', 'https://www.nvoad.org', '703-778-5088', 'info@nvoad.org', 'P.O. Box 26125 Alexandria, VA 22314', 'National VOAD is a coalition of 70+ of the nation’s most reputable national organizations (faith-based, community-based and other non-profit organizations) and 56 State/Territory VOADs, which represent Local/Regional VOADs and hundreds of other member organizations throughout the country.

    Recognizing that all sectors of society must work together to foster more resilient, self-reliant communities nationwide, we facilitate partnerships with federal, state and local emergency management and other governmental agencies, as well as for-profit corporations, foundations, and educational and research institutions. National VOAD Members represent a powerful force of goodwill in America. They are the leaders who do the work to make our communities stronger and more resilient. In times of need they deliver hope for a more positive future.', 3),
    ('National Air and Space Museum', 'https://airandspace.si.edu', '202-633-2214', 'NASMVisitorServices@si.edu', '655 Jefferson Drive, SW Washington, DC 20560', 'The Smithsonian''s National Air and Space Museum maintains the world''s largest and most significant collection of aviation and space artifacts, encompassing all aspects of human flight, as well as related works of art and archival materials. It operates two landmark facilities that, together, welcome more than eight million visitors a year, making it the most visited museum in the country. It also is home to the Center for Earth and Planetary Studies.', 5),
    ('Fairfax County Health Department', 'https://www.fairfaxcounty.gov/health/fairfax-county-health-department', '703-246-2411', 'health@fairfaxcounty.gov', '10777 Main Street Fairfax, VA 22030', 'As an agency of the Fairfax County Health and Human Services System, we work to protect, promote and improve health and quality of life for all who live, work and play in our community. We do this by preventing epidemics and the spread of disease, protecting the public against environmental hazards, promoting and encouraging healthy behaviors, assuring the quality and accessibility of health services, responding to natural and man-made disasters, and assisting communities in recovery. Our vision is for all Fairfax County residents to live in thriving communities where every person has the opportunity to be healthy, safe and realize his or her potential.', 8),
    ('Sully Historic Site', 'https://www.fairfaxcounty.gov/parks/sully-historic-site/', '703-437-1794', 'FCPASully@fairfaxcounty.gov', '3650 Historic Sully Way Chantilly, VA', 'Sully was completed in 1799 by Richard Bland Lee, Northern Virginia''s first Representative to Congress. It is on the National Register for Historic Places and is accredited by the American Alliance of Museums.', 7),
    ('Vecinos Unidos', 'http://vecinosunidos.org/', '703-201-2809', 'info@vecinosunidos.org', '1086 Elden Street Herndon, Virginia 20170', 'Vecinos Unidos makes a difference in the lives of students in grades 1-6 through homework assistance and summer enrichment programs—and has been doing so since 1997. With caring volunteers to guide them, students experience improved academic success and greater confidence in their ability to learn and achieve.', 10),
    ('Girls on the Run of Northern Virginia', 'https://gotrnova.org/', '703-273-3153', 'info@gotrnova.org', '10301 Democracy Lane, Suite 100 Fairfax, Virginia 22030', 'At Girls on the Run of NOVA, we are creating a community of girls empowered to be their best, by teaching them the skills they need to be strong, confident, and healthy women. As a 501(c)(3) non-profit organization serving more than 70,000 girls since 2000, GOTR NOVA works to engage the entire community to positively impact the health and well being of the girls of Northern Virginia, their families and communities, and the volunteer coaches who serve them. GOTR NOVA is an Independent Council of Girls on the Run International, a network of more than 200 councils across 50 states and the District of Columbia. By connecting our councils’ deep local roots with our strong national unity, Girls on the Run has become a powerful movement that is making a difference in the holistic health of girls, families and communities across North America. Together, we are inspiring girls to know their limitless potential and boldly pursue their dreams.', 9),
    ('FACETS', 'http://facetscares.org/', '703-352-5090', 'facets@facetscares.org', '10700 Page Avenue, Building B, Fairfax, VA 22030', 'FACETS opens doors by helping parents, their children and individuals who suffer the effects of poverty – so often unnoticed – in Fairfax County. We meet their emergency shelter, food, and medical needs, help them gain safe, sustainable and permanent housing and work with them to end the cycle of poverty through educational, life skills and career counseling programs. FACETS was founded in 1988 to respond to the diverse needs of people impacted by poverty in Fairfax, Virginia.
    
    We began as an outreach project by our founder, Linda D. Wimpey, who, in partnership with several area churches, prepared and delivered hot meals to families who were homeless three nights a week. This program continues to this day, and we have since expanded from operating as an emergency food program to a full-time staff of professionals, an engaged board of directors and a range of programs that work to break the cycle of poverty and prevent and end homelessness in our community.
    
    Countywide – FACETS operates across the entirety of Fairfax County.
    
    Effective – The organization’s many individual success stories and group statistics demonstrate how FACETS’ work continues to reduce the effects of poverty and prevent and end homelessness in the lives of Fairfax County residents. An important reason that FACETS is so effective is that its programs are tailored to meet individual needs.
    
    Full-Service – FACETS provides personalized and successful services that prevent and end homelessness and address poverty and its effects in Fairfax County.
    
    Professional – FACETS’ is a professionally managed organization whose experienced, multi-disciplinary staff is specialized in housing, medical services, shelter, education and community development. Those who know FACETS firsthand recognize the staff for its creativity, resourcefulness and commitment to service.
    
    Dedicated – Care and compassion are FACETS’ well-established values and characterize the way in which its staff and volunteers carry out its mission.
    
    Respectful – FACETS respects the dignity of each person it assists, and serves people without regard to their beliefs, backgrounds or conditions.
    
    Community Involving – FACETS attracts, motivates and manages more than 3,000 volunteers who are vital in carrying out its programs.
    
    Collaborative – FACETS works closely with more than one hundred faith communities, businesses, fellow nonprofits, county government bodies and foundations to end the cycle of poverty in Fairfax County. In 2008, FACETS was an organizing partner in an alliance of groups committed to ending homelessness in Fairfax County by 2018.
    ', 10);

INSERT INTO organizations (org_name, website, org_desc, creator)
  VALUES 
    ('Optimist Club of Herndon, VA', 'http://www.herndonoptimist.org/', 'Since 1961, the not-for-profit Optimist Club of Herndon, VA has been dedicated to providing a helping hand to the youth in our greater-Herndon-Reston community. Our youth sports programs offer over two thousand children each year the opportunity to learn sports-related skills and that responsibility, teamwork, sportsmanship, and integrity are just as important as winning. Our education-partnership programs and law enforcement-partnership programs engage the children in our community in positive ways with our school personnel and law enforcement officers.

    The Herndon Optimist Club (HOC) Board is focused on and committed to delivering on our mission of service to the youth of our community. If you have any suggestions for improvement or need assistance, please use the Feedback option and a member of the HOC Board will get back to you as soon as possible.', 7);

INSERT INTO organizations (org_name, website, phone, org_address, org_desc, creator)
  VALUES 
    ('American Cancer Society in District of Columbia', 'https://www.cancer.org/about-us/local/district-of-columbia.html', '202-661-5700', '555 11th Street NW, Suite 300 Washington, DC 20004', 'If you’re looking for cancer information and resources in District of Columbia you’ve come to the right place. From our local fundraising events to our cancer support programs, you’ll find everything you need to fuel the fight against cancer and get patient support – right here in our community.', 10);
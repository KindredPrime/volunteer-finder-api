function makeCausesArray() {
  return [
    {
      id: 1,
      cause_name: 'Youth'
    },
    {
      id: 2,
      cause_name: 'Health'
    },
    {
      id: 3,
      cause_name: 'Disaster Response'
    },
    {
      id: 4,
      cause_name: 'Animals'
    },
    {
      id: 5,
      cause_name: 'History'
    },
    {
      id: 6,
      cause_name: 'Education'
    },
    {
      id: 7,
      cause_name: 'Human Rights'
    },
    {
      id: 8,
      cause_name: 'Arts'
    },
    {
      id: 9,
      cause_name: 'Wildlife and Environment'
    },
    {
      id: 10,
      cause_name: 'Elderly'
    },
    {
      id: 11,
      cause_name: 'Poverty'
    }
  ];
}

function makeMaliciousCause() {
  const maliciousCause = {
    id: 1,
    cause_name: 'Malicious Cause <script>evilscript()</script>'
  };

  const sanitizedCause = {
    id: 1,
    cause_name: 'Malicious Cause &lt;script&gt;evilscript()&lt;/script&gt;'
  };

  return { maliciousCause, sanitizedCause };
}

module.exports = {
  makeCausesArray,
  makeMaliciousCause
};
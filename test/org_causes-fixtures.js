function makeOrgCausesArray() {
  return [
    {
      org_id: 1,
      cause_id: 1
    },
    {
      org_id: 1,
      cause_id: 2
    },
    {
      org_id: 1, 
      cause_id: 10
    },
    {
      org_id: 2, 
      cause_id: 4
    },
    {
      org_id: 3, 
      cause_id: 3
    }
  ];
}

module.exports = {
  makeOrgCausesArray
};
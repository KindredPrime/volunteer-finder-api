function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'email1@email.com',
      username: 'user1'
    },
    {
      id: 2,
      email: 'email2@email.com',
      username: 'user2'
    },
    {
      id: 3,
      email: 'email3@email.com',
      username: 'user3'
    }
  ];
}

function makeMaliciousUser() {
  const maliciousUser = {
    id: 1,
    email: 'maliciousEmail@gmail.com <img src="does not exist" onerror="alert(bankInfo)" />',
    username: 'maliciousUser <script>evilscript()</script>'
  };

  const sanitizedUser = {
    id: 1,
    email: 'maliciousEmail@gmail.com <img src />',
    username: 'maliciousUser &lt;script&gt;evilscript()&lt;/script&gt;'
  };

  return { maliciousUser, sanitizedUser };
}

module.exports = {
  makeUsersArray,
  makeMaliciousUser
};
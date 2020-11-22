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
  makeMaliciousUser
};
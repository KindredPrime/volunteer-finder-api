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
  makeMaliciousCause
};
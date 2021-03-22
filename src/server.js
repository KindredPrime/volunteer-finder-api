const app = require('./app');
const { PORT, DATABASE_URL, NODE_ENV } = require('./config');
const knex = require('knex');
const logger = require('./logger');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: DATABASE_URL,
    sslmode: NODE_ENV === 'production' ? 'require' : 'disable'
  }
});

app.set('db', db);

app.listen(PORT, () => {
  logger.info(`Server listening at http://localhost:${PORT}`);
});
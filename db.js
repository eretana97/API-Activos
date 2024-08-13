const { Pool } = require('pg');


require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
PGPASSWORD = decodeURIComponent(PGPASSWORD);


const pool = new Pool({
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: 5432,
  ssl: true,
  options: `project=${ENDPOINT_ID}`,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

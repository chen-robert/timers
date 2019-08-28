const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:nike@localhost:5432/timers";
const client = new Client({
  connectionString
});

(async function(){
  await client.connect();
  await client.query(`
    CREATE TABLE events (
      name TEXT not null,
      tag TEXT not null,
      PRIMARY KEY (name, tag)
    )
  `);
  await client.query(`
    CREATE TABLE pauses (
      id SERIAL PRIMARY KEY,
      opt TEXT not null,
      time BIGINT not null,
      parent_name TEXT not null,
      parent_tag TEXT not null,
      FOREIGN KEY (parent_name, parent_tag) REFERENCES events (name, tag)
    );
  `);
  console.log("Done with init");
  await client.end()
})();
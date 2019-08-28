const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:nike@localhost:5432/timers";
const client = new Client({
  connectionString
});
client.connect();

module.exports = {
  addTime: async (user, tag, opt, time) => {
    await client.query(`
      INSERT INTO pauses 
      (opt, time, parent_name, parent_tag)
      VALUES
      ($1, $2, $3, $4)
    `, [opt, time, user, tag])
  },
  addTag: async (user, tag) => {
    await client.query(`
      INSERT INTO events
      (name, tag)
      VALUES
      ($1, $2)
    `, [user, tag]);
  },
  getTags: async user => {
    const res = await client.query(`
      SELECT tag FROM events
      WHERE name = $1
    `, [user]);

    return res.rows;
  }
}
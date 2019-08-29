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
  addTag: async (name, tag) => {
    await client.query(`
      INSERT INTO events
      (name, tag)
      VALUES
      ($1, $2)
    `, [name, tag]);
  },
  getTags: async user => {
    const res = await client.query(`
      SELECT tag FROM events
      WHERE name = $1
    `, [user]);

    return res.rows;
  },
  getTimes: async (name, tag, lim) => {
    const res = await client.query(`
      SELECT opt, time FROM pauses
      WHERE parent_name = $1 AND parent_tag = $2 AND time > $3
    `, [name, tag, lim]);

    return res.rows;
  },
  removeTag: async (name, tag) => {
    await client.query(`
      DELETE FROM pauses
      WHERE parent_name = $1 AND parent_tag = $2
    `, [name, tag]);
    await client.query(`
      DELETE FROM events
      WHERE name = $1 AND tag = $2
    `, [name, tag]);
  }
}
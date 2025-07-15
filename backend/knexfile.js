require('dotenv').config();

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || './database.sqlite'
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, cb) => {
        conn.pragma('foreign_keys = ON');
        cb();
      }
    }
  },
  production: {
    client: 'better-sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || './database.sqlite'
    },
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, cb) => {
        conn.pragma('foreign_keys = ON');
        cb();
      }
    }
  }
};

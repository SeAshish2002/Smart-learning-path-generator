// Database configuration using Sequelize ORM
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration: SQLite or PostgreSQL
// To use SQLite, set USE_SQLITE=true in .env
// To use PostgreSQL, make sure PostgreSQL is installed and running

let sequelize;

if (process.env.USE_SQLITE === 'true') {
  // SQLite configuration (no setup needed)
  const path = require('path');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  });
  console.log('📦 Using SQLite database');
} else {
  // PostgreSQL configuration (production-ready)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'learning_path_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
  console.log('🐘 Using PostgreSQL database');
}

module.exports = { sequelize };


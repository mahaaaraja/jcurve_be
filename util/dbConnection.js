const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Sequelize = require('sequelize');

var config = {
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  define: {
    freezeTableName: true,
  },
};
var dbConnection = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

module.exports = dbConnection;

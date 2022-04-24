const Sequelize = require('sequelize');

// console.log(process.env.Database);

const sequelize = new Sequelize(process.env.Database, process.env.User, process.env.Password, {
  dialect: process.env.Db_dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  host: process.env.Host,
  logging: false
});

module.exports = sequelize;

var Sequelize = require("sequelize");
const sequelize = new Sequelize('mydb', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
   
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

const db = {};
 
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = require('./users')(sequelize, Sequelize);

module.exports = db;
module.exports = function (sequelize, Sequelize) {
  const redusers = sequelize.define('redusers', {
    user_id: {
      type: Sequelize.INTEGER
    },
    first_name: {
      type: Sequelize.STRING
    },
    last_name: {
      type: Sequelize.INTEGER
    },
    email: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.INTEGER
    }
  });

  return redusers;
}
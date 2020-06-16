'use strict';
module.exports = (sequelize, DataTypes) => {
  const log = sequelize.define('log', {
    user_id:DataTypes.INTEGER(11),
    createAt:DataTypes.STRING(45),
    type: DataTypes.STRING(45),
    action:DataTypes.STRING(45),
  }, {});
  log.associate = function(models) {
    models.log.belongsTo(models.user,{
      foreignKey:"user_id"
    })
  }
  return log
};
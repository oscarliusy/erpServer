'use strict';
module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    user_id:DataTypes.INTEGER(11),
    createAt:DataTypes.STRING(45),
    type: DataTypes.STRING(45),
    action:DataTypes.STRING(45),
  }, {});
  Log.associate = function(models) {
    models.Log.belongsTo(models.User,{
      foreignKey:"user_id"
    })
  }
  return Log
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_user = sequelize.define('Login_user', {
    name: DataTypes.STRING(128),
    password: DataTypes.STRING(256),
    email:DataTypes.STRING(254),
    sex:DataTypes.STRING(32),
    c_time:DataTypes.DATE
  }, {});
  Login_user.associate = function(models) {
    //定义一对多关系
    models.Login_user.hasMany(models.Login_inventorymaterial,{
      foreignKey:"userPurchase_id"
    })
  }
  return Login_user
};
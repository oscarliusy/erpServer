'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_user = sequelize.define('Login_user', {
    name: DataTypes.STRING(128),
    password: DataTypes.STRING(256),
    email:DataTypes.STRING(254),
    authority_id:DataTypes.INTEGER(11)
  }, {});
  Login_user.associate = function(models) {
    //定义一对多关系
    models.Login_user.hasMany(models.Login_inventorymaterial,{
      foreignKey:"userPurchase_id"
    })
    models.Login_user.hasMany(models.Login_instock,{
      foreignKey:"userInstock_id"
    })
    models.Login_user.hasMany(models.Login_producttemp,{
      foreignKey:"creater_id"
    })
    models.Login_user.hasMany(models.Login_preoutstock,{
      foreignKey:"user_id"
    })
    models.Login_user.hasMany(models.Login_outstock,{
      foreignKey:"userOutstock_id"
    })
    models.Login_user.belongsTo(models.Authority,{
      foreignKey:"authority_id"
    })
  }
  return Login_user
};
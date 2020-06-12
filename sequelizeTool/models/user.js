'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING(128),
    password: DataTypes.STRING(256),
    email:DataTypes.STRING(254),
    authority_id:DataTypes.INTEGER(11)
  }, {});
  User.associate = function(models) {
    //定义一对多关系
    models.User.hasMany(models.Inventorymaterial,{
      foreignKey:"userPurchase_id"
    })
    models.User.hasMany(models.Instock,{
      foreignKey:"userInstock_id"
    })
    models.User.hasMany(models.Producttemp,{
      foreignKey:"creater_id"
    })
    models.User.hasMany(models.Preoutstock,{
      foreignKey:"user_id"
    })
    models.User.hasMany(models.Outstock,{
      foreignKey:"userOutstock_id"
    })
    models.User.belongsTo(models.Authority,{
      foreignKey:"authority_id"
    })
    models.User.hasMany(models.Log,{
      foreignKey:"user_id"
    })
  }
  return User
};
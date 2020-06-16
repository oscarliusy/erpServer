'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: DataTypes.STRING(128),
    password: DataTypes.STRING(256),
    email:DataTypes.STRING(254),
    authority_id:DataTypes.INTEGER(11)
  }, {});
  user.associate = function(models) {
    //定义一对多关系
    models.user.hasMany(models.inventorymaterial,{
      foreignKey:"userPurchase_id"
    })
    models.user.hasMany(models.instock,{
      foreignKey:"userInstock_id"
    })
    models.user.hasMany(models.producttemp,{
      foreignKey:"creater_id"
    })
    models.user.hasMany(models.preoutstock,{
      foreignKey:"user_id"
    })
    models.user.hasMany(models.outstock,{
      foreignKey:"userOutstock_id"
    })
    models.user.belongsTo(models.authority,{
      foreignKey:"authority_id"
    })
    models.user.hasMany(models.log,{
      foreignKey:"user_id"
    })
  }
  return user
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_inventorymaterial = sequelize.define('Login_inventorymaterial', {
    amount: DataTypes.INTEGER(11),
    description: DataTypes.TEXT,
    uniqueId:DataTypes.STRING(100),
    image:DataTypes.STRING(100),
    userPurchase_id:DataTypes.INTEGER(11),
    price:DataTypes.DECIMAL
  }, {});
  Login_inventorymaterial.associate = function(models) {
  };
  return Login_inventorymaterial;
};
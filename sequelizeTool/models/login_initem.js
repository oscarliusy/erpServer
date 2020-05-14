'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_initem = sequelize.define('Login_initem', {
    amountIn:DataTypes.INTEGER(10).UNSIGNED,
    master_id: DataTypes.INTEGER(11),
    materialName_id:DataTypes.INTEGER(11),
  }, {});
  Login_initem.associate = function(models) {
  }
  return Login_initem;
};
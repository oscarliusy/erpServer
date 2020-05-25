'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_productmaterial = sequelize.define('Login_productmaterial', {
    pmAmount: DataTypes.INTEGER(10).UNSIGNED,
    pmMaterial_id: DataTypes.INTEGER(11),
    pmProduct_id: DataTypes.INTEGER(11)
  }, {});
  Login_productmaterial.associate = function(models) {
    models.Login_productmaterial.belongsTo(models.Login_inventorymaterial,
      {
        foreignKey:"pmMaterial_id"
      }
    )
    models.Login_productmaterial.belongsTo(models.Login_producttemp,
      {
        foreignKey:"pmProduct_id"
      }
    )
  }
  return Login_productmaterial;
};
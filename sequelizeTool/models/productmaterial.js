'use strict';
module.exports = (sequelize, DataTypes) => {
  const productmaterial = sequelize.define('productmaterial', {
    pmAmount: DataTypes.INTEGER(10).UNSIGNED,
    pmMaterial_id: DataTypes.INTEGER(11),
    pmProduct_id: DataTypes.INTEGER(11)
  }, {});
  productmaterial.associate = function(models) {
    models.productmaterial.belongsTo(models.inventorymaterial,
      {
        foreignKey:"pmMaterial_id"
      }
    )
    models.productmaterial.belongsTo(models.producttemp,
      {
        foreignKey:"pmProduct_id"
      }
    )
  }
  return productmaterial;
};
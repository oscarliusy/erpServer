'use strict';
module.exports = (sequelize, DataTypes) => {
  const Productmaterial = sequelize.define('Productmaterial', {
    pmAmount: DataTypes.INTEGER(10).UNSIGNED,
    pmMaterial_id: DataTypes.INTEGER(11),
    pmProduct_id: DataTypes.INTEGER(11)
  }, {});
  Productmaterial.associate = function(models) {
    models.Productmaterial.belongsTo(models.Inventorymaterial,
      {
        foreignKey:"pmMaterial_id"
      }
    )
    models.Productmaterial.belongsTo(models.Producttemp,
      {
        foreignKey:"pmProduct_id"
      }
    )
  }
  return Productmaterial;
};
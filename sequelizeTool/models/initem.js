'use strict';
module.exports = (sequelize, DataTypes) => {
  const Initem = sequelize.define('Initem', {
    amountIn:DataTypes.INTEGER(10).UNSIGNED,
    master_id: DataTypes.INTEGER(11),
    materialName_id:DataTypes.INTEGER(11),
  }, {});
  Initem.associate = function(models) {
    models.Initem.belongsTo(models.Inventorymaterial,
      {
        foreignKey:"materialName_id"
      }
    )
  }
  return Initem;
};
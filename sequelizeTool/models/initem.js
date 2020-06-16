'use strict';
module.exports = (sequelize, DataTypes) => {
  const initem = sequelize.define('initem', {
    amountin:DataTypes.INTEGER(10).UNSIGNED,
    master_id: DataTypes.INTEGER(11),
    materialName_id:DataTypes.INTEGER(11),
  }, {});
  initem.associate = function(models) {
    models.initem.belongsTo(models.inventorymaterial,
      {
        foreignKey:"materialName_id"
      }
    )
  }
  return initem;
};
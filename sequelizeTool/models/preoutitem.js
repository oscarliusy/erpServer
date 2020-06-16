'use strict';
module.exports = (sequelize, DataTypes) => {
  const preoutitem = sequelize.define('preoutitem', {
    amount: DataTypes.INTEGER(10).UNSIGNED,
    master_id:DataTypes.INTEGER(11),
    productName_id:DataTypes.INTEGER(11)
  }, {});
  preoutitem.associate = function(models) {
    models.preoutitem.belongsTo(models.preoutstock,
      {
        foreignKey:"master_id"
      }
    )
    models.preoutitem.belongsTo(models.producttemp,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return preoutitem;
};
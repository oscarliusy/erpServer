'use strict';
module.exports = (sequelize, DataTypes) => {
  const Preoutitem = sequelize.define('Preoutitem', {
    amount: DataTypes.INTEGER(10).UNSIGNED,
    master_id:DataTypes.INTEGER(11),
    productName_id:DataTypes.INTEGER(11)
  }, {});
  Preoutitem.associate = function(models) {
    models.Preoutitem.belongsTo(models.Preoutstock,
      {
        foreignKey:"master_id"
      }
    )
    models.Preoutitem.belongsTo(models.Producttemp,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return Preoutitem;
};
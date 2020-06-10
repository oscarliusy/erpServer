'use strict';
module.exports = (sequelize, DataTypes) => {
  const Outitem = sequelize.define('Outitem', {
    amountOut: DataTypes.INTEGER(10).UNSIGNED,
    master_id: DataTypes.INTEGER(11),
    productName_id: DataTypes.INTEGER(11),
    volume:DataTypes.DECIMAL,
    weight: DataTypes.DECIMAL,
    freightfee: DataTypes.DECIMAL,
    site:DataTypes.STRING(30)
  }, {});
  Outitem.associate = function(models) {
    models.Outitem.belongsTo(models.Outstock,
      {
        foreignKey:"master_id"
      }
    )
    models.Outitem.belongsTo(models.Producttemp,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return Outitem;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_outitem = sequelize.define('Login_outitem', {
    amountOut: DataTypes.INTEGER(10).UNSIGNED,
    master_id: DataTypes.INTEGER(11),
    productName_id: DataTypes.INTEGER(11),
    volume:DataTypes.DECIMAL,
    weight: DataTypes.DECIMAL,
    freightfee: DataTypes.DECIMAL,
    site:DataTypes.STRING(30)
  }, {});
  Login_outitem.associate = function(models) {
    models.Login_outitem.belongsTo(models.Login_outstock,
      {
        foreignKey:"master_id"
      }
    )
    models.Login_outitem.belongsTo(models.Login_producttemp,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return Login_outitem;
};
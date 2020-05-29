'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_preoutitem = sequelize.define('Login_preoutitem', {
    amount: DataTypes.INTEGER(10).UNSIGNED,
    master_id:DataTypes.INTEGER(11),
    productName_id:DataTypes.INTEGER(11)
  }, {});
  Login_preoutitem.associate = function(models) {
    models.Login_preoutitem.belongsTo(models.Login_preoutstock,
      {
        foreignKey:"master_id"
      }
    )
    models.Login_preoutitem.belongsTo(models.Login_producttemp,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return Login_preoutitem;
};
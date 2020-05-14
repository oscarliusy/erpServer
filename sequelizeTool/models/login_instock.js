'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_instock = sequelize.define('Login_instock', {
    code:DataTypes.STRING(50),
    c_time:DataTypes.STRING(50),
    description:DataTypes.TEXT,
    userInstock_id: DataTypes.INTEGER(11)
  }, {});
  Login_instock.associate = function(models) {
    models.Login_instock.belongsTo(models.Login_user,
      {
        foreignKey:"userInstock_id"
      }
    )
    models.Login_instock.belongsToMany(models.Login_inventorymaterial,{
      through:{
        model:models.Login_initem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
  };
  return Login_instock;
};
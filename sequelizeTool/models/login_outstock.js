'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_outstock = sequelize.define('Login_outstock', {
    code:  DataTypes.STRING(50),
    c_time: DataTypes.STRING(50),
    description: DataTypes.TEXT,
    userOutstock_id:DataTypes.INTEGER(11),
    total_freightfee: DataTypes.DECIMAL,
    total_volume:DataTypes.DECIMAL,
    total_weight:DataTypes.DECIMAL
  }, {});
  Login_outstock.associate = function(models) {
    models.Login_outstock.belongsTo(models.Login_user,
      {
        foreignKey:"userOutstock_id"
      }
    )
    models.Login_outstock.belongsToMany(models.Login_producttemp,{
      through:{
        model:models.Login_outitem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
    models.Login_outstock.hasMany(models.Login_outitem,
      {
        foreignKey:"master_id"
      }
    )
  }
  return Login_outstock;
};
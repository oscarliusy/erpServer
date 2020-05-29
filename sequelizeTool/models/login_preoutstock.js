'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_preoutstock = sequelize.define('Login_preoutstock', {
    pcode: DataTypes.STRING(50),
    ptime:DataTypes.STRING(50),
    pdescription:DataTypes.TEXT,
    total_weight:DataTypes.DECIMAL,
    total_volume:DataTypes.DECIMAL,
    total_freightfee:DataTypes.DECIMAL,
    user_id: DataTypes.INTEGER(11),
    has_out:DataTypes.INTEGER(1)
  }, {});
  Login_preoutstock.associate = function(models) {
    models.Login_preoutstock.belongsTo(models.Login_user,
      {
        foreignKey:"user_id"
      }
    )
    models.Login_preoutstock.belongsToMany(models.Login_producttemp,{
      through:{
        model:models.Login_preoutitem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
    models.Login_preoutstock.hasMany(models.Login_preoutitem,
      {
        foreignKey:"master_id"
      }
    )
  }
  return Login_preoutstock;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Outstock = sequelize.define('Outstock', {
    code:  DataTypes.STRING(50),
    c_time: DataTypes.STRING(50),
    description: DataTypes.TEXT,
    userOutstock_id:DataTypes.INTEGER(11),
    total_freightfee: DataTypes.DECIMAL,
    total_volume:DataTypes.DECIMAL,
    total_weight:DataTypes.DECIMAL
  }, {});
  Outstock.associate = function(models) {
    models.Outstock.belongsTo(models.User,
      {
        foreignKey:"userOutstock_id"
      }
    )
    models.Outstock.belongsToMany(models.Producttemp,{
      through:{
        model:models.Outitem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
    models.Outstock.hasMany(models.Outitem,
      {
        foreignKey:"master_id"
      }
    )
  }
  return Outstock;
};
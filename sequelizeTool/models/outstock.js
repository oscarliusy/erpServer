'use strict';
module.exports = (sequelize, DataTypes) => {
  const outstock = sequelize.define('outstock', {
    code:  DataTypes.STRING(50),
    c_time: DataTypes.STRING(50),
    description: DataTypes.TEXT,
    userOutstock_id:DataTypes.INTEGER(11),
    total_freightfee: DataTypes.DECIMAL,
    total_volume:DataTypes.DECIMAL,
    total_weight:DataTypes.DECIMAL
  }, {});
  outstock.associate = function(models) {
    models.outstock.belongsTo(models.user,
      {
        foreignKey:"userOutstock_id"
      }
    )
    models.outstock.belongsToMany(models.producttemp,{
      through:{
        model:models.outitem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
    models.outstock.hasMany(models.outitem,
      {
        foreignKey:"master_id"
      }
    )
  }
  return outstock;
};
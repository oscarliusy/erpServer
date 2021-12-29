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
    //outstock拥有单一的user：出库人
    models.outstock.belongsTo(models.user,
      {
        foreignKey:"userOutstock_id"
      }
    )
    //outstock拥有多个producttemp（出库产品），通过关联项outitem建立关系
    models.outstock.belongsToMany(models.producttemp,{
      through:{
        model:models.outitem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
    //outstock拥有多个outitem
    models.outstock.hasMany(models.outitem,
      {
        foreignKey:"master_id"
      }
    )
  }
  return outstock;
};
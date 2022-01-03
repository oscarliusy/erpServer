'use strict';
module.exports = (sequelize, DataTypes) => {
  const outitem = sequelize.define('outitem', {
    amountOut: DataTypes.INTEGER(10).UNSIGNED,
    master_id: DataTypes.INTEGER(11),
    productName_id: DataTypes.INTEGER(11),
    volume:DataTypes.DECIMAL,
    weight: DataTypes.DECIMAL,
    freightfee: DataTypes.DECIMAL,
    site:DataTypes.STRING(30),
    //增加品牌字段，并不是用外键的形式，而是直接写字符串
    brand:{
      type:DataTypes.STRING(30),
      defaultValue:""
    }
  }, {});
  //outitem是outstock和producttemp的关联对象
  outitem.associate = function(models) {
    models.outitem.belongsTo(models.outstock,
      {
        foreignKey:"master_id"
      }
    )
    models.outitem.belongsTo(models.producttemp,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return outitem;
};
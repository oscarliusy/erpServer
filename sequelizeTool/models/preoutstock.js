'use strict';
module.exports = (sequelize, DataTypes) => {
  const preoutstock = sequelize.define('preoutstock', {
    pcode: DataTypes.STRING(50),
    ptime:DataTypes.STRING(50),
    pdescription:DataTypes.TEXT,
    total_weight:DataTypes.DECIMAL,
    total_volume:DataTypes.DECIMAL,
    total_freightfee:DataTypes.DECIMAL,
    user_id: DataTypes.INTEGER(11),
    has_out:DataTypes.INTEGER(1)
  }, {});
  preoutstock.associate = function(models) {
    models.preoutstock.belongsTo(models.user,
      {
        foreignKey:"user_id"
      }
    )
    models.preoutstock.belongsToMany(models.producttemp,{
      through:{
        model:models.preoutitem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
    models.preoutstock.hasMany(models.preoutitem,
      {
        foreignKey:"master_id"
      }
    )
  }
  return preoutstock;
};
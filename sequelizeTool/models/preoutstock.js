'use strict';
module.exports = (sequelize, DataTypes) => {
  const Preoutstock = sequelize.define('Preoutstock', {
    pcode: DataTypes.STRING(50),
    ptime:DataTypes.STRING(50),
    pdescription:DataTypes.TEXT,
    total_weight:DataTypes.DECIMAL,
    total_volume:DataTypes.DECIMAL,
    total_freightfee:DataTypes.DECIMAL,
    user_id: DataTypes.INTEGER(11),
    has_out:DataTypes.INTEGER(1)
  }, {});
  Preoutstock.associate = function(models) {
    models.Preoutstock.belongsTo(models.User,
      {
        foreignKey:"user_id"
      }
    )
    models.Preoutstock.belongsToMany(models.Producttemp,{
      through:{
        model:models.Preoutitem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
    models.Preoutstock.hasMany(models.Preoutitem,
      {
        foreignKey:"master_id"
      }
    )
  }
  return Preoutstock;
};
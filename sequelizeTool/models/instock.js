'use strict';
module.exports = (sequelize, DataTypes) => {
  const Instock = sequelize.define('Instock', {
    code:DataTypes.STRING(50),
    c_time:DataTypes.STRING(50),
    description:DataTypes.TEXT,
    userInstock_id: DataTypes.INTEGER(11)
  }, {});
  Instock.associate = function(models) {
    Instock.belongsTo(models.User,
      {
        foreignKey:"userInstock_id"
      }
    )
    models.Instock.belongsToMany(models.Inventorymaterial,{
      through:{
        model:models.Initem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
  };
  return Instock;
};
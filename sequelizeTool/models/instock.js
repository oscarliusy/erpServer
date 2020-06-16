'use strict';
module.exports = (sequelize, DataTypes) => {
  const instock = sequelize.define('instock', {
    code:DataTypes.STRING(50),
    c_time:DataTypes.STRING(50),
    description:DataTypes.TEXT,
    userinstock_id: DataTypes.INTEGER(11)
  }, {});
  instock.associate = function(models) {
    instock.belongsTo(models.user,
      {
        foreignKey:"userInstock_id"
      }
    )
    models.instock.belongsToMany(models.inventorymaterial,{
      through:{
        model:models.initem,
        unique:false
      },
      foreignKey:'master_id',
      constraints:false
    })
  };
  return instock;
};
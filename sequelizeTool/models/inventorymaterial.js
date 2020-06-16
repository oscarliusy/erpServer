'use strict';
module.exports = (sequelize, DataTypes) => {
  const inventorymaterial = sequelize.define('inventorymaterial', {
    amount: DataTypes.INTEGER(11),
    description: DataTypes.TEXT,
    uniqueId:DataTypes.STRING(100),
    image:DataTypes.STRING(100),
    userPurchase_id:DataTypes.INTEGER(11),
    price:DataTypes.DECIMAL
  }, {});
  inventorymaterial.associate = function(models) {
    models.inventorymaterial.belongsTo(models.user,
      {
        foreignKey:"userPurchase_id"
      }
    )
    models.inventorymaterial.belongsToMany(models.instock,{
      through:{
        model:models.initem,
        unique:false
      },
      foreignKey:'materialName_id',
      constraints:false
    })
    models.inventorymaterial.hasMany(models.initem,
      {
        foreignKey:"materialName_id"
      }
    )
    //物料与产品多对多
    models.inventorymaterial.belongsToMany(models.producttemp,{
      through:{
        model:models.productmaterial,
        unique:false
      },
      foreignKey:'pmMaterial_id',
      constraints:false
    })
    models.inventorymaterial.hasMany(models.productmaterial,
      {
        foreignKey:"pmMaterial_id"
      }
    )
  }
  return inventorymaterial;
}
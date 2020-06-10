'use strict';
module.exports = (sequelize, DataTypes) => {
  const Inventorymaterial = sequelize.define('Inventorymaterial', {
    amount: DataTypes.INTEGER(11),
    description: DataTypes.TEXT,
    uniqueId:DataTypes.STRING(100),
    image:DataTypes.STRING(100),
    userPurchase_id:DataTypes.INTEGER(11),
    price:DataTypes.DECIMAL
  }, {});
  Inventorymaterial.associate = function(models) {
    models.Inventorymaterial.belongsTo(models.User,
      {
        foreignKey:"userPurchase_id"
      }
    )
    models.Inventorymaterial.belongsToMany(models.Instock,{
      through:{
        model:models.Initem,
        unique:false
      },
      foreignKey:'materialName_id',
      constraints:false
    })
    models.Inventorymaterial.hasMany(models.Initem,
      {
        foreignKey:"materialName_id"
      }
    )
    //物料与产品多对多
    models.Inventorymaterial.belongsToMany(models.Producttemp,{
      through:{
        model:models.Productmaterial,
        unique:false
      },
      foreignKey:'pmMaterial_id',
      constraints:false
    })
    models.Inventorymaterial.hasMany(models.Productmaterial,
      {
        foreignKey:"pmMaterial_id"
      }
    )
  }
  return Inventorymaterial;
}
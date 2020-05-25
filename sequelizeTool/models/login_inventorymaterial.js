'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_inventorymaterial = sequelize.define('Login_inventorymaterial', {
    amount: DataTypes.INTEGER(11),
    description: DataTypes.TEXT,
    uniqueId:DataTypes.STRING(100),
    image:DataTypes.STRING(100),
    userPurchase_id:DataTypes.INTEGER(11),
    price:DataTypes.DECIMAL
  }, {});
  Login_inventorymaterial.associate = function(models) {
    models.Login_inventorymaterial.belongsTo(models.Login_user,
      {
        foreignKey:"userPurchase_id"
      }
    )
    models.Login_inventorymaterial.belongsToMany(models.Login_instock,{
      through:{
        model:models.Login_initem,
        unique:false
      },
      foreignKey:'materialName_id',
      constraints:false
    })
    models.Login_inventorymaterial.hasMany(models.Login_initem,
      {
        foreignKey:"materialName_id"
      }
    )
    //物料与产品多对多
    models.Login_inventorymaterial.belongsToMany(models.Login_producttemp,{
      through:{
        model:models.Login_productmaterial,
        unique:false
      },
      foreignKey:'pmMaterial_id',
      constraints:false
    })
    models.Login_inventorymaterial.hasMany(models.Login_productmaterial,
      {
        foreignKey:"pmMaterial_id"
      }
    )
  }
  return Login_inventorymaterial;
}
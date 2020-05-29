'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_producttemp = sequelize.define('Login_producttemp', {
    sku: DataTypes.STRING(200),
    childAsin:DataTypes.STRING(50),
    title: DataTypes.TEXT,
    purchasePrice: DataTypes.DECIMAL,
    weight:DataTypes.DECIMAL,
    length: DataTypes.DECIMAL,
    width: DataTypes.DECIMAL,
    height:DataTypes.DECIMAL,
    volumeWeight: DataTypes.DECIMAL,
    dhlShippingFee: DataTypes.DECIMAL,
    packageFee: DataTypes.DECIMAL,
    opFee: DataTypes.DECIMAL,
    currency: DataTypes.DECIMAL,
    fbaFullfillmentFee: DataTypes.DECIMAL,
    shrinkage: DataTypes.DECIMAL,
    amazonReferralFee: DataTypes.DECIMAL,
    payoneerServiceFee: DataTypes.DECIMAL,
    amazonSalePrice: DataTypes.DECIMAL,
    margin: DataTypes.DECIMAL,
    marginRate: DataTypes.DECIMAL,
    productCostPercentage: DataTypes.DECIMAL,
    image: DataTypes.STRING(100),
    description: DataTypes.TEXT,
    c_time: DataTypes.STRING(50),
    creater_id: DataTypes.INTEGER(11),
    site_id: DataTypes.INTEGER(11),
    adcost:DataTypes.DECIMAL,
    freightFee: DataTypes.DECIMAL,
    tagpath: DataTypes.STRING(150),
  }, {});
  Login_producttemp.associate = function(models) {
    //物料与产品多对多
    models.Login_producttemp.belongsToMany(models.Login_inventorymaterial,{
      through:{
        model:models.Login_productmaterial,
        unique:false
      },
      foreignKey:'pmProduct_id',
      constraints:false
    })
    models.Login_producttemp.hasMany(models.Login_productmaterial,
      {
        foreignKey:"pmProduct_id"
      }
    )
    models.Login_producttemp.belongsTo(models.Login_user,
      {
        foreignKey:"creater_id"
      }
    )
    models.Login_producttemp.belongsTo(models.Login_site,
      {
        foreignKey:"site_id"
      }
    )
    models.Login_producttemp.belongsToMany(models.Login_preoutstock,{
      through:{
        model:models.Login_preoutitem,
        unique:false
      },
      foreignKey:'productName_id',
      constraints:false
    })
    models.Login_producttemp.hasMany(models.Login_preoutitem,
      {
        foreignKey:"productName_id"
      }
    )
    models.Login_producttemp.belongsToMany(models.Login_outstock,{
      through:{
        model:models.Login_outitem,
        unique:false
      },
      foreignKey:'productName_id',
      constraints:false
    })
    models.Login_producttemp.hasMany(models.Login_outitem,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return Login_producttemp;
};
'use strict';
module.exports = (sequelize, DataTypes) => {
  const producttemp = sequelize.define('producttemp', {
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
  producttemp.associate = function(models) {
    //物料与产品多对多
    models.producttemp.belongsToMany(models.inventorymaterial,{
      through:{
        model:models.productmaterial,
        unique:false
      },
      foreignKey:'pmProduct_id',
      constraints:false
    })
    models.producttemp.hasMany(models.productmaterial,
      {
        foreignKey:"pmProduct_id"
      }
    )
    models.producttemp.belongsTo(models.user,
      {
        foreignKey:"creater_id"
      }
    )
    models.producttemp.belongsTo(models.site,
      {
        foreignKey:"site_id"
      }
    )
    models.producttemp.belongsToMany(models.preoutstock,{
      through:{
        model:models.preoutitem,
        unique:false
      },
      foreignKey:'productName_id',
      constraints:false
    })
    models.producttemp.hasMany(models.preoutitem,
      {
        foreignKey:"productName_id"
      }
    )
    models.producttemp.belongsToMany(models.outstock,{
      through:{
        model:models.outitem,
        unique:false
      },
      foreignKey:'productName_id',
      constraints:false
    })
    models.producttemp.hasMany(models.outitem,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return producttemp;
};
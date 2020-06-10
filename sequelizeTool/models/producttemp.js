'use strict';
module.exports = (sequelize, DataTypes) => {
  const Producttemp = sequelize.define('Producttemp', {
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
  Producttemp.associate = function(models) {
    //物料与产品多对多
    models.Producttemp.belongsToMany(models.Inventorymaterial,{
      through:{
        model:models.Productmaterial,
        unique:false
      },
      foreignKey:'pmProduct_id',
      constraints:false
    })
    models.Producttemp.hasMany(models.Productmaterial,
      {
        foreignKey:"pmProduct_id"
      }
    )
    models.Producttemp.belongsTo(models.User,
      {
        foreignKey:"creater_id"
      }
    )
    models.Producttemp.belongsTo(models.Site,
      {
        foreignKey:"site_id"
      }
    )
    models.Producttemp.belongsToMany(models.Preoutstock,{
      through:{
        model:models.Preoutitem,
        unique:false
      },
      foreignKey:'productName_id',
      constraints:false
    })
    models.Producttemp.hasMany(models.Preoutitem,
      {
        foreignKey:"productName_id"
      }
    )
    models.Producttemp.belongsToMany(models.Outstock,{
      through:{
        model:models.Outitem,
        unique:false
      },
      foreignKey:'productName_id',
      constraints:false
    })
    models.Producttemp.hasMany(models.Outitem,
      {
        foreignKey:"productName_id"
      }
    )
  }
  return Producttemp;
};
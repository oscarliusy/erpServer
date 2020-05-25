/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_producttemp', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    sku: {
      type: DataTypes.STRING(200),
      allowNull: true,
      unique: true
    },
    childAsin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    purchasePrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    length: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    width: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    height: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    volumeWeight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    dhlShippingFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    packageFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    opFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    currency: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    fbaFullfillmentFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    shrinkage: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    amazonReferralFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    payoneerServiceFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    amazonSalePrice: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    margin: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    marginRate: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    productCostPercentage: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    c_time: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    creater_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'login_user',
        key: 'id'
      }
    },
    site_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'login_site',
        key: 'id'
      }
    },
    adcost: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    freightFee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    tagpath: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  }, {
    tableName: 'login_producttemp'
  });
};

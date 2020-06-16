'use strict';
module.exports = (sequelize, DataTypes) => {
  const currency = sequelize.define('currency', {
    name: DataTypes.STRING(45),
    exchangeRateRMB:DataTypes.FLOAT,
  }, {});
  currency.associate = function(models) {
    models.currency.hasMany(models.site,{
      foreignKey:"currency_id"
    })
  }
  return currency;
};
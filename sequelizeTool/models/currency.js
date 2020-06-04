'use strict';
module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define('Currency', {
    name: DataTypes.STRING(45),
    exchangeRateRMB:DataTypes.FLOAT,
  }, {});
  Currency.associate = function(models) {
    models.Currency.hasMany(models.Login_site,{
      foreignKey:"currency_id"
    })
  }
  return Currency;
};
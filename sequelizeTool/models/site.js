'use strict';
module.exports = (sequelize, DataTypes) => {
  const site = sequelize.define('site', {
    name: DataTypes.STRING(50),
    currency_id:DataTypes.INTEGER(11)
  }, {});
  site.associate = function(models) {
    models.site.hasMany(models.producttemp,{
      foreignKey:"site_id"
    })
    models.site.belongsTo(models.currency,{
      foreignKey:"currency_id"
    })
  }
  return site;
};
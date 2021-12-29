'use strict';
module.exports = (sequelize, DataTypes) => {
  const site = sequelize.define('site', {
    name: DataTypes.STRING(50),
    currency_id:DataTypes.INTEGER(11)
  }, {});
  site.associate = function(models) {
    //1对多：一个站点拥有多个产品
    models.site.hasMany(models.producttemp,{
      foreignKey:"site_id"
    })
    //1对1：一个站点拥有1种汇率
    models.site.belongsTo(models.currency,{
      foreignKey:"currency_id"
    })
  }
  return site;
};
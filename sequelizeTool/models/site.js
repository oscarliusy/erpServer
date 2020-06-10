'use strict';
module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define('Site', {
    name: DataTypes.STRING(50),
    currency_id:DataTypes.INTEGER(11)
  }, {});
  Site.associate = function(models) {
    models.Site.hasMany(models.Producttemp,{
      foreignKey:"site_id"
    })
    models.Site.belongsTo(models.Currency,{
      foreignKey:"currency_id"
    })
  }
  return Site;
};
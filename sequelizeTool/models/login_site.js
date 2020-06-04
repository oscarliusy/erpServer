'use strict';
module.exports = (sequelize, DataTypes) => {
  const Login_site = sequelize.define('Login_site', {
    name: DataTypes.STRING(50),
    currency_id:DataTypes.INTEGER(11)
  }, {});
  Login_site.associate = function(models) {
    models.Login_site.hasMany(models.Login_producttemp,{
      foreignKey:"site_id"
    })
    models.Login_site.belongsTo(models.Currency,{
      foreignKey:"currency_id"
    })
  }
  return Login_site;
};
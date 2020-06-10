'use strict';
module.exports = (sequelize, DataTypes) => {
  const Authority = sequelize.define('Authority', {
    code: DataTypes.STRING(45),
    descripiton: DataTypes.STRING(45)
  }, {});
  Authority.associate = function(models) {
    models.Authority.hasMany(models.User,{
      foreignKey:"authority_id"
    })
  }
  return Authority;
};
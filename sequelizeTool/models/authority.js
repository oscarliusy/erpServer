'use strict';
module.exports = (sequelize, DataTypes) => {
  const authority = sequelize.define('authority', {
    code: DataTypes.STRING(45),
    descripiton: DataTypes.STRING(45)
  }, {});
  authority.associate = function(models) {
    models.authority.hasMany(models.user,{
      foreignKey:"authority_id"
    })
  }
  return authority;
};
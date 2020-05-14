'use strict';
module.exports = (sequelize, DataTypes) => {
  const testtable = sequelize.define('testtable', {
    name: DataTypes.STRING(45),
    age: DataTypes.STRING(45),
  }, {});
  testtable.associate = function(models) {
  };
  return testtable;
};
/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('testtable', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    age: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'testtable'
  });
};

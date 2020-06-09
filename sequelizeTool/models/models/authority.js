/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('authority', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: '001'
    },
    descripiton: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    tableName: 'authority'
  });
};

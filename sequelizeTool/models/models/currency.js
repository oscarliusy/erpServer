/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('currency', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    exchangeRateRMB: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'currency'
  });
};

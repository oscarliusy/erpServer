/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_outitem', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    amountOut: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    master_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'login_outstock',
        key: 'id'
      }
    },
    productName_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'login_producttemp',
        key: 'id'
      }
    },
    volume: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    freightfee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    site: {
      type: DataTypes.STRING(30),
      allowNull: true
    }
  }, {
    tableName: 'login_outitem'
  });
};

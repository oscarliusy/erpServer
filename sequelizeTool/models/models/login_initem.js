/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_initem', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    amountIn: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    master_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'login_instock',
        key: 'id'
      }
    },
    materialName_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'login_inventorymaterial',
        key: 'id'
      }
    }
  }, {
    tableName: 'login_initem'
  });
};

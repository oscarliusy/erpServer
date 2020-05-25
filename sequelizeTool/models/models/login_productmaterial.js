/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_productmaterial', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    pmAmount: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    pmMaterial_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'login_inventorymaterial',
        key: 'id'
      }
    },
    pmProduct_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'login_producttemp',
        key: 'id'
      }
    }
  }, {
    tableName: 'login_productmaterial'
  });
};

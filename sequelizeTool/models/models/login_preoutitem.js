/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_preoutitem', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    master_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'login_preoutstock',
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
    }
  }, {
    tableName: 'login_preoutitem'
  });
};

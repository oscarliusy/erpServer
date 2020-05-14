/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_instock', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    c_time: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userInstock_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'login_user',
        key: 'id'
      }
    }
  }, {
    tableName: 'login_instock'
  });
};

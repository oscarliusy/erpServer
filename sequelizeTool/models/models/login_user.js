/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_user', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true
    },
    sex: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    c_time: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'login_user'
  });
};

/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_outstock', {
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
    userOutstock_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'login_user',
        key: 'id'
      }
    },
    total_freightfee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    total_volume: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    total_weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'login_outstock'
  });
};

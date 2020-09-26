/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('preoutstock', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    pcode: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ptime: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    pdescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_weight: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    total_volume: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    total_freightfee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'login_user',
        key: 'id'
      }
    },
    has_out: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'preoutstock'
  });
};

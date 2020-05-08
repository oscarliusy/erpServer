/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('login_inventorymaterial', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uniqueId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    userPurchase_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'login_user',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'login_inventorymaterial'
  });
};

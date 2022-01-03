'use strict';
const DataTypes = require('sequelize/lib/data-types');
module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      修改数据库
      使outitem表增加一个字段
    */
    return queryInterface.addColumn('outitem', 'brand', {
      type: DataTypes.STRING(30),
      defaultValue: ""
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      执行失败时的回滚指令
    */
    return queryInterface.removeColumn('outitem', 'brand');
  }
};

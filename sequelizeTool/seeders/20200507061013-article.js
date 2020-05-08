'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Articles', [
      {
        title:'进入大门',
        content:'看见一座雕塑',
        createdAt:new Date(),
        updatedAt:new Date(),
      },
      {
        title:'进入后院',
        content:'看见一只狮子',
        createdAt:new Date(),
        updatedAt:new Date(),
      }
    ], {});
},

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Articles', null, {});
  }
};

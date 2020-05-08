'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('News', [
      {
        title:'Covid-19',
        content:'全球380w',
        createdAt:new Date(),
        updatedAt:new Date(),
      },
      {
        title:'sars',
        content:'全球100万',
        createdAt:new Date(),
        updatedAt:new Date(),
      }
    ], {});
},

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('News', null, {});
  }
};

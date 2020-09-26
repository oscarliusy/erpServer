const models = require('../sequelizeTool/models')
const assert = require('assert')

describe('sequelize SQL',()=>{
  it('create',async()=>{
    let res = await models.testtable.create({
      name:'foo',
      age:10
    })
    console.log(res)
    assert(1)
  })
  it.only('articles',async()=>{
    let reqBody = {
      title:'门开了',
      content:'好像有呼吸声',
    }
    const articles = await models.Article.create(reqBody)
    console.log(articles)
    assert(1)
  })
})
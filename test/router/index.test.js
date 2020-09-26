const Router = require('../../src/router')
const assert = require('assert')

describe('router',()=>{
  it('index.js',()=>{
    console.log('Router',Router.routes,Router.allowedMethods)
    assert(1)
  })
})
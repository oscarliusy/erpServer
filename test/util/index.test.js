const Util = require('../../src/util')
const assert = require('assert')

describe('index.js',()=>{
  it('getModules',()=>{
    let mods = Util.getModules('src/router')
    console.log('mods',mods)
    //assert(!mods)
  })
})
const assert = require('assert')
const models = require('../../sequelizeTool/models/index.js')
const {findPreoutstockById,preoutstockCreate} = require('../../src/controller/product')
const mysql = require('mysql2/promise')

const options = {
  host: 'localhost',
  user: 'root',
  password:"123456",
  database: 'erpdb20200925'
}



const data = {
  pcode:"aaa",
  pdescription:"bbb",
  user_id:1,
  total_weight:"1.000",
  total_volume:"0.000",
  total_freightfee:"155.000",
  has_out:0,
  products:[
    { key: 0, sku: 'zixingchebali-110mm', amount: 1, id: 1 },
    { key: 1, sku: 'zixingchebali-90mm', amount: '2', id: 2 },
    { key: 2, sku: 'zixingcheliantiao-6-8', amount: '3', id: 53 },
    { key: 3, sku: 'zixingcheliantiao-8', amount: '4', id: 54 },
    { key: 4, sku: 'zixingcheliantiao-9', amount: '5', id: 55 },
    { key: 5, sku: 'zixingchebaofangyuzhao', amount: '6', id: 56 },
    { key: 6, sku: 'zixingcheliantiao-9-CA', amount: '7', id: 439 }
  ]
}
const skus = [
  "RifleCasesBlack1","RifleCasesDarkGreen1","RifleCasesSand",
  "skateboard-gloves","skateboard-gloves Black/ Yellow-one bloc",
"skateboard-gloves Black/ Yellow-two bloc","Snowball Maker-Blue+Green"]

let connection

describe('预出库测试集',()=>{
  // before(async()=>{
  //   connection = await mysql.createConnection(options)
  // })
  // after(async()=>{
  //   await connection.end()
  // })
  it('build pre params',async()=>{
    let addObj = await buildPreoutstockUpdataParams(data)
    console.log(addObj)
    assert(1)
  })
  it('create pre obj',async()=>{
    let addObj = await buildPreoutstockUpdataParams(data)
    let preoutstockObj = await models.preoutstock.create(addObj)
    console.log(preoutstockObj.id)
  })
  it('create preoutItem',async()=>{
    let addObj = await _buildPreoutstockUpdataParams(data)
    let preoutstockObj = await models.preoutstock.create(addObj)
    await _createPreoutstockItem(preoutstockObj,data)
    const result = await findPreoutstockById(preoutstockObj.id)
    console.log(result)
  })
  it('find ids of skus',async()=>{
    const products = await models.producttemp.findAll({
      where:{
        sku:skus
      },
      attributes:['id','sku']
    })
    products.forEach(item=>{
      console.log(item.id,item.sku)
    })
  })
  it.only('复现bug',async()=>{
    await preoutstockCreate(data)
  })
  it('mysql2',async()=>{
    const [rows,fields] = await connection.execute('SELECT * FROM erpdb20200925.preoutitem where master_id=248;')
    console.log(rows[0])//{ id: 9500, amount: 1, master_id: 248, productName_id: 1 }
  })
})

const _preoutstockCreate = async(params)=>{
  try {
    let addObj = await _buildPreoutstockUpdataParams(params)
    let preoutstockObj = await models.preoutstock.create(addObj)
    await _createPreoutstockItem(preoutstockObj,params)
    return {
      status:'succeed',
      msg:'已成功创建预出库项'
    }
  }
  catch(err){
    console.log('preoutstockCreate-ERROR:',err)
    return {
      status:'failed',
      msg:'创建失败'
    }
  }
}

const _createPreoutstockItem = async(preoutstockObj,params)=>{
  const preId = preoutstockObj.id
  for(let item of params.products){
    let _amount = Number(item.amount)
    let _id = Number(item.id)
    await models.sequelize.query(`INSERT INTO preoutitem (amount,master_id,productName_id) VALUES (${_amount},${preId},${_id})`).spread((results,metadata)=>{
      //console.log(results)
    })
  }
}

const _buildPreoutstockUpdataParams = async(params) =>{
  let preUpdateObj = {
    ...params,
    ptime:String(Date.now()),
    total_weight: Number(params.total_weight),
    total_volume:  Number(params.total_volume),
    total_freightfee:  Number(params.total_freightfee),
  }
  delete preUpdateObj.id
  delete preUpdateObj.products
  
  return preUpdateObj
}

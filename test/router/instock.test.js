/**
 * 目标：测试controller/material中与入库相关的函数
 * 1.查询5个sku的数量
 * 2.对入库函数测试
 */
const assert = require('assert')
const {findIMByUniqueid,findInstockDetail,instock} = require('../../src/controller/material')
const models = require('../../sequelizeTool/models')

const skus = [
  {uniqueId: "zixingcheVshashachepi-Hei-201900311", instockAmount: 1},
  {uniqueId: "zixingcheshachejiaqi-V sha-Hei-201900311", instockAmount: 2},
  {uniqueId: "ZiXingCheDangNiBan-Hei-FanGuangKuan-201900073", instockAmount: 3},
  {uniqueId: "zixingchedangnibanluosi-taozhuang-201900006", instockAmount: 4},
  {uniqueId: "zixingchefanguangtiao-lv-201900005 ", instockAmount: 5}
]

const findAmountByUid = (uid,skus) =>{
  let amount = 0
  for(let i=0;i<skus.length;i++){
    let _uid = skus[i].uniqueId.toString().trim()
    if(_uid === uid){
      amount = skus[i].instockAmount
      break
    }
  }
  return amount
}
const instockDetailDataHandler = async(result)=>{
  let data = {}
  data.total = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    temp.uniqueId = item.inventorymaterial.uniqueId
    temp.amountIn = item.dataValues.amountIn//此处需更新
    temp.amount = item.inventorymaterial.amount
    return temp
  })
  return data
}

describe('instock tests',()=>{
  it('get 5 iteminfo',async()=>{
    for(let i=0;i<skus.length;i++){
      let _uid = skus[i]["uniqueId"]
      let _data = await findIMByUniqueid(_uid)
      skus[i]["amount"] = _data.amount
    }
    console.log(skus)
    assert(1)
  })
  it('update amount test',async()=>{
    const uniqueIds = skus.map((item,index)=>{
      return item.uniqueId
    })
    const imList = await models.inventorymaterial.findAll({
      where:{
        uniqueId:uniqueIds
      }
    })

    imList.forEach((item,index)=>{
      let amountAdd = findAmountByUid(item.uniqueId,skus)
      let amountNew = item.amount + amountAdd
      item.update({
        amount:amountNew
      })
    })

    //创建入库对象
    const instockObj = await models.instock.create({
      code:'debug-test',
      description: 'debug-test',
      c_time:Date.now(),
      userInstock_id:3
    })

    //console.log('ids',instockObj.id,imList[0].id)

    imList.map(async(item,index)=>{
      let amountAdd = findAmountByUid(item.uniqueId,skus)
      // instockObj.setInventorymaterials(item,{through:{amountIn:amountAdd}})
      await models.sequelize.query(`INSERT INTO initem (amountIn,master_id,materialName_id) VALUES (${amountAdd},${instockObj.id},${item.id})`)
    })
    

    assert(1)
  })
  it('findAll test',async()=>{
    const uniqueIds = skus.map((item,index)=>{
      return item.uniqueId
    })
    //console.log('uids:',uniqueIds)

    const imList = await models.inventorymaterial.findAll({
      where:{
        uniqueId:uniqueIds
      }
    })

    const ims = imList.map((item,index)=>{
      let _obj = {}
      _obj.uniqueId = item.dataValues.uniqueId
      _obj.amount = item.dataValues.amount
      return _obj
    })

    console.log('ims:',ims)
    assert.strictEqual(skus.length,imList.length)
  })
  it('findInstockDetail test',async()=>{
    const result = await models.initem.findAndCountAll({
      where:{
        master_id:133
      },
      order:[['id','ASC']] ,//ASC:正序  DESC:倒序
      offset:0,
      limit:10,
      attributes:['amountIn'],
      include:[{
        model:models.inventorymaterial,
        attributes:['uniqueId','amount']
      }],
    })
    const data =await instockDetailDataHandler(result)
    console.log(data)
    assert(1)
  })
  it.only('实测instock函数',async()=>{
    const params = {
      code:'bug-test-instock',
      description:'bug-test-instock',
      createAt:Date.now(),
      userId:1,
      data:{
        dataSource:skus,
        count:skus.length
      }
    }
    const data = await instock(params)
    console.log(data)
    assert(1)
  })
})
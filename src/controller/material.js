const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op
const CONSTANT = require('../constant/models')

const findInventoryMaterialList = async(params) =>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''
  const sort = parseInt(params.sort) === 1?'DESC':'ASC'

  //多字段模糊查询
  let where = {}
  if(keyword){
    where = {
      [Op.or]:[
        {description:{[Op.like]:'%' + keyword + '%'}},
        {uniqueId:{[Op.like]:'%' + keyword + '%'}}
      ]
    }
  }

  const result = await models.inventorymaterial.findAndCountAll({
    order:[['amount',sort]] ,//ASC:正序  DESC:倒序
    where:where,
    offset:offset,
    limit:limited,
    include:[models.user]
  })

  let data = IMDataHandler(result)
  return data
}

const getIMtotalNumber = async()=>{
  let totalNum = 0,totalCost = 0
  await models.sequelize.query('SELECT sum(amount) FROM erpdb.inventorymaterial').spread(function (results, metadata) {
    // results:[ TextRow { 'sum(amount)': '5129' } ]
    totalNum = results[0]['sum(amount)']
  });
  await models.sequelize.query('SELECT sum(amount*price) FROM erpdb.inventorymaterial').spread(function (results, metadata) {
    // results:[ TextRow { 'sum(amount*price)': '5129' } ]
    totalCost = results[0]['sum(amount*price)']
  });
  return {
    totalNum,
    totalCost
  }
}

const findIMListForInstork= async(params) =>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''

  //多字段模糊查询
  let where = {}
  if(keyword){
    where = {
      [Op.or]:[
        {description:{[Op.like]:'%' + keyword + '%'}},
        {uniqueId:{[Op.like]:'%' + keyword + '%'}}
      ]
    }
  }

  const result = await models.inventorymaterial.findAndCountAll({
    where:where,
    offset:offset,
    limit:limited,
    attributes:['id','uniqueId','description','amount']
  })

  let data = IMDataSearchHandler(result)

  return data
}

const findInventoryMaterialById = async(id)=>{
  const usersList = await models.user.findAll({
    attributes:['id','name']
  })
  const result = await models.inventorymaterial.findOne({
    where:{id:id}
  })
  let data = JSON.parse(JSON.stringify(result))
  data.usersList = usersList
  return data
}

const findIMByUniqueid = async(uniqueid)=>{
  const result = await models.inventorymaterial.findOne({
    where:{uniqueId:uniqueid}
  })
  let data = JSON.parse(JSON.stringify(result))
  return data
}


const changeInventoryMaterial = async(params)=>{
  let IMObj = buildImObj(params)
  await models.inventorymaterial.update(IMObj,{
    where:{
      id:params.id
    }
  })

  await models.log.create({
    user_id:params.decodedInfo.id,
    createAt:Date.now(),
    type:CONSTANT.LOG_TYPES.MATERIAL,
    action:`编辑:${IMObj.uniqueId}`
  })
  return {
    msg:'已成功更新数据',
    id:params.id
  }
}

const deleteMaterial = async function(params) {
  let getProductSql = `SELECT DISTINCT pro.id,pro.sku FROM productmaterial pm
	inner JOIN producttemp pro ON pm.pmProduct_id = pro.id
WHERE pm.pmMaterial_id = ${params.id}`

  let message = ""
  let [productResult, metadata] = await models.sequelize.query(getProductSql)
  
  if(productResult.length != 0) {
    let idList = []
    productResult.map(item =>{
      idList.push(item.sku)
    })
    message = "有如下产品与该物料(SKU)关联：" + idList.toString()
    
  }else{
    let deleteSql = `delete from inventorymaterial where id = $1`
    await models.sequelize.query(deleteSql,{
      bind:[params.id]
    })
    message = "success"
  }
  return message
}

 /**
  * 1.build数据
  * 2.查找uniqueId重名
  * 3.有重名返回失败
  * 4.无重名则创建,并返回成功
  */
const addInventoryMaterial = async(params)=>{
  let IMObj = buildImObj(params)
  let checkRes = await models.inventorymaterial.count({
    where:{
      uniqueId:IMObj.uniqueId
    }
  })

  if(checkRes){
    return {
      type:'error',
      msg:'uniqueId已存在,请重新命名',
    }
  }else{
    let addRes = await models.inventorymaterial.create(IMObj)
    return {
      type:'success',
      msg:'已成功新增',
      id:addRes.id
    }
  }
}

/**
 *零星入库 
 *0.根据uniqueId查询物料对象,更新其数量
 *1.检查是否存在重名,创建instock对象
 *2.创建initem对象
 */
const instock = async(params)=>{
  await createInstock(params) 

  //let res = await findInstockDetail()
  return {
    msg:'已创建成功'
  }
}

const createInstock = async(params) =>{
  //找出物料对象
  //如果数据库中的物料前后是有空格，无法入库-----待修复bug
  const IMuniqueIds = params.data.dataSource.map(item=>{
    return item.uniqueId
  })

  const IMObjList = await models.inventorymaterial.findAll({
    where:{
      uniqueId:IMuniqueIds
    }
  })

  //物料对象入库增加数量
  IMObjList.map((item,index)=>{
    let amountAdd = findAmountByUid(item.uniqueId,params.data.dataSource)
    let amountNew = item.amount + amountAdd
    item.update({
      amount:amountNew
    })
    //console.log(item.uniqueId+'变为'+amountNew)
  })

  //创建入库对象
  const instockObj = await models.instock.create({
    code:params.code,
    description: params.description,
    c_time:params.createAt,
    userInstock_id:params.userId
  })

  //创建关联initem对象
  IMObjList.map((item,index)=>{
    let amountAdd = findAmountByUid(item.uniqueId,params.data.dataSource)
    //instockObj.setInventorymaterials(item,{through:{amountIn:params.data.dataSource[index].instockAmount}}) 失效，不明确原因
    models.sequelize.query(`INSERT INTO initem (amountIn,master_id,materialName_id) VALUES (${amountAdd},${instockObj.id},${item.id})`)
  })
}

/**
 * 
 * @param {String} uid 物料的uniqueId 
 * @param {Array} skus 入库的参数列表 
 */
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

/**
 * @param {id,offset,limited} params 
 * 1.根据id查询符合条件的initem
 * 2.根据initem中的id获取符合条件的IM
 * 3.将二者拼接成符合需求的data
 */
const findInstockDetail = async(params)=>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const result = await models.initem.findAndCountAll({
    where:{
      master_id:params.id
    },
    order:[['id','ASC']] ,//ASC:正序  DESC:倒序
    offset:offset,
    limit:limited,
    attributes:['amountIn'],
    include:[{
      model:models.inventorymaterial,
      attributes:['uniqueId','amount']
    }],
  })

  const data = await instockDetailDataHandler(result)
  return data
}

const instockDetailDataHandler = async(result)=>{
  let data = {}
  data.total = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    temp.uniqueId = item.inventorymaterial.uniqueId
    temp.amount = item.inventorymaterial.amount
    temp.amountIn = item.dataValues.amountIn
    return temp
  })
  return data
}

const findInstockList = async(params)=>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''

  const result = await models.instock.findAndCountAll({
    order:[['id','DESC']] ,//ASC:正序  DESC:倒序
    offset:offset,
    limit:limited,
    include:[models.user]
  })
  let data = InstockDataHandler(result)
  return data
}

const findEditLog = async(params) =>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const result = await models.log.findAndCountAll({
    order:[['id','DESC']] ,
    offset:offset,
    limit:limited,
    include:[models.user],
    where:{
      type:CONSTANT.LOG_TYPES.MATERIAL
    }
  })
  let data = editLogDataHandler(result)
  return data
}

const editLogDataHandler = (result) =>{
  let data = {}
  data.total = result.count
  let editKey = CONSTANT.MATERIAL_EDITLOG_KEYS
  data.list = result.rows.map(item=>{
    let temp = {}
    editKey.forEach(key=>{
      if(key === 'user'){
        temp.user = item.user.name
      }else{
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const findPurchasers = async()=>{
  const usersList = await models.user.findAll({
    attributes:['id','name']
  })
  return usersList
}

const InstockDataHandler = (result)=>{
  let data = {}
  let instockKeys = CONSTANT.INSTOCKKEYS
  data.total = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    instockKeys.forEach(key=>{
      if(key === 'userInstock_id'){
        temp.user = item.user.name
      }else{
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}
//处理inventorymaterial的数据,按新的顺序包装一下,将外键查询的User放进来
const IMDataHandler = (result) => {
  let data = {}
  let inventoryMaterialKeys = CONSTANT.IMKEYS
  data.totalInventory = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    inventoryMaterialKeys.forEach(key=>{
      if(key === 'userPurchase_id'){
        temp.purchaser = item.user.name
      }else{
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const IMDataSearchHandler = (result) => {
  let data = {}
  data.totalInventory = result.count
  data.list = result.rows
  return data
}

const buildImObj = (params)=>{
  var uniqueId = params.uniqueId
  uniqueId = uniqueId.trim()
  return {
      amount: parseInt(params.amount),
      description: params.description,
      uniqueId: uniqueId,
      image: params.image,
      userPurchase_id: parseInt(params.userPurchase_id),
      price: parseFloat(params.price),
  }
}

module.exports = {
  findInventoryMaterialList,
  findInventoryMaterialById,
  changeInventoryMaterial,
  addInventoryMaterial,
  findPurchasers,
  findIMListForInstork,
  instock,
  findInstockList,
  findInstockDetail,
  findEditLog,
  getIMtotalNumber,
  findIMByUniqueid,
  deleteMaterial
}

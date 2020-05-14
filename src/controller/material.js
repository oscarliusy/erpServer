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

  const result = await models.Login_inventorymaterial.findAndCountAll({
    order:[['amount',sort]] ,//ASC:正序  DESC:倒序
    where:where,
    offset:offset,
    limit:limited,
    include:[models.Login_user]
  })

  let data = IMDataHandler(result)
  return data
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

  const result = await models.Login_inventorymaterial.findAndCountAll({
    where:where,
    offset:offset,
    limit:limited,
    attributes:['id','uniqueId','description','amount']
  })

  let data = IMDataSearchHandler(result)

  return data
}

const findInventoryMaterialById = async(id)=>{
  const usersList = await models.Login_user.findAll({
    attributes:['id','name']
  })
  const result = await models.Login_inventorymaterial.findOne({
    where:{id:id}
  })
  let data = JSON.parse(JSON.stringify(result))
  data.usersList = usersList
  return data
}

const changeInventoryMaterial = async(params)=>{
  let IMObj = buildImObj(params)
  await models.Login_inventorymaterial.update(IMObj,{
    where:{
      id:params.id
    }
  })
  
  return {
    msg:'已成功更新数据',
    id:params.id
  }
}

 /**
  * 1.build数据
  * 2.查找uniqueId重名
  * 3.有重名返回失败
  * 4.无重名则创建,并返回成功
  */
const addInventoryMaterial = async(params)=>{
  let IMObj = buildImObj(params)
  let checkRes = await models.Login_inventorymaterial.count({
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
    let addRes = await models.Login_inventorymaterial.create(IMObj)
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
  const IMuniqueIds = params.data.dataSource.map(item=>{
    return item.uniqueId
  })

  const IMObjList = await models.Login_inventorymaterial.findAll({
    where:{
      uniqueId:IMuniqueIds
    }
  })

  //物料对象入库增加数量
  IMObjList.map((item,index)=>{
    let amountNew = item.amount + params.data.dataSource[index].instockAmount
    item.update({
      amount:amountNew
    })
    //console.log(item.uniqueId+'变为'+amountNew)
  })

  //创建入库对象
  const instockObj = await models.Login_instock.create({
    code:params.code,
    description: params.description,
    c_time:params.createAt,
    userInstock_id:params.userId
  })

  //创建关联initem对象
  IMObjList.map((item,index)=>{
    instockObj.setLogin_inventorymaterials(item,{through:{amountIn:params.data.dataSource[index].instockAmount}})
  })
}

const findInstockDetail = async()=>{
  const instockItem = await models.Login_instock.findOne({
    where:{
      code:'test-003'
    },
    //关联物料数据和initem数据
    include:{
      model:models.Login_inventorymaterial,
      through: { attributes: ['amountIn'] }
    }
  })
 return instockItem
}

const findPurchasers = async()=>{
  const usersList = await models.Login_user.findAll({
    attributes:['id','name']
  })
  return usersList
}
//处理inventorymaterial的数据,按新的顺序包装一下,将外键查询的Login_user放进来
const IMDataHandler = (result) => {
  let data = {}
  let inventoryMaterialKeys = CONSTANT.IMKEYS
  data.totalInventory = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    inventoryMaterialKeys.forEach(key=>{
      if(key === 'userPurchase_id'){
        temp.purchaser = item.Login_user.name
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
  return {
      amount: parseInt(params.amount),
      description: params.description,
      uniqueId: params.uniqueId,
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
  instock

}
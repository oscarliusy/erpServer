const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op
const CONSTANT = require('../constant/models')

const findInventoryMaterialList = async(params) =>{
  const offset = parseInt(params.offset) || 1
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

// { id: 918,
//   uniqueId: 'shuiqiu-set of 1-lv-201800950',
//   amount: 299,
//   description: '水球-单个-绿色',
//   purchaser: 'FAN',
//   price: '1.00',
//   image: '/photos/americanfootball.jpg',
//   userPurchase_id: 3,
//   authToken: 'itisatoken' }
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

const buildImObj = (params)=>{
  return {
      amount: parseInt(params.amount),
      description: params.description,
      uniqueId: params.uniqueId,
      image: '/photos/americanfootball.jpg',
      userPurchase_id: parseInt(params.userPurchase_id),
      price: parseFloat(params.price),
  }
}

module.exports = {
  findInventoryMaterialList,
  findInventoryMaterialById,
  changeInventoryMaterial
}
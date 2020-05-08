const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op

const findInventoryMaterialList = async(params) =>{
  const offset = parseInt(params.offset) || 1
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''
  const sort = parseInt(params.sort) === 1?'ASC':'DESC'

  let where = {}
  // if(keyword){
  //   where.description = {
  //     [Op.like]:'%' + keyword + '%'
  //   }
  // }

  if(keyword){
    where = {
      [Op.or]:[
        {description:{[Op.like]:'%' + keyword + '%'}},
        {uniqueId:{[Op.like]:'%' + keyword + '%'}}
      ]
    }
  }

  const data = {}
  const result = await models.Login_inventorymaterial.findAndCountAll({
    order:[['amount',sort]] ,//ASC:正序  DESC:倒序
    where:where,
    offset:offset,
    limit:limited
  })
  data.totalInventory = result.count
  data.list = result.rows
  
  return data
}

module.exports = {
  findInventoryMaterialList
}
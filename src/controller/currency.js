const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op
const CONSTANT = require('../constant/models')

const findSiteList = async()=>{
  const result = await models.Site.findAndCountAll({
    include:[{
      model:models.Currency
    }]
  })

  const data = siteCurrencyDataHandler(result)
  return data
}

const siteCurrencyDataHandler = (result) =>{
  let data = {}
  data.total = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    temp.site = item.name
    temp.currency = item.Currency.name
    return temp
  })
  return data
}

const findExchangeRate = async()=>{
  const result = await models.Currency.findAndCountAll()
  const data = exchangeRateDataHandler(result)
  return data
}

const exchangeRateDataHandler = (result) =>{
  let data = {}
  data.total = result.count
  data.exchangeRate = {}
  result.rows.forEach(item=>{
   data.exchangeRate[item.name] = item.exchangeRateRMB
  })
  return data
}

const updateSiteCurrency = async(params)=>{
  let status = 'failed' ,msg=''
  try{
    let currencyObj = await models.Currency.findOne({
      where:{
        name:params.currency
      }
    })
    let siteObj = await models.Site.findOne({
      where:{
        name:params.site
      }
    })

    if(siteObj.currency_id !== currencyObj.id){
      await siteObj.update({
        currency_id:currencyObj.id
      })
    }

    await models.Log.create({
      user_id:params.decodedInfo.id,
      createAt:Date.now(),
      type:CONSTANT.LOG_TYPES.CURRENCY,
      action:`修改站点货币对:${params.site}-${params.currency}`
    })

    status = 'success'
    msg = '已成功修改'
  }
  catch(err){
    console.log('changeSiteCurrency-ERROR:',err)
    status = 'failed'
    msg = '修改失败'
  }
  finally{
    return {
      status,
      msg
    }
  }

}

const updateExchangeRate = async(params)=>{
  let status = 'failed' ,msg=''
  try{
    if(params.currency !== 'CNY'){
      await models.Currency.update({
        exchangeRateRMB:params.exchangeRate
      },{
        where:{
          name:params.currency
        }
      })
      msg = '已成功修改汇率'
      status = 'success'
      await models.Log.create({
        user_id:params.decodedInfo.id,
        createAt:Date.now(),
        type:CONSTANT.LOG_TYPES.CURRENCY,
        action:`修改汇率:${params.currency}-${params.exchangeRate}`
      })
    }else{
      msg = '无法修改本币汇率'
      status = 'failed'
    }
  }
  catch(err){
    console.log('updateExchangeRate-ERROR:',err)
    status = 'failed'
    msg = '修改失败'
  }
  finally{
    return {
      status,
      msg
    }
  }
}

const findEditLog = async(params) =>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const result = await models.Log.findAndCountAll({
    order:[['id','DESC']] ,
    offset:offset,
    limit:limited,
    include:[models.User],
    where:{
      type:CONSTANT.LOG_TYPES.CURRENCY
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
        temp.user = item.User.name
      }else{
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

module.exports = {
  findSiteList,
  findExchangeRate,
  updateSiteCurrency,
  updateExchangeRate,
  findEditLog
}
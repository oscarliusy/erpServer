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

module.exports = {
  findSiteList,
  findExchangeRate,
  updateSiteCurrency,
  updateExchangeRate
}
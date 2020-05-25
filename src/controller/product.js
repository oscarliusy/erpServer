const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op
const CONSTANT = require('../constant/models')

const findProductList = async(params) =>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''

  //多字段模糊查询
  let where = {}
  if(keyword){
    where = {
      [Op.or]:[
        {description:{[Op.like]:'%' + keyword + '%'}},
        {sku:{[Op.like]:'%' + keyword + '%'}},
        {childAsin:{[Op.like]:'%' + keyword + '%'}},
        {title:{[Op.like]:'%' + keyword + '%'}}
      ]
    }
  }

  const result = await models.Login_producttemp.findAndCountAll({
    //order:[['id','DESC']] ,//ASC:正序  DESC:倒序
    where:where,
    offset:offset,
    limit:limited,
    include:[models.Login_user,models.Login_site,models.Login_site,models.Login_inventorymaterial]
  })

  let data = productDataHandler(result)
  return data
}

/**
 * 需要在前6位显示id,site,sku,childAsin,title,image,后面随意
 */
const productDataHandler = (result) => {
  let data = {}
  let PRODUCT_KEYS = CONSTANT.PRODUCTKEYS
  data.total = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    PRODUCT_KEYS.forEach(key=>{
      if(key === 'site'){
        temp.site = item.Login_site.name
      }
      else if(key === 'creator'){
        temp.creator = item.Login_user.name
      }
      else if(key == "materials"){
        let materialList = []
        if(item.Login_inventorymaterials.length){
          materialList = item.Login_inventorymaterials.map(imItem=>{
            let matItem = {}
            matItem.name = imItem.uniqueId || ''
            matItem.amount = imItem.Login_productmaterial.pmAmount || ''
            return matItem
          })
        }
        temp.materials = materialList
      }
      else{
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const findSites = async()=>{
  const siteList = await models.Login_site.findAll({
    attributes:['id','name']
  })
  return siteList
}

const findProductById = async(id)=>{
  const siteMap = await models.Login_site.findAll({
    attributes:['id','name']
  })

  // const usersList = await models.Login_user.findAll({
  //   attributes:['id','name']
  // })

  const result = await models.Login_producttemp.findOne({
    where:{id:id},
    include:[models.Login_inventorymaterial]
  })
  
  let data = {}
  data.detail = productDetailHandler(result,siteMap)
  return data
}

const productDetailHandler = (result,siteMap)=>{
  let data = JSON.parse(JSON.stringify(result))
  delete data.Login_inventorymaterials
  data.siteMap = siteMap
  data.materials = result.Login_inventorymaterials.map(item=>{
    let temp = {}
    temp.id = item.id
    temp.uniqueId = item.uniqueId
    temp.amount = item.Login_productmaterial.pmAmount
    return temp
  })
  return data
}

/**
 * 
 * 1.获取来自前端的修改数据
 * 2.根据id从数据库查询出该产品
 * 3.判断数据项是否发生了修改
 *  3.1 如果修改了非数据项,直接更新
 *  3.2 如果修改了数据项,根据产品数据重新计算,最后完成更新
 */
const changeProduct = async(params)=>{
  const productOrigin = await models.Login_producttemp.findOne({
    where:{id:params.id},
    include:[models.Login_inventorymaterial]
  })
  
  //检查计算项是否发生了改变
  const isComputedAttributesChanged = checkProductParams(params,productOrigin)
  if(!isComputedAttributesChanged){
    //console.log('非计算项改变')
    //更新非数据项
    updateProduct(params)
  }else{
    //更新各种计算项
    //console.log('计算项改变')
    updateCalcProduct(params,productOrigin)
  }
  updateProductMaterial(params)
  return {
    msg:'已成功更新数据',
    id:params.id
  }
}

const updateCalcProduct = async(params,productOrigin) =>{
  let productObj = buildProductObjCompute(params,productOrigin)
  //console.log('obj',productObj)
  try{
    await models.Login_producttemp.update(productObj,{
      where:{
        id:params.id
      }
    })
  }
  catch(err){
    console.log('updateCalcProduct-ERROR',err)
  }
  
}

const updateProduct = async(params)=>{
  let productObj = buildProductObjWithoutCompute(params)
  await models.Login_producttemp.update(productObj,{
    where:{
      id:params.id
    }
  })
}

//1.查找表productmaterail中pmProduct_id等于params.id的对象并删除
//2.根据params.id,materials.item的id和amount,创建pm表新对象
const updateProductMaterial = async(params)=>{
  await models.Login_productmaterial.destroy({
    where:{
      pmProduct_id:params.id
    }
  })
  try{
    params.materials.forEach(item=>{
      models.Login_productmaterial.create({
        pmProduct_id:params.id,
        pmMaterial_id:item.id,
        pmAmount:item.amount
      })
    })
  }
  catch(err){
    console.log('updateProductMaterial-ERROR:',err)
  }
}

//检查purchasePrice,freightFee,amazonSalePrice三项是否修改
const checkProductParams = (params,productOrigin)=>{
  return !(params.purchasePrice === productOrigin.purchasePrice  
          && params.freightFee === productOrigin.freightFee 
          && params.amazonSalePrice === productOrigin.amazonSalePrice)
}

const buildProductObjWithoutCompute = (params) =>{
  return {
    site_id:params.site_id,
    sku:params.sku,
    childAsin:params.childAsin,
    title:params.title,
    image:params.image
  }
}

/*
* 1.拿到了新数据和原始数据
* 2.取出相关数据做运算
* 3.打好包返回给更新函数
*/

const buildProductObjCompute = (params,productOrigin)=>{
  //计算损耗
  let shrinkageParmas = buildShrinkageParmas(params,productOrigin)
  let _shrinkage = calShrinkage(shrinkageParmas)

  //计算利润和利润率
  let marginParams = buildMarginParams(params,productOrigin,_shrinkage)
  let {_margin,_marginRate} = calMargin(marginParams)

  // //计算成本率
  let _productCostPercentage = calProductCostPercentage({
    purprice:params.purchasePrice,
    amazonprice:productOrigin.amazonSalePrice,
    currency:productOrigin.currency
  })
  
  return {
    freightFee:params.freightFee,
    amazonSalePrice:params.amazonSalePrice,
    purchasePrice:params.purchasePrice,

    site_id:params.site_id,
    sku:params.sku,
    childAsin:params.childAsin,
    title:params.title,
    image:params.image,

    shrinkage:_shrinkage,
    margin:_margin,
    marginRate:_marginRate,
    productCostPercentage:_productCostPercentage
  }
}

const calDHLShippingFee = (params)=>{
  let weight = parseFloat(params.weight)
  let length = parseFloat(params.length)
  let width = parseFloat(params.width)
  let height = parseFloat(params.height)
  let fee1 = weight*35
  let fee2 = length*width*height*0.007
  if(fee1 >= fee2){
    return fee1
  }else{
    return fee2
  }
}

//存在freightFee就用,不存在就用dhlShippingFee
const buildShrinkageParmas = (params,productOrigin) =>{
  let dhlfee = 0
  if(Number(params.freightFee)){
    dhlfee = params.freightFee
  }else{
    dhlfee = productOrigin.dhlShippingFee
  }
  return {
    dhlfee:dhlfee,
    purprice:params.purchasePrice,
    packfee:productOrigin.packageFee,
    opfee : productOrigin.opFee,
    currency: productOrigin.currency,
    fbafee:productOrigin.fbaFullfillmentFee,
    adcost:productOrigin.adcost
  }
}
const calShrinkage = (params) =>{
  purprice = parseFloat(params.purprice) || 0
  dhlfee = parseFloat(params.dhlfee) || 0 
  packfee = parseFloat(params.packfee) || 0
  opfee = parseFloat(params.opfee) || 0
  currency = parseFloat(params.currency) || 6.50 
  fbafee = parseFloat(params.fbafee) || 0
  adcost= parseFloat(params.adcost) || 0
  fee1 = (purprice + dhlfee + packfee + opfee)/currency
  fee2 = (fee1 + fbafee + adcost)*0.117
  return fee2.toFixed(3)
}

const buildMarginParams = (params,productOrigin,_shrinkage) =>{
  let dhlfee = 0
  if(Number(params.freightFee)){
    dhlfee = params.freightFee
  }else{
    dhlfee = productOrigin.dhlShippingFee
  }
  return {
    dhlfee:dhlfee,
    purprice:params.purchasePrice,
    amazonprice:params.amazonSalePrice,

    packfee:productOrigin.packageFee,
    opfee : productOrigin.opFee,
    currency: productOrigin.currency,
    fbafee:productOrigin.fbaFullfillmentFee,
    adcost:productOrigin.adcost,
    amazonfee:productOrigin.amazonReferralFee,
    payonfee :productOrigin.payoneerServiceFee,
    
    shrinkage :_shrinkage
  }
}
const calMargin = (params) =>{
  purprice = parseFloat(params.purprice) || 0
  dhlfee = parseFloat(params.dhlfee) || 0
  packfee = parseFloat(params.packfee) || 0
  opfee = parseFloat(params.opfee) || 0
  currency = parseFloat(params.currency) || 6.50
  fbafee = parseFloat(params.fbafee) || 0
  adcost= parseFloat(params.adcost) || 0
  amazonfee =parseFloat(params.amazonfee) || 0
  payonfee = parseFloat(params.payonfee) || 0
  amazonprice=parseFloat(params.amazonprice) || 0
  shrinkage = parseFloat(params.shrinkage) || 0

  let fee1,fee2,fee3,_margin,_marginRate

  fee1 = amazonprice*(1-amazonfee/100)
  fee2 = fbafee+shrinkage+adcost
  fee3 = (fee1-fee2)*(1-payonfee/100)*currency
  _margin = (fee3-purprice-dhlfee-packfee-opfee).toFixed(2)
  if( amazonprice*currency===0){
    _marginRate = 0
  }    
  else{
    _marginRate = (100*_margin/(amazonprice*currency)).toFixed(2)
  }    
  return {
    _margin,
    _marginRate
  }
}

const calProductCostPercentage = (params)=>{
  purprice = parseFloat(params.purprice) || 0
  amazonprice=parseFloat(params.amazonprice) || 0
  currency = parseFloat(params.currency) || 6.50
  if (amazonprice*currency==0){
    fee=0
  }
  else{
    fee = 100*purprice/(amazonprice*currency)
  }     
  return fee.toFixed(2)
}

module.exports = {
  findProductList,
  findSites,
  findProductById,
  changeProduct
}
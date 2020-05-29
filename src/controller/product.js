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
    include:[models.Login_user,models.Login_site,models.Login_inventorymaterial]
  })

  let data = productDataHandler(result)
  return data
}

const findPreoutstockList = async(params) =>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10

  const result = await models.Login_preoutstock.findAndCountAll({
    order:[['id','DESC']] ,//ASC:正序  DESC:倒序
    offset:offset,
    limit:limited,
    include:[{
      model:models.Login_user,
      attributes:['name']
    }
    ,{
      model:models.Login_producttemp,
      attributes:['sku']
    }
  ]
  })

  let data = preoutstockDataHandler(result)
  return data
}

const preoutstockDataHandler = (result) =>{
  let data = {}
  let preOutstockKeys = CONSTANT.PREOUTSTOCK_KEYS
  data.total = result.count
  data.list = result.rows.map(item=>{
    let temp = {}
    preOutstockKeys.forEach(key=>{
      if(key === 'user_id'){
        temp.user = item.Login_user.name
      }else if(key === 'products'){
        let _products = item.Login_producttemps.map(proItem=>{
          return {
            sku:proItem.sku,
            amount:proItem.Login_preoutitem.amount
          }
        })
        temp.products = _products
      }else{
        temp[key] = item[key]
      }
    })
    return temp
  })
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
  const siteMap = await models.Login_site.findAll({
    attributes:['id','name']
  })
  return siteMap
}

/**
 * 1.获取预出库对象和关联的产品,创建params和list
 * 2.根据params创建出库对象,根据list创建outitem对象关联
 * 3.返回状态码
 */
const preToOutstockById = async(id) =>{
  
}

/**
 * 1.根据id,获取预出库对象,连带产品项
 * 2.构建params,创建复制预出库对象
 * 3.遍历产品项,使用复制预出库对象创建关联项
 * 4.返回状态值
 */
const copyPreoutstockById = async(id)=>{
  let status = "failed",msg=""
  let preoutstockOrigin = await models.Login_preoutstock.findOne({
    where:{
      id:id
    },
    include:[{
      model:models.Login_producttemp,
      attributes:['id']
    }]
  })
  const copyParams = buildPreoutstockCopyParams(preoutstockOrigin)
  let copyPreoutstockObj = await models.Login_preoutstock.create(copyParams)
  buildPreoutItem(copyPreoutstockObj,preoutstockOrigin)

  return {
    status:'succeed',
    msg:'已成功复制'
  }
}

const buildPreoutstockCopyParams=(params)=>{
  let _params = JSON.parse(JSON.stringify(params))
  delete _params.id
  delete _params.Login_producttemps
  if(params.pcode.length < 28){
    _params.pcode = params.pcode + '副本'
  }
  _params.ptime = Date.now()
  _params.has_out = 0
  return _params
}

const buildPreoutItem = async(copyObj,origin)=>{
  const productIds = origin.Login_producttemps.map(item=>{
    return item.id
  })
  const amounts = origin.Login_producttemps.map(item=>{
    return item.Login_preoutitem.amount
  })
  const productList = await models.Login_producttemp.findAll({
    where:{
      id:productIds
    }
  })
  productList.forEach((item,index)=>{
    copyObj.setLogin_producttemps(item,{through:{amount:amounts[index]}})
  })
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

const createProduct = async(params)=>{
  const IsSkuRepeat = await checkSkuRepeat(params.sku) 
  let msg = ""
  let status = ""
  
  if(!IsSkuRepeat){
    const formatParams = productParamsFormat(params)
    const hasAllComputeAttributes = checkComputeAttribute(formatParams)
  
    let productObj
    if(hasAllComputeAttributes) {
      productObj = await createProductWithCompute(formatParams)
    }else{
      productObj = await createProductWithoutCompute(formatParams)
    }

    await createProductMaterial(params,productObj)

    msg = "已成功新增产品"
    status = "succeed"
  }else{
    msg = "sku重复,无法创建新产品"
    status = "failed"
  }
  
  return {
    msg:msg,
    status:status
  }
}

/**
 * 1.取出materials的id列表,根据params的id找出IM对象
 * 2.遍历IM对象,配合productObj创建productmaterial对象
 *
 */
const createProductMaterial = async(params,productObj) =>{
  const imIds = params.materials.map(item=>{
    return item.id
  })
  
  const IMObjList = await models.Login_inventorymaterial.findAll({
    where:{
      id:imIds
    }
  })

  IMObjList.map((item,index)=>{
    productObj.setLogin_inventorymaterials(item,{through:{pmAmount:params.materials[index].amount}})
  })
}
const checkSkuRepeat = async(sku) =>{
  let skuRes = await models.Login_producttemp.findAndCountAll({
    where:{
      sku:sku
    }
  })
  return Boolean(skuRes.count)
} 

//遍历attribute-type的字典,对params做数据类型转换和默认值写入.
const productParamsFormat = (params) =>{
  delete params.authToken
  for(let key in CONSTANT.PRODUCT_PARAMS_MAP){
    let type = CONSTANT.PRODUCT_PARAMS_MAP[key].type     
      let value = params[key] || CONSTANT.PRODUCT_PARAMS_MAP[key].default
      type === "float" ? value = parseFloat(value) : null
      params[key] = value
  }
  params.c_time = Date.now()
  return params
}
const checkComputeAttribute = (params) =>{
  //若有一项为0则为false
  let attributesHasNoZero = true
  //仅检查涉及计算的项目,若缺项或某项为0,则拒绝计算.
  for(let key of CONSTANT.PRODUCT_CALC_LIST){
    if(!params[key] || params[key] === 0) attributesHasNoZero = false 
  }

  //计算dhlfee是否存在
  let {_dhlfee}  = calDHLShippingFee(params)
  if(_dhlfee === 0){
    attributesHasNoZero = false
  }
  return attributesHasNoZero  
}
/**
 *1.计算dhlFee,使用{...params,dhlFee:xxx}传递新数据.
 *1.1 注意汇率问题如何解决
 *2.计算shrinkage,margin,marginRate 
 *3.新增产品
 */
const createProductWithCompute = async(params) =>{
  let {_dhlfee,_dhlShippingFee} = calDHLShippingFee(params)
  let _shrinkage = calShrinkage({
    ...params,
    dhlfee:_dhlfee
  })
  let {_margin,_marginRate} = calMargin({
    ...params,
    dhlfee:_dhlfee,
    shrinkage:_shrinkage
  })
  let _productCostPercentage = calProductCostPercentage(params)

  let productObj = await models.Login_producttemp.create({
    ...params,
    shrinkage:_shrinkage,
    margin:_margin,
    marginRate:_marginRate,
    productCostPercentage:_productCostPercentage,
    dhlShippingFee:_dhlShippingFee
  })
  return productObj
}

const createProductWithoutCompute = async(params) =>{
  let productObj = await models.Login_producttemp.create({
    ...params,
    shrinkage:0,
    margin:0,
    marginRate:0,
    productCostPercentage:0,
    dhlShippingFee:0
  })
  return productObj
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
    purchasePrice:params.purchasePrice,
    amazonSalePrice:productOrigin.amazonSalePrice,
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
  let dhlShippingFee = 0,dhlfee = 0
  let weight = parseFloat(params.weight) || 0
  let length = parseFloat(params.length)|| 0
  let width = parseFloat(params.width) || 0
  let height = parseFloat(params.height) || 0
  let fee1 = weight*35
  let fee2 = length*width*height*0.007

  dhlShippingFee = fee1 > fee2 ? fee1 : fee2

  if(!params.freightFee || params.freightFee === 0){
    dhlfee = dhlShippingFee
  }else{
    dhlfee = params.freightFee
  }

  return {
    _dhlShippingFee:dhlShippingFee,
    _dhlfee:dhlfee
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
    purchasePrice:params.purchasePrice,
    packageFee:productOrigin.packageFee,
    opFee : productOrigin.opFee,
    currency: productOrigin.currency,
    fbaFullfillmentFee:productOrigin.fbaFullfillmentFee,
    adcost:productOrigin.adcost
  }
}
const calShrinkage = (params) =>{
  purchasePrice = parseFloat(params.purchasePrice) || 0
  dhlfee = parseFloat(params.dhlfee) || 0 
  packageFee = parseFloat(params.packageFee) || 0
  opFee = parseFloat(params.opFee) || 0
  currency = parseFloat(params.currency) || CONSTANT.DEFAULT_USD_CURRENCY
  fbaFullfillmentFee = parseFloat(params.fbaFullfillmentFee) || 0
  adcost= parseFloat(params.adcost) || 0
  fee1 = (purchasePrice + dhlfee + packageFee + opFee)/currency
  fee2 = (fee1 + fbaFullfillmentFee + adcost)*0.117
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
    purchasePrice:params.purchasePrice,
    amazonSalePrice:params.amazonSalePrice,

    packageFee:productOrigin.packageFee,
    opFee : productOrigin.opFee,
    currency: productOrigin.currency,
    fbaFullfillmentFee:productOrigin.fbaFullfillmentFee,
    adcost:productOrigin.adcost,
    amazonReferralFee:productOrigin.amazonReferralFee,
    payoneerServiceFee :productOrigin.payoneerServiceFee,
    
    shrinkage :_shrinkage
  }
}
const calMargin = (params) =>{
  purchasePrice = parseFloat(params.purchasePrice) || 0
  dhlfee = parseFloat(params.dhlfee) || 0
  packageFee = parseFloat(params.packageFee) || 0
  opFee = parseFloat(params.opFee) || 0
  currency = parseFloat(params.currency) || CONSTANT.DEFAULT_USD_CURRENCY
  fbaFullfillmentFee = parseFloat(params.fbaFullfillmentFee) || 0
  adcost= parseFloat(params.adcost) || 0
  amazonReferralFee =parseFloat(params.amazonReferralFee) || 0
  payoneerServiceFee = parseFloat(params.payoneerServiceFee) || 0
  amazonSalePrice=parseFloat(params.amazonSalePrice) || 0
  shrinkage = parseFloat(params.shrinkage) || 0

  let fee1,fee2,fee3,_margin,_marginRate

  fee1 = amazonSalePrice*(1-amazonReferralFee/100)
  fee2 = fbaFullfillmentFee+shrinkage+adcost
  fee3 = (fee1-fee2)*(1-payoneerServiceFee/100)*currency
  _margin = (fee3-purchasePrice-dhlfee-packageFee-opFee).toFixed(2)
  if( amazonSalePrice*currency===0){
    _marginRate = 0
  }    
  else{
    _marginRate = (100*_margin/(amazonSalePrice*currency)).toFixed(2)
  }    
  return {
    _margin,
    _marginRate
  }
}

const calProductCostPercentage = (params)=>{
  purchasePrice = parseFloat(params.purchasePrice) || 0
  amazonSalePrice=parseFloat(params.amazonSalePrice) || 0
  currency = parseFloat(params.currency) || CONSTANT.DEFAULT_USD_CURRENCY
  if (amazonSalePrice*currency==0){
    fee=0
  }
  else{
    fee = 100*purchasePrice/(amazonSalePrice*currency)
  }     
  return fee.toFixed(2)
}

module.exports = {
  findProductList,
  findSites,
  findProductById,
  changeProduct,
  createProduct,
  findPreoutstockList,
  copyPreoutstockById,
  preToOutstockById
}
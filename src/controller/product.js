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

const productSearchForPreoutstock = async(params) =>{
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''

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
    order:[['id','ASC']] ,//ASC:正序  DESC:倒序
    where:where,
    offset:offset,
    limit:limited,
    attributes:['id','sku','childAsin','title'],
    include:[models.Login_site]
  })

  let data = product4preoutstockDataHandler(result)
  
  return data
}

const product4preoutstockDataHandler = (result) =>{
  let data = {}
  data.total = result.count
  let PRODUCT_KEYS = CONSTANT.PRODUCT_FOR_PREOUTSTOCK_KEYS
  data.list = result.rows.map(item =>{
    let temp = {}
    PRODUCT_KEYS.forEach(key=>{
      if(key === 'site'){
        temp.site = item.Login_site.name
      }else{
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const findPreoutstockById = async(id)=>{
  const usersList = await models.Login_user.findAll({
    attributes:['id','name']
  })

  const result = await models.Login_preoutstock.findOne({
    where:{id:id},
    include:[
      {
        model:models.Login_producttemp,
        attributes:['id','sku']
      }
    ]
  })

  const data = handlePreoutstockData(result)
  data.usersList = usersList
  return data
}

const handlePreoutstockData = (result) =>{
  let data = JSON.parse(JSON.stringify(result))
  delete data.Login_producttemps
  let products = result.Login_producttemps.map(item=>{
    return {
      id:item.id,
      sku:item.sku,
      amount:item.Login_preoutitem.amount
    }
  })
  data.products = products
  return data
}

/**
 * 1.拿到参数,获取products列表
 * 2.查询出productObj,配合amount送入calcVolume等三个函数
 * 3.计算出结果后返回.
 */
const calcPreoutstock = async(params) =>{
  try{
    const {
      _total_freightfee,
      _total_volume,
      _total_weight
    } = await calcIndex(params)
    return {
      status:'succeed',
      msg:'已计算并更新参数',
      indexes:{
        total_freightfee:_total_freightfee,
        total_volume:_total_volume,
        total_weight:_total_weight
      }
    }
  }catch(err){
    console.log('calcPreoutstock-ERROR:',err)
    return {
      status:'failed',
      msg:'数据错误,计算失败',
    }
  }
  
}

calcIndex = (params)=>{
  return new Promise(async(resolve,reject)=>{
    const productIds = params.products.map(item=>{
      return item.id
    })
  
    const productList = await models.Login_producttemp.findAll({
      where:{
        id:productIds
      },
      attributes:['id','dhlShippingFee','freightFee','weight','length','width','height'],
    })
  
    let _total_freightfee = 0,_total_volume = 0,_total_weight=0
    productList.forEach((productItem,index)=>{
      let _amount
      params.products.forEach(paramItem=>{
        if(paramItem.id === productItem.id) _amount = paramItem.amount
      })
      _total_freightfee += Number(calcFreightFee(productItem,_amount))
      _total_volume += Number(calcVolume(productItem,_amount))
      _total_weight += Number(calcWeight(productItem,_amount))
    })
    resolve({
      _total_freightfee,
      _total_volume,
      _total_weight
    })
  })
}

/**
 * 1.参数接收
 * 2.计算3个total
 * 3.生成params
 * 4.更新pre对象
 * 5.删除以前的关联项,变为新的关联项
 */
const preoutstockEdit = async(params) => {
  try{
    let updateObj = await buildPreoutstockUpdataParams(params)
    await models.Login_preoutstock.update(updateObj,{
      where:{
        id:params.id
      }
    })
    updatePreoutstockItem(params)
    return {
      status:'succeed',
      msg:'成功保存修改'
    }
  }
  catch(err){
    console.log('preoutstockEdit-ERROR',err)
    return {
      status:'failed',
      msg:'修改失败,出现错误'
    }
  }
}

const preoutstockCreate = async(params)=>{
  try {
    let addObj = await buildPreoutstockUpdataParams(params)
    let preoutstockObj = await models.Login_preoutstock.create(addObj)
    await createPreoutstockItem(preoutstockObj,params)
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

const createPreoutstockItem = async(preoutstockObj,params)=>{
  const productIds = params.products.map(item=>{
    return item.id
  })

  const productList = await models.Login_producttemp.findAll({
    where:{
      id:productIds
    }
  })

  productList.map((productItem,index)=>{
    let _amount = 0
    params.products.forEach(item=>{
      if(item.id === productItem.id){
        _amount = item.amount
      }
    })
    preoutstockObj.setLogin_producttemps(productItem,{through:{
      amount:_amount
    }})
  })
}

const buildPreoutstockUpdataParams = async(params) =>{
  const {
    _total_freightfee,
    _total_volume,
    _total_weight
  } = await calcIndex(params)
  let preUpdateObj = {
    ...params,
    ptime:Date.now(),
    total_freightfee:_total_freightfee,
    total_volume:_total_volume,
    total_weight:_total_weight
  }
  delete preUpdateObj.id
  delete preUpdateObj.products
  
  return preUpdateObj
}

const updatePreoutstockItem = async(params) =>{
  await models.Login_preoutitem.destroy({
    where:{
      master_id:params.id
    }
  })
  try{
    params.products.forEach(item=>{
      models.Login_preoutitem.create({
        master_id:params.id,
        productName_id:item.id,
        amount:item.amount
      })
    })
  }
  catch(err){
    console.log('updatePreoutstockItem-ERROE:',err)
  }
}
const findSites = async()=>{
  const siteMap = await models.Login_site.findAll({
    attributes:['id','name']
  })
  return siteMap
}

/**
 * 1.根据products计算outitem的参数和outstock的参数
 * 2.创建outstock的对象
 * 3.创建outitem对象
 * 4.返回状态 
 */
const outstockUpload = async(params)=>{
  const {outstockParams,outItemList} = await buildOutstockParams(params)
  let outstockObj = await models.Login_outstock.create(outstockParams)
  const {msg,status} = await buildOutstockItem(outstockObj,outItemList)
  return {
    status,
    msg
  }
}

const buildOutstockParams = async(params)=>{
  let outstockParams={}
  outstockParams = JSON.parse(JSON.stringify(params))
  delete outstockParams.products
  delete outstockParams.authToken
  const {
    _total_freightfee,
    _total_volume,
    _total_weight,
    outItemList
  } = await calcOutstockIndex(params)

  outstockParams.total_freightfee = _total_freightfee
  outstockParams.total_volume = _total_volume
  outstockParams.total_weight = _total_weight
  return {
    outstockParams,
    outItemList
  }
}

/**
 * 
 *
 */
const buildOutstockItem = async(outstockObj,outItemList)=>{
  const productIds = outItemList.map(item=>{
    return item.productName_id
  })

  const productList = await models.Login_producttemp.findAll({
    where:{
      id:productIds
    },
    attributes:['id'],
    include:{
      model:models.Login_inventorymaterial,
      attributes:['id','amount']
    }
  })

  productList.forEach((productItem,index)=>{
    let outitemTemp = {}
    outItemList.forEach((outItem)=>{
      if(outItem.productName_id === productItem.id ) outitemTemp = outItem
    })
    outstockObj.setLogin_producttemps(productItem,
      {through:
        {
          amountOut:outitemTemp.amountOut,
          volume:outitemTemp.volume,
          weight:outitemTemp.weight,
          freightfee:outitemTemp.freightfee,
        }
      })
  })

  const {msg,status} = await  imOutStockUpload(productList,outItemList)

  //前面测试已通过,剩下一个物料数量扣除,存在一些问题,先不做
  return {msg,status} 
}

const calcOutstockIndex = (params)=>{
  return new Promise(async(resolve,reject)=>{
    const productSkus = params.products.map(item=>{
      return item.sku
    })
    const productList = await models.Login_producttemp.findAll({
      where:{
        sku:productSkus
      },
      attributes:['id','sku','dhlShippingFee','freightFee','weight','length','width','height'],
    })

    //console.log(productList)
  
    let _total_freightfee = 0,_total_volume = 0,_total_weight=0,outItemList=[]
    productList.forEach((productItem,index)=>{
      let _amount = 0, temp = {}
      params.products.forEach(paramItem=>{
        if(paramItem.sku === productItem.sku) _amount = paramItem.amount
      })
      let item_freightfee = Number(calcFreightFee(productItem,_amount))
      let item_volume = Number(calcVolume(productItem,_amount))
      let item_weight = Number(calcWeight(productItem,_amount))
  
      temp.productName_id = productItem.id
      temp.amountOut = _amount
      temp.volume = item_volume
      temp.freightfee = item_freightfee
      temp.weight = item_weight
      outItemList.push(temp)
  
      _total_freightfee += item_freightfee
      _total_volume += item_volume
      _total_weight += item_weight
    })
    resolve({
      _total_freightfee,
      _total_volume,
      _total_weight,
      outItemList
    })
  })
}

const imOutStockUpload = async(productList,outItemList)=>{
  let msg = '',status = 'succeed'
  productList.forEach(async(productItem,productIndex)=>{
    let _amountOut = 0
    outItemList.forEach(outItem=>{
      if(productItem.id === outItem.productName_id) _amountOut = outItem.amountOut
    })

    //遍历productItem的Login_inventorymaterials,更新其数量即可
    productItem.Login_inventorymaterials.forEach(imItem=>{
      let _newAmount = imItem.amount - _amountOut*imItem.Login_productmaterial.pmAmount
      if(_newAmount < 0) msg = '物料数量已小于0,请及时修改或补充'
      models.Login_inventorymaterial.update({
        amount:_newAmount
      },{
        where:{
          id:imItem.id
        }
      })
    })
  })
  return {msg,status}
}

/**
 * 1.获取预出库对象和关联的产品,创建params和list
 * 2.根据params创建出库对象,根据list创建outitem对象关联
 * 3.计算关联物料数量,修改物料数量
 * 4.返回状态码
 */
const preToOutstockById = async(id) =>{
  let status = "failed",msg=""
  let preoutstockOrigin = await models.Login_preoutstock.findOne({
    where:{
      id:id
    },
    include:[{
      model:models.Login_producttemp,
      attributes:['id','weight','length','width','height','dhlShippingFee','freightFee','site_id']
    }]
  })

  const outstockParams = buildOutstockParamsFromPre(preoutstockOrigin)
  let outstockObj = await models.Login_outstock.create(outstockParams)
  let res = buildOutItem(outstockObj,preoutstockOrigin)

  await preoutstockOrigin.update({
    has_out:true
  })

  return res
}

const buildOutstockParamsFromPre = (preObj) =>{
  let _outParams = {}
  _outParams.code = preObj.pcode
  _outParams.c_time = Date.now()
  _outParams.description = preObj.pdescription
  _outParams.userOutstock_id = preObj.user_id
  _outParams.total_freightfee = preObj.total_freightfee
  _outParams.total_volume = preObj.total_volume
  _outParams.total_weight= preObj.total_weight
  return _outParams
}

const buildOutItem = async(outObj,preObj) =>{
  const productIds = preObj.Login_producttemps.map(item=>{
    return item.id
  })
  console.log(preObj.Login_producttemps)
  //返回一个数组,每个元素是一个对象,放着amount,weight,volume,freightFee
  const outAttributes = preObj.Login_producttemps.map(item=>{
    let _volume = calcVolume(item,item.Login_preoutitem.amount)
    let _weight = calcWeight(item,item.Login_preoutitem.amount)
    let _freightFee = calcFreightFee(item,item.Login_preoutitem.amount)
    return {
      productName_id:item.id,
      amountOut:item.Login_preoutitem.amount,
      volume:_volume,
      weight:_weight,
      freightfee:_freightFee
    }
  })

  const productList = await models.Login_producttemp.findAll({
    where:{
      id:productIds
    },
    attributes:['id'],
    include:{
      model:models.Login_inventorymaterial,
      attributes:['id','amount']
    }
  })
  //创建outitem关联,这里要加入单票的weight,volume,freightfee
  productList.forEach((item,index)=>{
    outObj.setLogin_producttemps(item,
      {through:
        {
          amountOut:outAttributes[index].amountOut,
          volume:outAttributes[index].volume,
          weight:outAttributes[index].weight,
          freightfee:outAttributes[index].freightfee,
        }
      })
  })

  let imRes = await imOutStockUpload(productList,outAttributes)
  return imRes
}

const calcVolume = (productObj,amount) =>{
  let _volume = 0
  let _length = Number(productObj.length)
  let _width = Number(productObj.width)
  let _height = Number(productObj.height)
  let _amount = Number(amount) 
  if(_length && _width && _height && _amount){
    _volume =  (_length*_width*_height*_amount)/1000000
    
  }else{
    _volume = 0
  }
  //console.log(_length,_width,_height,_amount,_volume)
  return _volume.toFixed(3)
}

const calcWeight = (productObj,amount) =>{
  let _totalWeight = 0
  let _amount = Number(amount)
  let _weight = Number(productObj.weight)
  if(_weight && _amount){
    _totalWeight = _weight * _amount
  }else{
    _totalWeight = 0
  }
  return _totalWeight.toFixed(3)
}

const calcFreightFee = (productObj,amount) =>{
  let _totalFreightFee = 0
  let _amount = Number(amount)
  let _dhlShippingFee = Number(productObj.dhlShippingFee)
  let _freightFee = Number(productObj.freightFee)

  if(_freightFee){
    _totalFreightFee = _amount * _freightFee
  }else if(_dhlShippingFee){
    _totalFreightFee = _amount * _dhlShippingFee
  }else{
    _totalFreightFee = 0 
  }
  return _totalFreightFee.toFixed(3)
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

  IMObjList.map((imItem,index)=>{
    let _amount = 0
    params.materials.forEach(item=>{
      if(item.id === imItem.id){
        _amount = item.amount
      }
    })
    productObj.setLogin_inventorymaterials(imItem,{
      through:{
        pmAmount:_amount
      }
    })
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
  preToOutstockById,
  findPreoutstockById,
  productSearchForPreoutstock,
  calcPreoutstock,
  preoutstockEdit,
  preoutstockCreate,
  outstockUpload
}
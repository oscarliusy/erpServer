const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op
const CONSTANT = require('../constant/models')
const { get } = require('../router/product')

const findProductList = async (params) => {
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''
  //多字段模糊查询
  let where = { is_deleted: 0 }
  if (keyword) {
    where = {
      [Op.or]: [
        { description: { [Op.like]: '%' + keyword + '%' } },
        { sku: { [Op.like]: '%' + keyword + '%' } },
        { childAsin: { [Op.like]: '%' + keyword + '%' } },
        { title: { [Op.like]: '%' + keyword + '%' } }
      ]
    }
  }

  const result = await models.producttemp.findAndCountAll({
    //order:[['id','DESC']] ,//ASC:正序  DESC:倒序
    where: where,
    offset: offset,
    limit: limited,
    include: [models.user, models.site, models.inventorymaterial]
  });
  let data = await productDataHandler(result)
  data = await changeBrandIdToName(data)
  return data
}

const findPreoutstockList = async (params) => {
  const result = await models.preoutstock.findAndCountAll({
    order: [['id', 'DESC']],//ASC:正序  DESC:倒序
    include: [{
      model: models.user,
      attributes: ['name']
    }
      , {
      model: models.producttemp,
      attributes: ['sku']
    }
    ]
  })
  let data = preoutstockDataHandler(result)
  return data
}

const findOutstockLog = async (params) => {
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const result = await models.outstock.findAndCountAll({
    order: [['id', 'DESC']],//ASC:正序  DESC:倒序
    offset: offset,
    limit: limited,
    include: [{
      model: models.user,
      attributes: ['name']
    }]
  })
  let data = OutstockDataHandler(result)
  return data
}

const OutstockDataHandler = (result) => {
  let data = {}
  let outstockKeys = CONSTANT.OUTSTOCKKEYS
  data.total = result.count
  data.list = result.rows.map(item => {
    let temp = {}
    outstockKeys.forEach(key => {
      if (key === 'userOutstock_id') {
        temp.user = item.user.name
      } else {
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const findEditLog = async (params) => {
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const result = await models.log.findAndCountAll({
    order: [['id', 'DESC']],
    offset: offset,
    limit: limited,
    include: [models.user],
    where: {
      type: CONSTANT.LOG_TYPES.PRODUCT
    }
  })
  let data = editLogDataHandler(result)
  return data
}

const editLogDataHandler = (result) => {
  let data = {}
  data.total = result.count
  let editKey = CONSTANT.MATERIAL_EDITLOG_KEYS
  data.list = result.rows.map(item => {
    let temp = {}
    editKey.forEach(key => {
      if (key === 'user') {
        temp.user = item.user.name
      } else {
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const findOutstockDetailById = async (params) => {
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const result = await models.outitem.findAndCountAll({
    where: {
      master_id: params.id
    },
    order: [['amountOut', 'DESC']],//ASC:正序  DESC:倒序
    offset: offset,
    limit: limited,
    attributes: ['amountOut'],
    include: [{
      model: models.producttemp,
      models: models.negative_stock,
      attributes: ['sku', 'site_id']
    }]
  })

  const data = outstockDetailDataHandler(result)
  return data
}

const outstockDetailDataHandler = async (result) => {
  let data = {}
  const siteMap = await models.site.findAll({
    attributes: ['id', 'name']
  })
  let outstockKeys = CONSTANT.OUTSTOCK_DETAIL_KEYS
  data.total = result.count
  data.list = result.rows.map(item => {
    let temp = {}
    outstockKeys.forEach(key => {
      if (key === 'amount') {
        temp[key] = item.amountOut
      } else if (key === 'site') {
        temp[key] = getSiteName(siteMap, item.producttemp.site_id)
      } else if (key === 'sku') {
        temp[key] = item.producttemp[key]
      }
    })
    return temp
  })
  return data
}
const preoutstockDataHandler = (result) => {
  let data = {}
  let preOutstockKeys = CONSTANT.PREOUTSTOCK_KEYS
  data.total = result.rows.length
  data.list = result.rows.map(item => {
    let temp = {}
    preOutstockKeys.forEach(key => {
      if (key === 'user_id') {
        temp.user = item.user.name
      } else if (key === 'products') {
        let _products = item.producttemps.map(proItem => {
          return {
            sku: proItem.sku,
            amount: proItem.preoutitem.amount
          }
        })
        temp.products = _products
      } else {
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const buildCurrencyMap = async () => {
  const result = await models.site.findAndCountAll({
    include: [{
      model: models.currency
    }]
  })
  const siteCurrencyMap = siteCurrencyDataHandler(result)
  return siteCurrencyMap
}

const siteCurrencyDataHandler = (result) => {
  let data = {}
  result.rows.forEach(item => {
    data[item.name] = {}
    data[item.name]['currencyName'] = item.currency.name
    data[item.name]['exchangeRate'] = item.currency.exchangeRateRMB
  })
  return data
}
/**
 * 需要在前6位显示id,site,sku,childAsin,title,image,后面随意
 */
const productDataHandler = async (result) => {
  let data = {}
  let PRODUCT_KEYS = CONSTANT.PRODUCTKEYS
  let currencyMap = await buildCurrencyMap()

  data.total = result.count
  data.list = result.rows.map(item => {
    let temp = {}
    PRODUCT_KEYS.forEach(key => {
      if (key === 'site') {
        temp.site = item.site.name
        temp.currency = currencyMap[item.site.name].currencyName
        temp.exchangeRate = currencyMap[item.site.name].exchangeRate
      }
      else if (key === 'creator') {
        temp.creator = item.user.name
      }
      else if (key == "materials") {
        let materialList = []
        if (item.inventorymaterials.length) {
          materialList = item.inventorymaterials.map(imItem => {
            let matItem = {}
            matItem.name = imItem.uniqueId || ''
            matItem.amount = imItem.productmaterial.pmAmount || ''
            return matItem
          })
        }
        temp.materials = materialList
      } else {
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const changeBrandIdToName = async (data) => {
  let brandQuerySql = `SELECT name FROM brand WHERE id = $1`
  let idx = 0
  for await (let product of data.list) {
    let [result, metadata] = await models.sequelize.query(brandQuerySql, {
      bind: [product.brand]
    })
    data.list[idx].brandName = result[0].name
    idx++
  }
  return data
}

const productSearchForPreoutstock = async (params) => {
  const offset = parseInt(params.offset) || 0
  const limited = parseInt(params.limited) || 10
  const keyword = params.keyword || ''

  let where = {}
  if (keyword) {
    where = {
      [Op.or]: [
        { description: { [Op.like]: '%' + keyword + '%' } },
        { sku: { [Op.like]: '%' + keyword + '%' } },
        { childAsin: { [Op.like]: '%' + keyword + '%' } },
        { title: { [Op.like]: '%' + keyword + '%' } }
      ]
    }
  }

  const result = await models.producttemp.findAndCountAll({
    order: [['id', 'ASC']],//ASC:正序  DESC:倒序
    where: where,
    offset: offset,
    limit: limited,
    attributes: ['id', 'sku', 'childAsin', 'title'],
    is_deleted: 0,
    include: [models.site]
  }, { logging: true })

  let data = product4preoutstockDataHandler(result)

  return data
}

const product4preoutstockDataHandler = (result) => {
  let data = {}
  data.total = result.count
  let PRODUCT_KEYS = CONSTANT.PRODUCT_FOR_PREOUTSTOCK_KEYS
  data.list = result.rows.map(item => {
    let temp = {}
    PRODUCT_KEYS.forEach(key => {
      if (key === 'site') {
        temp.site = item.site.name
      } else {
        temp[key] = item[key]
      }
    })
    return temp
  })
  return data
}

const findPreoutstockById = async (id) => {
  const usersList = await models.user.findAll({
    attributes: ['id', 'name']
  })

  const result = await models.preoutstock.findOne({
    where: { id: id },
    include: [
      {
        model: models.producttemp,
        attributes: ['id', 'sku']
      }
    ]
  })

  const data = handlePreoutstockData(result)
  data.usersList = usersList
  return data
}

const handlePreoutstockData = (result) => {
  let data = JSON.parse(JSON.stringify(result))
  delete data.Producttemps
  let products = result.producttemps.map(item => {
    return {
      id: item.id,
      sku: item.sku,
      amount: item.preoutitem.amount
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
const calcPreoutstock = async (params) => {
  try {
    const {
      _total_freightfee,
      _total_volume,
      _total_weight
    } = await calcIndex(params)
    return {
      status: 'succeed',
      msg: '已计算并更新参数',
      indexes: {
        total_freightfee: _total_freightfee,
        total_volume: _total_volume,
        total_weight: _total_weight
      }
    }
  } catch (err) {
    console.log('calcPreoutstock-ERROR:', err)
    return {
      status: 'failed',
      msg: '数据错误,计算失败',
    }
  }

}

const calcIndex = (params) => {
  return new Promise(async (resolve, reject) => {
    const productIds = params.products.map(item => {
      return item.id
    })

    const productList = await models.producttemp.findAll({
      where: {
        id: productIds
      },
      attributes: ['id', 'dhlShippingFee', 'freightFee', 'weight', 'length', 'width', 'height'],
    })

    let _total_freightfee = 0, _total_volume = 0, _total_weight = 0
    productList.forEach((productItem, index) => {
      let _amount
      params.products.forEach(paramItem => {
        if (paramItem.id === productItem.id) _amount = paramItem.amount
      })
      _total_freightfee += Number(calcFreightFee(productItem, _amount))
      _total_volume += Number(calcVolume(productItem, _amount))
      _total_weight += Number(calcWeight(productItem, _amount))
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
const preoutstockEdit = async (params) => {
  try {
    let updateObj = await buildPreoutstockUpdataParams(params)
    await models.preoutstock.update(updateObj, {
      where: {
        id: params.id
      }
    })
    updatePreoutstockItem(params)
    return {
      status: 'succeed',
      msg: '成功保存修改'
    }
  }
  catch (err) {
    console.log('preoutstockEdit-ERROR', err)
    return {
      status: 'failed',
      msg: '修改失败,出现错误'
    }
  }
}

const preoutstockCreate = async (params) => {
  try {
    let addObj = await buildPreoutstockUpdataParams(params)
    let preoutstockObj = await models.preoutstock.create(addObj)
    await createPreoutstockItem(preoutstockObj, params)
    return {
      status: 'succeed',
      msg: '已成功创建预出库项'
    }
  }
  catch (err) {
    console.log('preoutstockCreate-ERROR:', err)
    return {
      status: 'failed',
      msg: '创建失败'
    }
  }
}

const createPreoutstockItem = async (preoutstockObj, params) => {
  let masterId = preoutstockObj.id

  for (let item of params.products) {
    let _amount = Number(item.amount)
    let _id = Number(item.id)
    await models.sequelize.query(`INSERT INTO preoutitem (amount,master_id,productName_id) VALUES (${_amount},${masterId},${_id})`)
  }
}

const buildPreoutstockUpdataParams = async (params) => {
  const {
    _total_freightfee,
    _total_volume,
    _total_weight
  } = await calcIndex(params)
  let preUpdateObj = {
    ...params,
    ptime: Date.now(),
    total_freightfee: _total_freightfee,
    total_volume: _total_volume,
    total_weight: _total_weight
  }
  delete preUpdateObj.id
  delete preUpdateObj.products

  return preUpdateObj
}

const updatePreoutstockItem = async (params) => {
  await models.preoutitem.destroy({
    where: {
      master_id: params.id
    }
  })
  try {
    params.products.forEach(item => {
      models.preoutitem.create({
        master_id: params.id,
        productName_id: item.id,
        amount: item.amount
      })
    })
  }
  catch (err) {
    console.log('updatePreoutstockItem-ERROE:', err)
  }
}
const findSites = async () => {
  const siteMap = await models.site.findAll({
    attributes: ['id', 'name']
  })
  return siteMap
}

/**
 * 如果从前端传过来的sku在数据库中不存在，直接返回failed，并且返回不存在的产品
 * 1.根据products计算outitem的参数和outstock的参数
 * 2.创建outstock的对象
 * 3.创建outitem对象
 * 4.返回状态 
 */
const outstockUpload = async (params) => {
  let data = {}
  const { outstockParams, outItemList, productNotFound } = await buildOutstockParams(params)
  if (productNotFound.list.length > 0) {
    var msg = 'Product not found'
    var status = 'failed'
    data.productNotFound = productNotFound
    data.status = status
    data.msg = msg
  } else {
    let outstockObj = await models.outstock.create(outstockParams)
    var { msg, status, negativeStock } = await buildOutstockItem(outstockObj, outItemList)
    data.productNotFound = productNotFound
    data.negativeStock = negativeStock
    data.status = status
    data.msg = msg
  }
  return data
}

const buildOutstockParams = async (params) => {
  let outstockParams = {}
  outstockParams = JSON.parse(JSON.stringify(params))
  delete outstockParams.products
  //delete outstockParams.authToken
  const {
    _total_freightfee,
    _total_volume,
    _total_weight,
    outItemList,
    productNotFound
  } = await calcOutstockIndex(params)

  outstockParams.total_freightfee = _total_freightfee
  outstockParams.total_volume = _total_volume
  outstockParams.total_weight = _total_weight
  return {
    outstockParams,
    outItemList,
    productNotFound
  }
}

/**
 * 
 *
 */
const buildOutstockItem = async (outstockObj, outItemList) => {
  const productIds = outItemList.map(item => {
    return item.productName_id
  })

  const productList = await models.producttemp.findAll({
    where: {
      id: productIds
    },
    attributes: ['id'],
    include: {
      model: models.inventorymaterial,
      attributes: ['id', 'amount']
    }
  })

  productList.forEach((productItem, index) => {
    let outitemTemp = {}
    outItemList.forEach((outItem) => {
      if (outItem.productName_id === productItem.id) outitemTemp = outItem
    })
    outstockObj.setProducttemps(productItem,
      {
        through:
        {
          amountOut: outitemTemp.amountOut,
          volume: outitemTemp.volume,
          weight: outitemTemp.weight,
          freightfee: outitemTemp.freightfee,
          site: outitemTemp.site
        }
      })
  })
  const { msg, status, negativeStock } = await imOutStockUpload(productList, outItemList, outstockObj.dataValues.id)

  //前面测试已通过,剩下一个物料数量扣除,存在一些问题,先不做
  return { msg, status, negativeStock }
}

const calcOutstockIndex = (params) => {
  return new Promise(async (resolve, reject) => {
    // const productSkus = params.products.map(item=>{
    //   return item.sku
    // })
    // const productList = await models.producttemp.findAll({
    //   where:{
    //     sku:productSkus
    //   },
    //   attributes:['id','sku','dhlShippingFee','freightFee','weight','length','width','height'],
    // })
    var productList = []
    var productNotFound = { list: [] }
    for (let i = 0; i < params.products.length; i++) {
      var eachProduct = await models.producttemp.findOne({
        where: {
          sku: params.products[i].sku
        },
        attributes: ['id', 'sku', 'dhlShippingFee', 'freightFee', 'weight', 'length', 'width', 'height'],
      })
      if (typeof (eachProduct) != "undefined" && eachProduct != "" && eachProduct != null) {
        productList.push(eachProduct)
      } else {
        productNotFound.list.push(params.products[i])
      }
    }
    //console.log(productList)

    let _total_freightfee = 0, _total_volume = 0, _total_weight = 0, outItemList = []
    productList.forEach((productItem, index) => {
      let _amount = 0, temp = {}, _site = ''
      params.products.forEach(paramItem => {
        if (paramItem.sku === productItem.sku) {
          _amount = paramItem.amount
          _site = paramItem.site
        }
      })
      let item_freightfee = Number(calcFreightFee(productItem, _amount))
      let item_volume = Number(calcVolume(productItem, _amount))
      let item_weight = Number(calcWeight(productItem, _amount))

      temp.productName_id = productItem.id
      temp.amountOut = _amount
      temp.volume = item_volume
      temp.freightfee = item_freightfee
      temp.weight = item_weight
      temp.site = _site
      outItemList.push(temp)

      _total_freightfee += item_freightfee
      _total_volume += item_volume
      _total_weight += item_weight
    })
    resolve({
      _total_freightfee,
      _total_volume,
      _total_weight,
      outItemList,
      productNotFound
    })
  })
}

const imOutStockUpload = async (productList, outItemList, outstockId) => {
  let msg = '', status = 'succeed'
  var negativeStock = 0
  var negative_stock = []
  for (let productItem of productList) {
    let _amountOut = 0
    outItemList.forEach(outItem => {
      if (productItem.id === outItem.productName_id) {
        _amountOut = outItem.amountOut
      }
    })
    let _imList = productItem.inventorymaterials

    for (let _imObj of _imList) {
      let _change = _amountOut * _imObj.productmaterial.pmAmount
      if (_imObj.amount - _change < 0) {
        msg = `${_imObj.uniqueId}-物料数量已小于0,请及时修改或补充`
        negativeStock++
        await models.negative_stock.create({
          meterial_unique_id: _imObj.id,
          outstock_id: outstockId,
          pre_amount: _imObj.amount,
          cur_amount: _imObj.amount - _change
        })
      }

      await models.sequelize.query(`UPDATE inventorymaterial SET amount = amount-${_change} WHERE id = ${_imObj.id}`)
    }
  }

  return { msg, status, negativeStock }
}

/**
 * 1.获取预出库对象和关联的产品,创建params和list
 * 2.根据params创建出库对象,根据list创建outitem对象关联
 * 3.计算关联物料数量,修改物料数量
 * 4.返回状态码
 */
const preToOutstockById = async (id) => {
  let status = "failed", msg = ""
  let preoutstockOrigin = await models.preoutstock.findOne({
    where: {
      id: id
    },
    include: [{
      model: models.producttemp,
      attributes: ['id', 'weight', 'length', 'width', 'height', 'dhlShippingFee', 'freightFee', 'site_id']
    }]
  })

  const outstockParams = buildOutstockParamsFromPre(preoutstockOrigin)
  let outstockObj = await models.outstock.create(outstockParams)
  let res = buildOutItem(outstockObj, preoutstockOrigin)

  await preoutstockOrigin.update({
    has_out: true
  })

  return res
}

const buildOutstockParamsFromPre = (preObj) => {
  let _outParams = {}
  _outParams.code = preObj.pcode
  _outParams.c_time = Date.now()
  _outParams.description = preObj.pdescription
  _outParams.userOutstock_id = preObj.user_id
  _outParams.total_freightfee = preObj.total_freightfee
  _outParams.total_volume = preObj.total_volume
  _outParams.total_weight = preObj.total_weight
  return _outParams
}

const buildOutItem = async (outObj, preObj) => {
  const productIds = preObj.producttemps.map(item => {
    return item.id
  })

  const siteMap = await models.site.findAll({
    attributes: ['id', 'name']
  })

  //console.log(preObj.Producttemps)
  //返回一个数组,每个元素是一个对象,放着amount,weight,volume,freightFee
  const outAttributes = preObj.producttemps.map((item) => {
    let _volume = calcVolume(item, item.preoutitem.amount)
    let _weight = calcWeight(item, item.preoutitem.amount)
    let _freightFee = calcFreightFee(item, item.preoutitem.amount)
    let _site = getSiteName(siteMap, item.site_id)
    return {
      productName_id: item.id,
      amountOut: item.preoutitem.amount,
      volume: _volume,
      weight: _weight,
      freightfee: _freightFee,
      site: _site
    }
  })

  const productList = await models.producttemp.findAll({
    where: {
      id: productIds
    },
    attributes: ['id'],
    include: {
      model: models.inventorymaterial,
      attributes: ['id', 'uniqueId', 'amount']
    }
  })
  //创建outitem关联,这里要加入单票的weight,volume,freightfee
  productList.forEach((item, index) => {
    let temp = {}
    outAttributes.forEach(outItem => {
      if (item.id === outItem.productName_id) temp = outItem
    })
    //这里有一定几率出问题
    outObj.setProducttemps(item,
      {
        through:
        {
          amountOut: temp.amountOut,
          volume: temp.volume,
          weight: temp.weight,
          freightfee: temp.freightfee,
          site: temp.site
        }
      })
  })
  let imRes = await imOutStockUpload(productList, outAttributes)
  return imRes
}

const getSiteName = (siteMap, site_id) => {
  let siteName = ''
  for (let site of siteMap) {
    if (site.id === site_id) {
      siteName = site.name
    }
  }
  return siteName
}

const calcVolume = (productObj, amount) => {
  let _volume = 0
  let _length = Number(productObj.length)
  let _width = Number(productObj.width)
  let _height = Number(productObj.height)
  let _amount = Number(amount)
  if (_length && _width && _height && _amount) {
    _volume = (_length * _width * _height * _amount) / 1000000

  } else {
    _volume = 0
  }
  //console.log(_length,_width,_height,_amount,_volume)
  return _volume.toFixed(3)
}

const calcWeight = (productObj, amount) => {
  let _totalWeight = 0
  let _amount = Number(amount)
  let _weight = Number(productObj.weight)
  if (_weight && _amount) {
    _totalWeight = _weight * _amount
  } else {
    _totalWeight = 0
  }
  return _totalWeight.toFixed(3)
}

const calcFreightFee = (productObj, amount) => {
  let _totalFreightFee = 0
  let _amount = Number(amount)
  let _dhlShippingFee = Number(productObj.dhlShippingFee)
  let _freightFee = Number(productObj.freightFee)

  if (_freightFee) {
    _totalFreightFee = _amount * _freightFee
  } else if (_dhlShippingFee) {
    _totalFreightFee = _amount * _dhlShippingFee
  } else {
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
const copyPreoutstockById = async (id) => {
  let status = "failed", msg = ""
  let preoutstockOrigin = await models.preoutstock.findOne({
    where: {
      id: id
    },
    include: [{
      model: models.producttemp,
      attributes: ['id']
    }]
  })
  const copyParams = buildPreoutstockCopyParams(preoutstockOrigin)
  let copyPreoutstockObj = await models.preoutstock.create(copyParams)
  buildPreoutItem(copyPreoutstockObj, preoutstockOrigin)

  return {
    status: 'succeed',
    msg: '已成功复制'
  }
}

const buildPreoutstockCopyParams = (params) => {
  let _params = JSON.parse(JSON.stringify(params))
  delete _params.id
  delete _params.Producttemps
  if (params.pcode.length < 28) {
    _params.pcode = params.pcode + '副本'
  }
  _params.ptime = Date.now()
  _params.has_out = 0
  return _params
}

const buildPreoutItem = async (copyObj, origin) => {
  const productIds = origin.producttemps.map(item => {
    return item.id
  })
  const amounts = origin.producttemps.map(item => {
    return item.preoutitem.amount
  })
  const productList = await models.producttemp.findAll({
    where: {
      id: productIds
    }
  })
  productList.forEach((item, index) => {
    copyObj.setProducttemps(item, { through: { amount: amounts[index] } })
  })
}

const findProductById = async (id) => {
  let brandSql = `SELECT name FROM brand WHERE id = $1`
  const siteMap = await models.site.findAll({
    attributes: ['id', 'name']
  })

  // const usersList = await models.user.findAll({
  //   attributes:['id','name']
  // })

  const result = await models.producttemp.findOne({
    where: { id: id },
    include: [models.inventorymaterial]
  })
  const [brandResult, metadata] = await models.sequelize.query(brandSql, {
    bind: [result.brand]
  })
  let data = {}
  data.detail = productDetailHandler(result, siteMap)
  data.detail.brandName = brandResult[0].name
  return data
}

const productDetailHandler = (result, siteMap) => {
  let data = JSON.parse(JSON.stringify(result))
  delete data.Inventorymaterials
  data.siteMap = siteMap
  data.materials = result.inventorymaterials.map(item => {
    let temp = {}
    temp.id = item.id
    temp.uniqueId = item.uniqueId
    temp.amount = item.productmaterial.pmAmount
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
const changeProduct = async (params) => {
  const productOrigin = await models.producttemp.findOne({
    where: { id: params.id },
    include: [models.inventorymaterial]
  })

  const brand = await findBrandIdByName(params.brandName)
  if (brand.length === 0) {
    return {
      msg: `品牌${params.brandName}不存在`,
      id: params.id
    }
  } else {
    params.brand = brand[0].id
  }
  //检查计算项是否发生了改变
  const isComputedAttributesChanged = checkProductParams(params, productOrigin)
  if (!isComputedAttributesChanged) {
    //console.log('非计算项改变')
    //更新非数据项
    updateProduct(params)
  } else {
    //更新各种计算项
    //console.log('计算项改变')
    updateCalcProduct(params, productOrigin)
  }
  updateProductMaterial(params)
  await models.log.create({
    user_id: params.user_id,
    createAt: Date.now(),
    type: CONSTANT.LOG_TYPES.PRODUCT,
    action: `编辑:${productOrigin.sku}`
  })
  return {
    msg: '已成功更新数据',
    id: params.id
  }
}

const findBrandIdByName = async (name) => {
  let sql = `SELECT id FROM brand WHERE name = $1`
  let [result, metadata] = await models.sequelize.query(sql, {
    bind: [name]
  })
  return result
}

const updateCalcProduct = async (params, productOrigin) => {
  let productObj = await buildProductObjCompute(params, productOrigin)
  //console.log('obj',productObj)
  try {
    await models.producttemp.update(productObj, {
      where: {
        id: params.id
      }
    })
  }
  catch (err) {
    console.log('updateCalcProduct-ERROR', err)
  }

}

const updateProduct = async (params) => {
  let productObj = buildProductObjWithoutCompute(params)
  await models.producttemp.update(productObj, {
    where: {
      id: params.id
    }
  })
}

//1.查找表productmaterail中pmProduct_id等于params.id的对象并删除
//2.根据params.id,materials.item的id和amount,创建pm表新对象
const updateProductMaterial = async (params) => {
  await models.productmaterial.destroy({
    where: {
      pmProduct_id: params.id
    }
  })
  try {
    params.materials.forEach(item => {
      models.productmaterial.create({
        pmProduct_id: params.id,
        pmMaterial_id: item.id,
        pmAmount: item.amount
      })
    })
  }
  catch (err) {
    console.log('updateProductMaterial-ERROR:', err)
  }
}

const createProduct = async (params) => {
  let msg = ""
  let success = true
  let [isBrandExist, brandId] = await checkBrandExist(params)
  if (!isBrandExist) {
    msg = "品牌不存在"
    success = false
    return {
      msg: msg,
      success: success
    }
  }
  const IsSkuRepeat = await checkSkuRepeat(params.sku)

  if (!IsSkuRepeat) {
    const currencyExchangeRate = await getExchangeRateBySiteId(params.site_id)
    params.currency = currencyExchangeRate

    const formatParams = productParamsFormat(params)
    const hasAllComputeAttributes = checkComputeAttribute(formatParams)

    let productObj
    if (hasAllComputeAttributes) {
      productObj = await createProductWithCompute(formatParams)
    } else {
      productObj = await createProductWithoutCompute(formatParams)
    }

    await createProductMaterial(params, productObj)

    msg = "已成功新增产品"
    success = true
  } else {
    msg = "sku重复,无法创建新产品"
    success = false
  }

  return {
    msg: msg,
    success: success
  }
}

/**
 * 1.取出materials的id列表,根据params的id找出IM对象
 * 2.遍历IM对象,配合productObj创建productmaterial对象
 *
 */
const createProductMaterial = async (params, productObj) => {
  const imIds = params.materials.map(item => {
    return item.id
  })

  const IMObjList = await models.inventorymaterial.findAll({
    where: {
      id: imIds
    }
  })

  IMObjList.map((imItem, index) => {
    let _amount = 0
    params.materials.forEach(item => {
      if (item.id === imItem.id) {
        _amount = item.amount
      }
    })
    productObj.setInventorymaterials(imItem, {
      through: {
        pmAmount: _amount
      }
    })
  })
}
const checkSkuRepeat = async (sku) => {
  let skuRes = await models.producttemp.findAndCountAll({
    where: {
      sku: sku
    }
  })
  return Boolean(skuRes.count)
}

const checkBrandExist = async (params) => {
  let brandExist = true
  let brandId = -1
  let brandQuerySql = `SELECT id FROM brand WHERE name = $1`
  let [result, metadata] = await models.sequelize.query(
    brandQuerySql,
    {
      bind: [params.brandName]
    }
  )
  if (result.length === 0) {
    brandExist = false
    brand = -1
  } else {
    brandExist = true
    brandId = result[0].id
  }
  return [brandExist, brandId]
}

//遍历attribute-type的字典,对params做数据类型转换和默认值写入.
const productParamsFormat = (params) => {
  //delete params.authToken
  for (let key in CONSTANT.PRODUCT_PARAMS_MAP) {
    let type = CONSTANT.PRODUCT_PARAMS_MAP[key].type
    let value = params[key] || CONSTANT.PRODUCT_PARAMS_MAP[key].default
    type === "float" ? value = parseFloat(value) : null
    params[key] = value
  }
  params.c_time = Date.now()
  return params
}
const checkComputeAttribute = (params) => {
  //若有一项为0则为false
  let attributesHasNoZero = true
  //仅检查涉及计算的项目,若缺项或某项为0,则拒绝计算.
  for (let key of CONSTANT.PRODUCT_CALC_LIST) {
    if (!params[key] || params[key] === 0) attributesHasNoZero = false
  }

  //计算dhlfee是否存在
  let { _dhlfee } = calDHLShippingFee(params)
  if (_dhlfee === 0) {
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
const createProductWithCompute = async (params) => {
  let { _dhlfee, _dhlShippingFee } = calDHLShippingFee(params)
  let _shrinkage = calShrinkage({
    ...params,
    dhlfee: _dhlfee,
  })
  let { _margin, _marginRate } = calMargin({
    ...params,
    dhlfee: _dhlfee,
    shrinkage: _shrinkage
  })
  let _productCostPercentage = calProductCostPercentage(params)

  let productObj = await models.producttemp.create({
    ...params,
    shrinkage: _shrinkage,
    margin: _margin,
    marginRate: _marginRate,
    productCostPercentage: _productCostPercentage,
    dhlShippingFee: _dhlShippingFee
  })
  return productObj
}

const createProductWithoutCompute = async (params) => {
  let productObj = await models.producttemp.create({
    ...params,
    shrinkage: 0,
    margin: 0,
    marginRate: 0,
    productCostPercentage: 0,
    dhlShippingFee: 0
  })
  return productObj
}



//检查purchasePrice,freightFee,amazonSalePrice,site四项是否修改
const checkProductParams = (params, productOrigin) => {
  return !(params.purchasePrice === productOrigin.purchasePrice
    && params.freightFee === productOrigin.freightFee
    && params.amazonSalePrice === productOrigin.amazonSalePrice
    && params.site_id === productOrigin.site_id)
}

const buildProductObjWithoutCompute = (params) => {
  return {
    sku: params.sku,
    childAsin: params.childAsin,
    title: params.title,
    image: params.image,
    brand: params.brand
  }
}

const getExchangeRateBySiteId = async (site_id) => {
  let siteObj = await models.site.findOne({
    where: {
      id: site_id
    },
    include: [models.currency]
  })
  return siteObj.currency.exchangeRateRMB
}
/*
* 1.拿到了新数据和原始数据
* 2.取出相关数据做运算
* 3.打好包返回给更新函数
*/

const buildProductObjCompute = async (params, productOrigin) => {
  const currencyExchangeRate = await getExchangeRateBySiteId(params.site_id)

  //计算损耗
  let shrinkageParmas = buildShrinkageParmas(params, productOrigin, currencyExchangeRate)
  let _shrinkage = calShrinkage(shrinkageParmas)

  //计算利润和利润率
  let marginParams = buildMarginParams(params, productOrigin, _shrinkage, currencyExchangeRate)
  let { _margin, _marginRate } = calMargin(marginParams)

  // //计算成本率
  let _productCostPercentage = calProductCostPercentage({
    purchasePrice: params.purchasePrice,
    amazonSalePrice: productOrigin.amazonSalePrice,
    currency: currencyExchangeRate
  })

  return {
    freightFee: params.freightFee,
    amazonSalePrice: params.amazonSalePrice,
    purchasePrice: params.purchasePrice,

    site_id: params.site_id,
    sku: params.sku,
    childAsin: params.childAsin,
    title: params.title,
    image: params.image,

    shrinkage: _shrinkage,
    margin: _margin,
    marginRate: _marginRate,
    productCostPercentage: _productCostPercentage,
    currency: currencyExchangeRate
  }
}

const calDHLShippingFee = (params) => {
  let dhlShippingFee = 0, dhlfee = 0
  let weight = parseFloat(params.weight) || 0
  let length = parseFloat(params.length) || 0
  let width = parseFloat(params.width) || 0
  let height = parseFloat(params.height) || 0
  let fee1 = weight * 35
  let fee2 = length * width * height * 0.007

  dhlShippingFee = fee1 > fee2 ? fee1 : fee2

  if (!params.freightFee || params.freightFee === 0) {
    dhlfee = dhlShippingFee
  } else {
    dhlfee = params.freightFee
  }

  return {
    _dhlShippingFee: dhlShippingFee,
    _dhlfee: dhlfee
  }
}

//存在freightFee就用,不存在就用dhlShippingFee
const buildShrinkageParmas = (params, productOrigin, currencyExchangeRate) => {
  let dhlfee = 0
  if (Number(params.freightFee)) {
    dhlfee = params.freightFee
  } else {
    dhlfee = productOrigin.dhlShippingFee
  }
  return {
    dhlfee: dhlfee,
    purchasePrice: params.purchasePrice,
    packageFee: productOrigin.packageFee,
    opFee: productOrigin.opFee,
    currency: currencyExchangeRate,
    fbaFullfillmentFee: productOrigin.fbaFullfillmentFee,
    adcost: productOrigin.adcost
  }
}
const calShrinkage = (params) => {
  purchasePrice = parseFloat(params.purchasePrice) || 0
  dhlfee = parseFloat(params.dhlfee) || 0
  packageFee = parseFloat(params.packageFee) || 0
  opFee = parseFloat(params.opFee) || 0
  currency = parseFloat(params.currency) || CONSTANT.DEFAULT_USD_CURRENCY
  fbaFullfillmentFee = parseFloat(params.fbaFullfillmentFee) || 0
  adcost = parseFloat(params.adcost) || 0
  fee1 = (purchasePrice + dhlfee + packageFee + opFee) / currency
  fee2 = (fee1 + fbaFullfillmentFee + adcost) * 0.117
  return fee2.toFixed(3)
}

const buildMarginParams = (params, productOrigin, _shrinkage, currencyExchangeRate) => {
  let dhlfee = 0
  if (Number(params.freightFee)) {
    dhlfee = params.freightFee
  } else {
    dhlfee = productOrigin.dhlShippingFee
  }
  return {
    dhlfee: dhlfee,
    purchasePrice: params.purchasePrice,
    amazonSalePrice: params.amazonSalePrice,

    packageFee: productOrigin.packageFee,
    opFee: productOrigin.opFee,
    currency: currencyExchangeRate,
    fbaFullfillmentFee: productOrigin.fbaFullfillmentFee,
    adcost: productOrigin.adcost,
    amazonReferralFee: productOrigin.amazonReferralFee,
    payoneerServiceFee: productOrigin.payoneerServiceFee,

    shrinkage: _shrinkage
  }
}
const calMargin = (params) => {
  purchasePrice = parseFloat(params.purchasePrice) || 0
  dhlfee = parseFloat(params.dhlfee) || 0
  packageFee = parseFloat(params.packageFee) || 0
  opFee = parseFloat(params.opFee) || 0
  currency = parseFloat(params.currency) || CONSTANT.DEFAULT_USD_CURRENCY
  fbaFullfillmentFee = parseFloat(params.fbaFullfillmentFee) || 0
  adcost = parseFloat(params.adcost) || 0
  amazonReferralFee = parseFloat(params.amazonReferralFee) || 0
  payoneerServiceFee = parseFloat(params.payoneerServiceFee) || 0
  amazonSalePrice = parseFloat(params.amazonSalePrice) || 0
  shrinkage = parseFloat(params.shrinkage) || 0

  let fee1, fee2, fee3, _margin, _marginRate

  fee1 = amazonSalePrice * (1 - amazonReferralFee / 100)
  fee2 = fbaFullfillmentFee + shrinkage + adcost
  fee3 = (fee1 - fee2) * (1 - payoneerServiceFee / 100) * currency
  _margin = (fee3 - purchasePrice - dhlfee - packageFee - opFee).toFixed(2)
  if (amazonSalePrice * currency === 0) {
    _marginRate = 0
  }
  else {
    _marginRate = (100 * _margin / (amazonSalePrice * currency)).toFixed(2)
  }
  return {
    _margin,
    _marginRate
  }
}

const calProductCostPercentage = (params) => {
  purchasePrice = parseFloat(params.purchasePrice) || 0
  amazonSalePrice = parseFloat(params.amazonSalePrice) || 0
  currency = parseFloat(params.currency) || CONSTANT.DEFAULT_USD_CURRENCY
  if (amazonSalePrice * currency == 0) {
    fee = 0
  }
  else {
    fee = 100 * purchasePrice / (amazonSalePrice * currency)
  }
  return fee.toFixed(2)
}


/**
 * 从数据库中找到所有数据
 * 然后将数据组装成map，将一个产品的物料信息存到一起，以productSku为key，所有的信息为value(包括所有的物料)
 * 然后再组装成固定的格式。例如：第一个产品有物料5个，第二产品只有2个物料，那么将第二个产品的物料名称和数量补上，但是value设置成 ""
 */
var findAllRelationShip = async function (params) {
  let result = { data: [], total: 0 }
  let productIdList = await getProductIdList(params)
  if (productIdList.length === 0) {
    return result
  }
  let querySql = await buildQuerySql(productIdList)
  const [queryRes, queryMetadata] = await models.sequelize.query(querySql)
  let totalRes = await getProductTotal(params)
  let data = await buildData(queryRes)
  result.data = data, result.total = totalRes
  return result
}

var getProductIdList = async function (params) {
  let productIdList = []
  if (params.item != undefined) {
    productIdList = await getProductIdListWithSearcher(params)
  } else {
    productIdList = await getProductIdListWithNoSearcher(params)
  }

  return productIdList
}

var getProductIdListWithSearcher = async function (params) {
  let item = "%" + params.item + "%"
  let productIdList = []
  let result = await models.producttemp.findAll({
    where: {
      [Op.or]: [
        {
          sku: {
            [Op.like]: item
          }
        },
        {
          description: {
            [Op.like]: item
          }
        }
      ],
      is_deleted: [0],
    },
    order: [['id', 'DESC']],
    limit: params.limited,
    offset: params.offset
  })
  result.map(item => {
    productIdList.push(item.id)
  })
  return productIdList
}

var getProductIdListWithNoSearcher = async function (params) {
  let row_count = (params.pageNum - 1) * params.pageSize
  let productIdList = []
  let getProductSql = `SELECT id FROM producttemp WHERE is_deleted = 0 ORDER BY id DESC LIMIT $1,$2`
  const [productResults, metadata] = await models.sequelize.query(getProductSql, {
    bind: [params.offset, params.limited]
  })
  for await (let product of productResults) {
    productIdList.push(product.id)
  }
  return productIdList
}

var buildQuerySql = async function (productIdList) {
  let querySql = `SELECT pro.id, pro.sku, pro.description, im.uniqueId AS 'uniqueId1',pm.pmAmount AS 'pmAmount1'
  FROM producttemp pro
	LEFT JOIN productmaterial pm ON pm.pmProduct_id = pro.id
  LEFT JOIN inventorymaterial im ON pm.pmMaterial_id = im.id
  WHERE pro.id IN (?) 
  ORDER BY pro.id DESC
  `
  querySql = querySql.replace(`?`, productIdList.toString())
  return querySql
}

var getProductTotal = async function (params) {
  let item = ``
  let queryCountSql = ``
  let total = 0
  if (params.item != undefined) {
    item = "%" + params.item + "%"
    let result = await models.producttemp.count({
      where: {
        [Op.or]: [
          {
            sku: {
              [Op.like]: item
            }
          },
          {
            description: {
              [Op.like]: item
            }
          }
        ],
        is_deleted: [0],
      },
    })
    total = result
  } else {
    queryCountSql = `SELECT count(*) total FROM producttemp WHERE is_deleted = 0`
    let [result, metadata] = await models.sequelize.query(queryCountSql)
    total = result[0].total
  }
  return total
}



var buildData = async function (sqlResults) {
  let dataMap = transformDataToMap(sqlResults)
  let data = buildRelationData(dataMap)
  return data
}

var transformDataToMap = function (data) {
  var map = {}
  let dataMap = {}
  let max = 1
  data.map(item => {
    let sku = item.sku
    if (map[sku] == undefined) {
      map[sku] = 1
      dataMap[sku] = item
    } else {
      let count = map[sku] + 1
      map[sku] = count
      let meterialName = "uniqueId" + count
      let pmAmountName = "pmAmount" + count
      dataMap[sku][meterialName] = item.uniqueId1
      dataMap[sku][pmAmountName] = item.pmAmount1
      if (max < count) {
        max = count
      }
    }
  })
  return {
    data: dataMap,
    maxMeterialCount: max
  }
}

var buildRelationData = function (dataMap) {
  let result = []
  let keys = Object.keys(dataMap.data)
  let data = dataMap.data
  keys.map(item => {
    for (var j = 2; j <= dataMap.maxMeterialCount; j++) {
      let meterialName = "uniqueId" + j
      if (data[item][meterialName] == undefined) {
        let meterialName = "uniqueId" + j
        let pmAmountName = "pmAmount" + j
        data[item][meterialName] = ""
        data[item][pmAmountName] = ""
      }
    }
    result.push(data[item])
  })
  return result
}

var showNoneProductMeterial = async function () {
  let sql = `SELECT DISTINCT uniqueId,description FROM inventorymaterial im WHERE im.id NOT IN (
    SELECT pmMaterial_id FROM productmaterial
  )
  `
  const [sqlResults, metadata] = await models.sequelize.query(sql)
  let data = []
  sqlResults.map(item => {
    data.push(item)
  })
  return data
}

var deleteProduct = async function (params) {
  let sqlPM = `DELETE FROM productmaterial WHERE pmProduct_id = ${params}`
  let sqlDelProduct = `UPDATE producttemp SET is_deleted = 1 WHERE id =  ${params}`

  let msg = ""
  let success = true
  let preOutData = await checkIsPreOut(params)
  if (preOutData.length > 0) {
    success = false
    msg = `以下预出库数据(id)包含该产品尚未出库:` + preOutData.toString()
    return {
      success: success,
      msg: msg
    }
  }
  const t = await models.sequelize.transaction();
  try {
    await models.sequelize.query(sqlPM, { transaction: t })
    await models.sequelize.query(sqlDelProduct, { transaction: t })
    await t.commit()
    msg = "删除成功"
  } catch (err) {
    success = false
    msg = `删除失败`
    console.log(err)
    await t.rollback()
  }
  return {
    success: success,
    msg: msg
  }
}

var checkIsPreOut = async function (params) {
  let sqlPreOutItem = `SELECT id FROM preoutstock 
      WHERE has_out = 0 
      AND id IN (
        SELECT DISTINCT master_id FROM preoutitem
          WHERE productName_id = ${params}
        )
    `
  let [result, metadata] = await models.sequelize.query(sqlPreOutItem, {
    bind: [params]
  })
  let list = result.map(item => {
    return item.id
  })
  return list
}
/**
 * 首先判断产品、物料是否在数据库存在，产品在库中存在不能新建、物料在库中不存在不能新建，在判断物料是否在库中时将uniqueId转换成id
 * 
 */


var createProductList = async function (data) {
  let { res, mapInfo } = await checkAllConditions(data)

  if (res.productExistInfo.allNewProductNotExist && res.materialExistInfo.allMaterialExist && 
        res.siteExistInfo.allSitesExist && res.amountInfo.amountAllInt && !res.emptyInfo.hasEmpty) {
    let insertResult = await insertProduct(data, mapInfo)
    res.insertResult = insertResult
  }
  return res
}

var checkAllConditions = async function (data) {
  let res = {}
  res.insertResult = { success: true, message: "" }
  res.productExistInfo = await findProductExist(data)
  let brandExistInfo = await findBrandExist(data)
  let materialExistInfo = await findMaterialExists(data)
  let siteExistInfo = await findSiteExists(data)
  let amountInfo = await checkAmount(data)
  let emptyInfo = await checkEmpty(data)
  res.materialExistInfo = {
    allMaterialExist: materialExistInfo.allMaterialExist,
    materialNotFindList: materialExistInfo.materialNotFindList
  }
  res.siteExistInfo = {
    allSitesExist: siteExistInfo.allSitesExist,
    siteNotFound: siteExistInfo.siteNotFound
  }
  res.brandExistInfo = {
    allBrandExist: brandExistInfo.allBrandExist,
    brandNotFound: brandExistInfo.brandNotFound
  }
  res.emptyInfo = emptyInfo
  res.amountInfo = amountInfo
  let mapInfo = {
    siteMap: siteExistInfo.siteMap,
    materialMap: materialExistInfo.materailMap,
    brandMap: brandExistInfo.brandMap
  }
  return { res: res, mapInfo: mapInfo }
}

var findProductExist = async function (params) {
  //存放已经存在的sku
  let upOrLowCase = []
  let RepeatCase = new Set()
  let allNewProductNotExist = true
  let allExistProductsWithLowCase = await getAllExistProducts()
  params.map(item => {
    let lowCase = item.sku.toLowerCase()
    if (allExistProductsWithLowCase.has(lowCase) || RepeatCase.has(lowCase)) {
      upOrLowCase.push(item.sku)
    }
    RepeatCase.add(lowCase)
  })
  allNewProductNotExist = upOrLowCase.length === 0 ? true : false

  return {
    upOrLowCase: upOrLowCase,
    allNewProductNotExist: allNewProductNotExist
  }
}

var getAllExistProducts = async function () {
  let sql = "SELECT sku FROM producttemp"
  let res = new Set()
  let [sqlResult, metadata] = await models.sequelize.query(sql)
  sqlResult.map(item => {
    res.add(item.sku.toLowerCase())
  })
  return res
}

var findBrandExist = async function (params) {
  let brandNameList = []
  let brandMap = new Map()
  let brandNotFound = []
  let allBrandExist = true
  params.map(item => {
    brandNameList.push(item.brandName)
  })
  let result = await models.brand.findAll({
    where: {
      name: {
        [Op.in]: brandNameList
      }
    }
  })
  result.map(item => {
    brandMap.set(item.name, item.id)
  })
  brandNameList.map(item => {
    if (!brandMap.has(item)) {
      brandNotFound.push(item)
    }
  })
  allBrandExist = brandNotFound.length === 0 ? true : false
  return { allBrandExist: allBrandExist, brandMap: brandMap, brandNotFound: brandNotFound }
}

var findMaterialExists = async function (params) {
  let materialNotFindList = []
  let allMaterialExist = true
  let materialList = []
  let materailMap = new Map()
  params.map(product => {
    product.materialList.map(item => {
      materailMap.set(item.uniqueId)
    })
  })
  for (let key of materailMap) {
    materialList.push(key[0])
  }
  let result = await models.inventorymaterial.findAll({
    where: {
      uniqueId: {
        [Op.in]: materialList
      }
    }
  })
  result.map(item => {
    materailMap.set(item.uniqueId, item.id)
  })
  for (let key of materailMap) {
    if (key[1] === undefined) {
      materialNotFindList.push(key[0])
    }
  }

  allMaterialExist = materialNotFindList.length > 0 ? false : true
  return {
    materialNotFindList: materialNotFindList,
    allMaterialExist: allMaterialExist,
    materailMap: materailMap
  }
}

var findSiteExists = async function (data) {
  let siteNameList = []
  let siteMap = new Map()
  let allSitesExist = true
  let siteNotFound = []
  data.map(item => {
    siteNameList.push(item.site)
  })
  let result = await models.site.findAll({
    where: {
      name: {
        [Op.in]: siteNameList
      }
    }
  })
  result.map(item => {
    siteMap.set(item.name, item.id)
  })
  data.map(item => {
    if (!siteMap.has(item.site)) {
      siteNotFound.push(item.site)
      allSitesExist = false
    }
  })
  return { siteMap: siteMap, allSitesExist: allSitesExist, siteNotFound: siteNotFound }
}

var checkAmount = async function (data) {
  let illegalSku = []
  let amountAllInt = true
  data.map(product => {
    product.materialList.map(item => {
      if (item.materialAmount % 1 !== 0 || item.materialAmount <= 0) {
        amountAllInt = false
        illegalSku.push(item.sku)
      }
    })
  })
  return {
    amountAllInt: amountAllInt,
    illegalSku: illegalSku
  }
}

var checkEmpty = async function (data) {
  let hasEmpty = false
  data.map(item => {
    //前端数据为空，那么就显示undefined，后端拿到的是字符串类型的 undefined
    if (item.sku === 'undefined' || item.title === 'undefined' || item.description === 'undefined') {
      hasEmpty = true
    }
  })
  return { hasEmpty: hasEmpty }
}

var insertProduct = async function (data, mapInfo) {
  let siteMap = mapInfo.siteMap
  let materialMap = mapInfo.materialMap
  let brandMap = mapInfo.brandMap
  let productInsertSql = `INSERT INTO producttemp (sku,title,description,site_id,creater_id,brand) VALUES ($1,$2,$3,$4,$5,$6)`
  let findProductIdSql = `SELECT id FROM producttemp WHERE sku = $1`
  let productMaterialInsertSql = `INSERT INTO productmaterial (pmAmount,pmProduct_id,pmMaterial_id) VALUES ($1,$2,$3)`
  let message = ``, errorRow = ``
  const t = await models.sequelize.transaction()
  let success = true
  try {
    for await (let product of data) {
      errorRow = product.sku
      await models.sequelize.query(productInsertSql, {
        bind: [product.sku, product.title, product.description, siteMap.get(product.site), product.creater_id, brandMap.get(product.brandName)],
        transaction: t
      })
      let [idResult, metadata] = await models.sequelize.query(findProductIdSql, {
        bind: [product.sku],
        transaction: t
      })
      for await (let material of product.materialList) {
        await models.sequelize.query(productMaterialInsertSql, {
          bind: [material.materialAmount, idResult[0].id, materialMap.get(material.uniqueId)],
          transaction: t,
        })
      }
    }
    message = "创建成功"
    await t.commit()
  } catch (error) {
    await t.rollback()
    success = false
    message = "产品" + errorRow + "创建失败"
    console.log(error)
  }
  return { success: success, message: message }
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
  outstockUpload,
  findOutstockLog,
  findOutstockDetailById,
  findEditLog,
  findAllRelationShip,
  showNoneProductMeterial,
  deleteProduct,
  createProductList
}
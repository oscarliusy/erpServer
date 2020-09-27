const models = require('../../sequelizeTool/models/index.js')
//出库入口函数
const preToOutstockById = async(id) =>{
  let status = "failed",msg=""
  let preoutstockOrigin = await models.preoutstock.findOne({
    where:{
      id:id
    },
    include:[{
      model:models.producttemp,
      attributes:['id','weight','length','width','height','dhlShippingFee','freightFee','site_id']
    }]
  })

  const outstockParams = buildOutstockParamsFromPre(preoutstockOrigin)
  //创建出库对象
  let outstockObj = await models.outstock.create(outstockParams)
  //创建出库单项，问题在这~
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
  const productIds = preObj.producttemps.map(item=>{
    return item.id
  })

  const siteMap = await models.site.findAll({
    attributes:['id','name']
  })

  //console.log(preObj.Producttemps)
  //返回一个数组,每个元素是一个对象,放着amount,weight,volume,freightFee
  const outAttributes = preObj.producttemps.map((item)=>{
    let _volume = calcVolume(item,item.preoutitem.amount)
    let _weight = calcWeight(item,item.preoutitem.amount)
    let _freightFee = calcFreightFee(item,item.preoutitem.amount)
    let _site = getSiteName(siteMap,item.site_id)
    return {
      productName_id:item.id,
      amountOut:item.preoutitem.amount,
      volume:_volume,
      weight:_weight,
      freightfee:_freightFee,
      site:_site
    }
  })

  const productList = await models.producttemp.findAll({
    where:{
      id:productIds,
    },
    attributes:['id','sku'],
    include:{
      model:models.inventorymaterial,
      attributes:['id','uniqueId','amount']
    }
  })
  //创建outitem关联,这里要加入单票的weight,volume,freightfee
  productList.forEach((item,index)=>{
    let temp = {}
    outAttributes.forEach(outItem=>{
      if(item.id === outItem.productName_id) temp = outItem
    })
  
    outObj.setProducttemps(item,
      {through:
        {
          amountOut:temp.amountOut,
          volume:temp.volume,
          weight:temp.weight,
          freightfee:temp.freightfee,
          site:temp.site
        }
      })
  })
  // productList.forEach(item=>{
  //   console.log(item.sku)
  //   let ims = item.inventorymaterials.forEach(imitem=>{
  //     console.log('       ',imitem.uniqueId,imitem.amount,imitem.productmaterial.dataValues)
  //   })
  // })
  // console.log("outAttributes:",outAttributes)
  //上面查出来的数没啥问题，估计bug在下面
  let imRes = await imOutStockUpload(productList,outAttributes)
  return imRes
}

const getSiteName = (siteMap,site_id)=>{
  let siteName = ''
  for(let site of siteMap){
    if(site.id === site_id){
      siteName = site.name
    }
  }
  return siteName
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
const imOutStockUpload = async(productList,outItemList)=>{
  let msg = '',status = 'succeed'

  for(let productItem of productList){
    let _amountOut = 0
    outItemList.forEach(outItem=>{
      if(productItem.id === outItem.productName_id){
        _amountOut = outItem.amountOut
      }
    })
    let _imList = productItem.inventorymaterials

    for(let _imObj of _imList){
      let _change =  _amountOut*_imObj.productmaterial.pmAmount
      if(_imObj.amount - _change < 0) msg = '物料数量已小于0,请及时修改或补充'
      await models.sequelize.query(`UPDATE inventorymaterial SET amount = amount-${_change} WHERE id = ${_imObj.id}`)
    }
  }

  return {msg,status}
}

module.exports = {
  preToOutstockById,
  buildOutstockParamsFromPre,
  buildOutItem,
  getSiteName,
  calcVolume,
  calcWeight,
  calcFreightFee,
  imOutStockUpload
}
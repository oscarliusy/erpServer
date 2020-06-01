const IMKEYS = ['id','uniqueId','description','amount','price','userPurchase_id','image']
const INSTOCKKEYS = ['id','c_time','userInstock_id','description']
const PRODUCTKEYS = [
  'id','site','sku','childAsin','title','description','image',
  'creator','c_time','purchasePrice','weight',
  'length','width','height','volumeWeight','packageFee','opFee',
  'currency','fbaFullfillmentFee','amazonReferralFee','payoneerServiceFee',
  'amazonSalePrice','adcost','dhlShippingFee','shrinkage',
  'margin','marginRate','productCostPercentage','freightFee','materials']

const PRODUCT_CALC_LIST = ['purchasePrice','packageFee','opFee',
'fbaFullfillmentFee','amazonReferralFee','payoneerServiceFee',
'amazonSalePrice','adcost']

const PRODUCT_PARAMS_MAP = {
  purchasePrice:{
    type:'float',
    default:0
  },
  weight:{
    type:'float',
    default:0
  },
  length:{
    type:'float',
    default:0
  },
  width:{
    type:'float',
    default:0
  },
  height:{
    type:'float',
    default:0
  },
  volumeWeight:{
    type:'float',
    default:0
  },
  packageFee:{
    type:'float',
    default:0
  },
  opFee:{
    type:'float',
    default:0
  },
  fbaFullfillmentFee:{
    type:'float',
    default:0
  },
  payoneerServiceFee:{
    type:'float',
    default:0
  },
  adcost:{
    type:'float',
    default:0
  },
  freightFee:{
    type:'float',
    default:0
  },
  amazonReferralFee:{
    type:'float',
    default:0
  },
  amazonSalePrice:{
    type:'float',
    default:0
  },
  currency:{
    type:'float',
    default:6.5
  },
}

const DEFAULT_USD_CURRENCY = 6.5

const PREOUTSTOCK_KEYS = ['id','pcode','ptime','pdescription','total_weight','total_volume','total_freightfee','user_id','has_out','products']

const PRODUCT_FOR_PREOUTSTOCK_KEYS = ['id','sku','childAsin','title','site']

module.exports = {
  IMKEYS,
  INSTOCKKEYS,
  PRODUCTKEYS,
  PRODUCT_PARAMS_MAP,
  PRODUCT_CALC_LIST,
  DEFAULT_USD_CURRENCY,
  PREOUTSTOCK_KEYS,
  PRODUCT_FOR_PREOUTSTOCK_KEYS
}
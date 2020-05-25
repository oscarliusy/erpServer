const IMKEYS = ['id','uniqueId','description','amount','price','userPurchase_id','image']
const INSTOCKKEYS = ['id','c_time','userInstock_id','description']
const PRODUCTKEYS = [
  'id','site','sku','childAsin','title','description','image',
  'creator','c_time','purchasePrice','weight',
  'length','width','height','volumeWeight','packageFee','opFee',
  'currency','fbaFullfillmentFee','amazonReferralFee','payoneerServiceFee',
  'amazonSalePrice','adcost','dhlShippingFee','shrinkage',
  'margin','marginRate','productCostPercentage','freightFee','materials']

module.exports = {
  IMKEYS,
  INSTOCKKEYS,
  PRODUCTKEYS
}
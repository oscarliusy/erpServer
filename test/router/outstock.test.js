const assert = require('assert')
const models = require('../../sequelizeTool/models/index.js')
const {preToOutstockById} = require('./pre2out')

/**
 * 测试方法：
 * 1.创建若干物料
 *  物料 测试物料1-5，均100个  im-test-1
 * 2.根据物料创建若干产品
 *  产品 测试产品1-7，4个1-1,3个1-多
 * 1 product-test-1 --- im-test-1---1  1  
 * 2 product-test-2 --- im-test-2---2	3
 * 3 product-test-3 --- im-test-3---3	9
 * 
 * 1 product-test-4  ---im-test-1---1	1
 *                 --- im-test-2---1	1
 * 
 * 2 product-test-5  --- im-test-1---1	2
 *                --- im-test-2---1		2
 *                --- im-test-3---1		2
 * 
 * 3 product-test-6 --- im-test-3---1	3
 *                --- im-test-4---2		6
 *                --- im-test-5---3		9
 * 
 * 2 product-test-7 --- im-test-1---1	2
 *                --- im-test-2---2		4
 *                --- im-test-3---3		6
 *                --- im-test-4---4		8
 *                --- im-test-5---5		10
 * 
 * 3.创建预出库项
 *  product-test-1    1
 *  product-test-2    2
 *  product-test-3    3
 *  product-test-4    1
 *  product-test-5    2
 *  product-test-6    3
 *  product-test-7    2
 * 
 * 消耗物料数：
 * im-test-1    6	94
 * im-test-2	10	90
 * im-test-3	20	80
 * im-test-4	14	86
 * im-test-5	19	81
 * 总数 69
 * 4.初始化物料数量
 * 5.执行出库
 * 6.对比物料数量变化和出库数据是否一致
 */
const preId = 6
const ims = ["im-test-1","im-test-2","im-test-3","im-test-4","im-test-5"]
describe('预出库转出库测试集',()=>{
  it('重置物料数量',async()=>{
    const imObjs = await models.inventorymaterial.findAll({
      where:{uniqueId:ims}
    })
    imObjs.forEach(async(item)=>{
      await item.update({
        amount:100
      })
    })
  })
  it.only('查看物料数量',async()=>{
    const imAmount = await models.inventorymaterial.findAll({
      where:{uniqueId:ims},
      attributes:['uniqueId','amount']
    })
    imAmount.forEach(item=>{
      console.log(item.dataValues)
    })
  })
  it('复现bug',async()=>{
    const result = await preToOutstockById(preId)
    console.log(result)
    assert(1)
  })
})

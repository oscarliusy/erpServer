/**
 * 1.物料页相关接口
 *   1.获取库存分页数据 getInventoryMaterialList  /api/v1/material/list
     2.提交物料编辑 postMaterialEdit              /api/v1/material/edit
     3.根据id获取物料详情 getMaterialDetailById   /api/v1/material/detail/${id}
     4.创建新品 postMaterialAdd                   /api/v1/material/add
     5.库存物料搜索 instockMaterialSearch         /api/v1/material/search
     6.提交入库信息 instockMaterialPost           /api/v1/material/instock
     7.获取物料编辑日志 getMaterialEditLogs       /api/v1/material/editlog
     8.获取入库日志 getMaterialInstockLogs        /api/v1/material/instocklog
     9.查看入库详情 getInstockDetailById          /api/v1/material/instock/${id}
     10.批量入库 调用单一入库接口
  2.相关数据库操作放在adapter/database下
  3.逻辑处理放在controller/material下
  4.数据验证放在utils/validator下

 */

const Router = require('koa-router')
const router = new Router()
const materialController = require('../controller/material')

/**
 * 1.从请求中拿到参数
 * 2.controller处理参数,获取数据
 * 3.将数据返回
 */
router.post('/list',async(ctx)=>{
  const data = await materialController.findInventoryMaterialList(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/detail/:id',async(ctx)=>{
  //console.log(ctx.params.id)
  
  const data = await materialController.findInventoryMaterialById(ctx.params.id)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/edit',async(ctx)=>{
  const data = await materialController.changeInventoryMaterial(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/add',async(ctx)=>{
  const data = await materialController.addInventoryMaterial(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/purchaserList',async(ctx)=>{
  const data = await materialController.findPurchasers()
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/search',async(ctx)=>{
  const data = await materialController.findIMListForInstork(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/instock',async(ctx)=>{
  const data = await materialController.instock(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/instocklog',async(ctx)=>{
  const data = await materialController.findInstockList(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/instock/:id',async(ctx)=>{
  let params = ctx.request.body
  params.id = ctx.params.id
  const data = await materialController.findInstockDetail(params)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/editlog',async(ctx)=>{
  const data = await materialController.findEditLog(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/total',async(ctx)=>{
  const data = await materialController.getIMtotalNumber()
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})


module.exports = router
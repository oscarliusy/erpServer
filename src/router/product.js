const Router = require('koa-router')
const router = new Router()
const productController = require('../controller/product')

router.post('/list',async(ctx)=>{
  const data = await productController.findProductList(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/siteList',async(ctx)=>{
  const data = await productController.findSites()
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/detail/:id',async(ctx)=>{
  //console.log(ctx.params.id)
  
  const data = await productController.findProductById(ctx.params.id)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/edit',async(ctx)=>{
  const data = await productController.changeProduct(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})


module.exports = router
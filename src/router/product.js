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

router.post('/siteMap',async(ctx)=>{
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

router.post('/add',async(ctx)=>{
  const data = await productController.createProduct(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/list',async(ctx)=>{
  const data = await productController.findPreoutstockList(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/copy/:id',async(ctx)=>{ 
  const data = await productController.copyPreoutstockById(ctx.params.id)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/outstock/:id',async(ctx)=>{ 
  const data = await productController.preToOutstockById(ctx.params.id)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/detail/:id',async(ctx)=>{ 
  const data = await productController.findPreoutstockById(ctx.params.id)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/search',async(ctx)=>{
  const data = await productController.productSearchForPreoutstock(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/calc',async(ctx)=>{
  const data = await productController.calcPreoutstock(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/edit',async(ctx)=>{
  const data = await productController.preoutstockEdit(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/preoutstock/add',async(ctx)=>{
  const data = await productController.preoutstockCreate(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

module.exports = router
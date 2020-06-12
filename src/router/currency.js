const Router = require('koa-router')
const router = new Router()
const currencyController = require('../controller/currency')


router.post('/site',async(ctx)=>{
  const data = await currencyController.findSiteList()
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/exchangerate',async(ctx)=>{
  const data = await currencyController.findExchangeRate()
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/sitemodify',async(ctx)=>{
  const data = await currencyController.updateSiteCurrency(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/setexchangerate',async(ctx)=>{
  const data = await currencyController.updateExchangeRate(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

router.post('/editlog',async(ctx)=>{
  const data = await currencyController.findEditLog(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})
module.exports = router
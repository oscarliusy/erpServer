const Router = require('koa-router')
const router = new Router()
const accountController = require('../controller/account')


router.post('/',async(ctx)=>{
  const data = await accountController.register(ctx.request.body)
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})


module.exports = router
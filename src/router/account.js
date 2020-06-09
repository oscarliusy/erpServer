const Router = require('koa-router')
const router = new Router()
const accountController = require('../controller/account')


router.post('/list',async(ctx)=>{
  //console.log(ctx.request.body)
  const data = await accountController.findAccountList()
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})


module.exports = router
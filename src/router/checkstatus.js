const Router = require('koa-router')
const router = new Router()

router.get('/env',(ctx)=>{
  const data = {
    env:process.env.NODE_ENV || "development"
  }
  ctx.body = {
    code:200,
    errMsg:"",
    data:data
  }
})

module.exports = router
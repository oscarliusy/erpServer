const Koa = require('koa')
const Router = require('./router')
const BodyParser = require('koa-bodyparser')
const {Config} = require('./config')
const utilToken = require('./util/tokenVerify')
const cors = require('@koa/cors')
const Log = require('./logger')

const initKoa = () =>{
  const app = new Koa()

  app.use(async(ctx,next)=>{
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    Log.req.info(`${ctx.method} ${ctx.path} - ${ms}ms`)
  })

  //调试时注释，运行时打开
  // app.on('error',err=>{
  //   Log.error.error(err)
  // })

  app.use(BodyParser())

  app.use(cors(Config.cors_config))

  app.use(utilToken.tokenVerify)

  app.use(Router.routes())
  app.use(Router.allowedMethods())
  
  app.listen(Config.server_port,()=>{
    console.log(`Server started on ${Config.server_port}`)
})
}

const start = async () => {
  initKoa()
}

module.exports = {
  start
}
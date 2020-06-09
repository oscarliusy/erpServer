const Koa = require('koa')
const Router = require('./router')
const BodyParser = require('koa-bodyparser')
const Config = require('./config')
const utilToken = require('./util/tokenVerify')
const cors = require('@koa/cors')

const initKoa = () =>{
  const app = new Koa()

  app.use(BodyParser())

  app.use(cors({
    origin: (ctx) => {
      let origin = ctx.request.headers.origin || ''
      const allowedOrigins = ['http://localhost:3000','file://']
      if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
        return origin
      } else {
        return null
      }
    },
    keepHeadersOnError: true,
    credentials: true, //是否允许发送Cookie
    allowMethods: ['GET', 'POST'], 
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
  }))

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
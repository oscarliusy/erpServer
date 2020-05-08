const Koa = require('koa')
const Router = require('./router')
const BodyParser = require('koa-bodyparser')
const Config = require('./config')



const initKoa = () =>{
  const app = new Koa()

  app.use(BodyParser())

  app.use(Router.routes())
  app.use(Router.allowedMethods())
  
  app.listen(Config.server_port,()=>{
    console.log(`Server started on ${Config.server_port}`);
})
}

const start = async () => {
  initKoa()
}

module.exports = {
  start
}
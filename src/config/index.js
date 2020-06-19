const configs = {
  development:{
    server_port:8000,
    secretOrKey:"tokenSecret",
    tokenExpireTime:60*60*24*7, //一周
    cors_config:{
      origin: (ctx) => {
        let origin = ctx.request.headers.origin || ''
        const allowedOrigins = ['http://localhost:3000','http://localhost:80','file://']
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
    }
  },
  production:{
    server_port:8000,
    secretOrKey:"tokenSecret",
    tokenExpireTime:60*60*24*7, //一周
    cors_config:{
      origin:(ctx) => {
        let origin = ctx.request.headers.origin || ''
        return origin
      },
      keepHeadersOnError: true,
      credentials: true, //是否允许发送Cookie
      allowMethods: ['GET', 'POST'], 
      allowHeaders: ['Content-Type', 'Authorization', 'Accept']
    }
  },
}

const env = process.env.NODE_ENV || 'development'
const Config = configs[`${env}`]

module.exports = {
  Config
}
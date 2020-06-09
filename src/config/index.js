
const config = {
  debug:{
    server_port:8000,
    secretOrKey:"tokenSecret",
    tokenExpireTime:60*60*24*7 //一周
  }
}

const env = 'debug'
module.exports = config[env]
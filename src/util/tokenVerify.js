const jwt = require('jsonwebtoken')
const config = require('../config')
const bcrypt = require('bcryptjs')
const models = require('../../sequelizeTool/models')
const CONSTANT = require('../constant/urls')

/**
 * 1.对url进行区分,只有signIn不处理token
 * 2.其他url进行token验证.
 */
const tokenVerify = async(ctx,next)=> {
  if(CONSTANT.URL_WITHOUT_TOKEN.indexOf(ctx.request.url) > -1){
    return next()
  }else{
    if (ctx.header && ctx.header.authorization) {
      const parts = ctx.header.authorization.split(' ')
      if (parts.length === 2) {
        //取出token
        const scheme = parts[0]
        const token = parts[1]
        if (/^Bearer$/i.test(scheme)) {
          try {
            //jwt.verify方法验证token是否有效
            const decoded = jwt.verify(token, config.secretOrKey)
            ctx.request.body.decodedInfo = decoded
            return next()
          } catch (error) {
            //token过期 生成新的token
            ctx.throw(401, 'token invalid')
          }
        }
      }
    }else{
      ctx.throw(401, 'token invalid')
    }
  }
}



module.exports = {
  tokenVerify
}

const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op
const CONSTANT = require('../constant/models')
const util = require('../util')
const bcrypt = require('bcryptjs')
const {Config} = require('../config')
const jwt = require("jsonwebtoken")
const Log = require('../logger')

const findAccountList = async()=>{
  const result = await models.user.findAndCountAll({
    include:[{
      model:models.authority,
      attributes:['code']
    }]
  })

  return result
}

const register = async(params)=>{
  const findResult = await models.user.findAndCountAll({
    where:{
      email:params.email
    }
  })

  if(findResult.count>0){
    return {
      msg:"邮箱已被占用"
    }
  }else{
    await createUser(params)
    return {
      msg:'成功注册'
    }
  }
}

const createUser = async(params)=>{
  const hashPW = util.generateHashPassword(params.password)
  const authorityObj = await models.authority.findOne({
    where:{
      code:params.authority
    }
  })
  await models.user.create({
    name:params.name,
    password:hashPW,
    email:params.email,
    authority_id:authorityObj.id
  })
}

const signIn = async(params) =>{
  //console.log(params)
  let status = '',msg='', pwComparedResult
  const findResult = await models.user.findAndCountAll({
    where:{
      email:params.email
    },
    include:[{
      model:models.authority
    }]
  })
  if(findResult.count === 0){
    return{
      status:'failed',
      msg:'该邮箱地址不存在'
    }
  }else{
    let userObj = findResult.rows[0]
    pwComparedResult = await bcrypt.compareSync(params.password,userObj.password)
    if(pwComparedResult){
      const payload = { 
        id: userObj.id,
        username:userObj.name,
        avatar:'',
        role:userObj.authority.code,
        email:params.email
      }
      const authToken = jwt.sign(payload,Config.secretOrKey,{expiresIn:Config.tokenExpireTime})
      Log.user.info(`Account:${payload.username}-Id:${payload.id} sign in`)
      return {
        status:'succeed',
        msg:'成功登陆',
        userInfo:payload,
        authToken
      }
    }else{
      return{
        status:'failed',
        msg:'密码错误'
      }
    }
  }
}

/**
 * 1.校验email和pw.如果提高难度,就从token decodedInfo里拿数据
 * 2.如果存在新pw
 *       做加密后一起更新
 *   不存在
 *        不更新pw
 * 3.返回状态.
 * 
 */
const editProfile = async(params)=>{
  let status = '',msg='', pwComparedResult
  const findResult = await models.user.findAndCountAll({
    where:{
      email:params.email
    }
  })
  if(findResult.count === 0){
    return{
      status:'failed',
      msg:'登录邮箱出错,请重新登录'
    }
  }else{
    let userObj = findResult.rows[0]
    pwComparedResult = await bcrypt.compareSync(params.password,userObj.password)
    if(pwComparedResult && params.new_password){
      const hashPW = util.generateHashPassword(params.new_password)
      const updatePayloadWithPw = {
        email:params.new_email,
        name:params.new_username,
        password:hashPW
      }
      await models.user.update(updatePayloadWithPw,{
        where:{
          email:params.email
        }
      })
      Log.user.info(`Account:${updatePayloadWithPw.name}-Id:${userObj.id} edit profile`)
      return {
        status:'succeed',
        msg:'已更新,请重新登录'
      }
    }else if(pwComparedResult && !params.new_password){
      const updatePayload = {
        email:params.new_email,
        name:params.new_username
      }
      await models.user.update(updatePayload,{
        where:{
          email:params.email
        }
      })
      Log.user.info(`Account:${updatePayload.name}-Id:${userObj.id} edit profile`)
      return {
        status:'succeed',
        msg:'已更新,请重新登录'
      }
    }else {
      return{
        status:'failed',
        msg:'登录密码错误,请重新输入'
      }
    }
  }

}
module.exports = {
  findAccountList,
  register,
  signIn,
  editProfile
}
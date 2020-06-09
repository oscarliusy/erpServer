const models = require('../../sequelizeTool/models')
const Op = models.Sequelize.Op
const CONSTANT = require('../constant/models')
const util = require('../util')
const bcrypt = require('bcryptjs')
const config = require('../config')
const jwt = require("jsonwebtoken")

const findAccountList = async()=>{
  const result = await models.Login_user.findAndCountAll({
    include:[{
      model:models.Authority,
      attributes:['code']
    }]
  })

  return result
}

const register = async(params)=>{
  const findResult = await models.Login_user.findAndCountAll({
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
  const authorityObj = await models.Authority.findOne({
    where:{
      code:params.authority
    }
  })
  await models.Login_user.create({
    name:params.name,
    password:hashPW,
    email:params.email,
    authority_id:authorityObj.id
  })
}

const signIn = async(params) =>{
  //console.log(params)
  let status = '',msg='', pwComparedResult
  const findResult = await models.Login_user.findAndCountAll({
    where:{
      email:params.email
    },
    include:[{
      model:models.Authority
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
        role:userObj.Authority.code
      }
      const authToken = jwt.sign(payload,config.secretOrKey,{expiresIn:config.tokenExpireTime})
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

module.exports = {
  findAccountList,
  register,
  signIn
}
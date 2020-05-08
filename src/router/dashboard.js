/*
1.没有获取真实的销售数据,仅使用模拟数据
2.主要用于测试前后端通信
*/
const Router = require('koa-router')
const router = new Router()

const saleList = [
  {
    "week": "第1周",
    "sale": 11075
  },
  {
    "week": "第2周",
    "sale": 10507
  },
  {
    "week": "第3周",
    "sale": 18473
  },
  {
    "week": "第4周",
    "sale": 19423
  },
  {
    "week": "第5周",
    "sale": 13428
  },
  {
    "week": "第6周",
    "sale": 16040
  },
  {
    "week": "第7周",
    "sale": 19313
  },
  {
    "week": "第8周",
    "sale": 15810
  },
  {
    "week": "第9周",
    "sale": 15759
  },
  {
    "week": "第10周",
    "sale": 18258
  }
]

router.post('/',async(ctx)=>{
  //console.log('dashboard',ctx.request.body)
  ctx.status = 200
  ctx.body = {
    code:200,
    errMsg:"",
    data:{
      instockAmount: 666,
      outstockAmount: 999,
      totalSales: 11111,
      returns: 55,
      saleList:saleList
    }
  }
})

module.exports = router
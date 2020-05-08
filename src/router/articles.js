const Router = require('koa-router')
const models = require('../../sequelizeTool/models')

const router = new Router()
const Op = models.Sequelize.Op

//查询全部-模糊查询-分页查询
router.get('/',async(ctx)=>{
  const currentPage = parseInt(ctx.query.currentPage) || 1
  const pageSize = parseInt(ctx.query.pageSize) || 2

  const where = {}
  const title = ctx.query.title

  if(title){
    where.title = {
      [Op.like]:'%' + title + '%'
    }
  }
  const result = await models.Article.findAndCountAll({
    order:[['id','DESC']] ,//ASC:正序  DESC:倒序
    where:where,
    offset:(currentPage - 1)*pageSize,
    limit:pageSize
  })
  ctx.status = 200
  ctx.body={
    articles:result.rows,
    pagination:{
      currentPage:currentPage,
      pageSize:pageSize,
      total:result.count
    }
  }
})

//增加
router.post('/',async(ctx)=>{
  const reqBody = ctx.request.body
  const articles = await models.Article.create(reqBody)
  ctx.status = 200
  ctx.body = {
    msg:{
      articles:articles
    }
  }
})

//按主键查询
router.get('/:id',async(ctx)=>{
  const id = ctx.params.id
  //const articles = await models.Article.findByPk(id)//按照主键查询
  const article = await models.Article.findOne({
    where:{id:id},
    include:[models.Comment]
  })
  ctx.status = 200
  ctx.body={
   article:article
  }
})

//按主键修改
router.put('/:id',async(ctx)=>{
  const articles = await models.Article.findByPk(ctx.params.id)
  articles.update(ctx.request.body)
  ctx.body={
    articles:articles
   }
})

//删除指定id数据
router.delete('/:id',async(ctx)=>{
  const articles = await models.Article.findByPk(ctx.params.id)
  articles.destroy()
  ctx.body={
    msg:'删除成功'
   }
})


module.exports = router
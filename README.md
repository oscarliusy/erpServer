# erpServer
# SPL ERP系统服务端
# 环境说明

# 技术栈
使用koa作为web服务框架
使用mysql作为数据库
使用koa-router定义路由规则
使用koa-bodyparser解析请求体
使用log4js记录日志
使用koa2-cors解决跨域
使用sequelize作为与mysql交互的ORM
使用cross-env解决windows下设置环境变量的bug

# sequelize
使用sequelize-auto生成model
sequelize-auto -h localhost -d erpdb -u root -x 123456 -p 3306 -t tableName -o sequelizeTool/models

使用sequelize-migration进行数据库升级(增减字段等)
成功后，在run.sh中使用npx sequelize-cli db:migrate --env production 进行生产环境的升级

# jenkins
自动部署后端
运行run.sh,调用package.json中的scripts "prd"
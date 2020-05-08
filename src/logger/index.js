const Log4js = require('log4js')
const Util = require('../util')

const LOG_DIR = `tmp/log`
const LOG_CONF = {
  //配置日志类别名和日志信息输出目的地 
  appenders: {
      stdout: {
          type: 'console' // 控制台输出
      },
      user: {
          type: 'dateFile',// 日期格式文件输出
          filename: `${LOG_DIR}/user.log`
      },
      req: {
          type: 'dateFile',
          filename: `${LOG_DIR}/req.log`
      },
      error: {
          type: 'dateFile',
          filename: `${LOG_DIR}/error.log`
      },
      debug: {
          type: 'dateFile',
          filename: `${LOG_DIR}/debug.log`
      },
      db: {
          type: 'dateFile',
          filename: `${LOG_DIR}/db.log`
      }
  },
  /**
   * 日志类别到类别定义的映射
     appenders:用于此类别的附加器名称列表,所有类别日志都通过console输出,并记录在对应file中
     level: 此类别发送到附加程序的最低级别  
            ALL <TRACE <DEBUG <INFO <WARN <ERROR<FATAL <MARK <OFF
   */
  categories: {
      default:{ appenders: ['stdout', 'debug'],   level: 'debug'},
      error:  { appenders: ['stdout', 'error'],   level: 'error'},
      req:    { appenders: ['stdout', 'req'],     level: 'info'},
      user:   { appenders: ['stdout', 'user'],    level: 'info'},
      db:     { appenders: ['stdout', 'db'],      level: 'info'}
  }
}

const init = () => {
  Util.mkDir(LOG_DIR);
  Log4js.configure(LOG_CONF)//配置
}

init();

module.exports = {
  user:   Log4js.getLogger('user'),
  error:  Log4js.getLogger('error'),
  req:    Log4js.getLogger('req'),
  db:     Log4js.getLogger('db'),
  debug:  Log4js.getLogger('default')
}
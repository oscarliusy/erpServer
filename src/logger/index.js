const Log4js = require('log4js')
const Util = require('../util')

const LOG_DIR = `tmp/log`
const LOG_CONF = {
  appenders: {
      stdout: {
          type: 'console'
      },
      user: {
          type: 'file',
          filename: `${LOG_DIR}/user.log`
      },
      req: {
          type: 'file',
          filename: `${LOG_DIR}/req.log`
      },
      error: {
          type: 'file',
          filename: `${LOG_DIR}/error.log`
      },
      db: {
          type: 'file',
          filename: `${LOG_DIR}/db.log`
      }
  },
  categories: {
      default:{appenders: ['stdout'],   level: 'debug'},
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
  db:     Log4js.getLogger('db')
}
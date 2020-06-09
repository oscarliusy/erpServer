const Fs = require('fs')
const bcrypt = require('bcryptjs')

//用于获取某个模块下各子模块的模块名
const getModules = (dir) => {
  let files = Fs.readdirSync(dir);
  let mods = files.filter( fn => !fn.match('index.js') && !fn.match('Index.js'));
  mods = mods.map( mod => mod.split('.')[0] );
  return mods;
}

const mkDir = (path) => {
  let list = path.split('/')
  let cur = '.'
  
  list.map(item => {
      cur += `/${item}`
      
      if (Fs.existsSync(cur)) {
          return
      }

      Fs.mkdirSync(cur)
  })
}

const generateHashPassword = (password)=> {
  var salt = bcrypt.genSaltSync(10)
  var hash = bcrypt.hashSync(password, salt)
  return hash;
}

module.exports = {
  getModules,
  mkDir,
  generateHashPassword
}
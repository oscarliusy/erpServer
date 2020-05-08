const Util= require('../util');
const Router = require('koa-router');
const Log = require('../logger');

const router = new Router();

router.prefix('/api');

const combine = () => {
    let mods = Util.getModules('src/router')
    mods.map( mod => {
        try {
            let cr = require('./' + mod);
            router.use(`/${mod}`, cr.routes(), cr.allowedMethods())
        }
        catch (e) {
            //等同于 Log4js.getLogger('default').debug.error('xxx') 向debug类别发出一个error级别的错误
            Log.debug.error(`load router module('${mod}') error \{${e}\}`);
            Log.debug.error(`${e.stack}`);  
            process.exit()
        }
    })
}

combine()

module.exports = router
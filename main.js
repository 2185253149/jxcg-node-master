process.env.NODE_ENV = process.argv[2].replace('-','')
const fs = require('fs')
let configPath = './config.' + process.env.NODE_ENV + '.js'
let config = require(fs.existsSync(configPath) ? configPath : './config.js');
let nm = require('./source')
//实体
nm.$.merge(config,require('./entity'))
//初始化
nm.init(config)
//设置路由
require('./router')(nm)
nm.server()
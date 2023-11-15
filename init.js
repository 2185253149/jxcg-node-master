const fs = require('fs')
let configPath = './config.development.js';
let config = require(fs.existsSync(configPath) ? configPath : './config.js');
let nm = require('./source')
//实体
nm.$.merge(config,require('./entity'))
//初始化
nm.init(config)
require('./source/init.js')(nm.models(), {
	id:'xx',
	java:{
		id:'com.xx',///应用ID
		datbase:'xx'///数据库名称
	},
	name:'xx',
	menus:[//初始化时超管后台菜单
		{name:'首页',url:'/pages/index/index'},
		{name:'系统设置',children:[
			{name:'权限管理',url:'/pages/group/list/list'},
			{name:'菜单管理',url:'/pages/menu/list/list'},
			{name:'用户管理',url:'/pages/user/list/list'}
		]},
	]
},models => {
})
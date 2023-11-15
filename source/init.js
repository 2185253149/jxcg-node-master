var $=require("./tool"),DB=require("./SQLHelper"),{toJava:toJava,toDart:toDart}=require("./ToEntity");module.exports=function(n,e,o){var r=[];for(var t in n)"models"!==t&&"config"!==t&&function(e){r.push(new Promise(function(o){DB.createTable(e,n[e].schemas,function(n){n.errorMsg&&console.log("创建表"+e+"失败!!!",n),o()})}))}(t);Promise.all(r).then(function(){return new Promise(function(o,r){var t={parentUnitId:0,level:1,unitId:e.id,name:e.name,authorzation:Config.authorzation};n.unit.list({unitId:e.id},function(r){r.length?o(e.id):n.unit.insert(t,function(n){n.errorMsg?(console.log(e.name+"创建失败!"+n.errorMsg),console.log(n)):(console.log(e.name+"创建成功!"),o(n.unitId))})})})}).then(function(r){Promise.all([new Promise(function(e,o){n.user.list({userName:"admin"},function(o){o.length?e(o[0].id):n.user.insert({photo:"/images/logo.png",unitId:r,name:"超级管理员",userName:"admin",nickName:"超级管理员",supplier:1},function(n){n.errorMsg?(console.log("超级管理员账号创建失败!"+n.errorMsg),console.log(n)):(console.log("超级管理员账号创建成功!"),e(n.id))})})}),new Promise(function(e,o){n.group.list({name:"超级管理员",unitId:r},o=>{o.length?e(o[0].id):n.group.insert({unitId:r,name:"超级管理员",sort:1,parentId:0,editAble:0},function(n){n.errorMsg?(console.log("超级管理员创建失败!"+n.errorMsg),console.log(n)):(console.log("超级管理员创建成功!"),e(n.id))})})})]).then(function(e){return new Promise(function(o,t){n.group_user.list({unitId:r,groupId:e[1],userId:e[0]},t=>{t.length?o(e[1]):n.group_user.insert({unitId:r,groupId:e[1],userId:e[0]},function(n){console.log("超级管理员用户关联群组成功"),o(e[1])})})})}).then(function(o){return new Promise(function(t,i){n.menu.list({},i=>{if(i.length)t();else{var l=e.menus;let i=[],g=100;for(let n=0;n<l.length;n++){let e=l[n],o=n+1;if(i.push({id:o,unitId:r,name:e.name,sort:g-n,level:1,url:e.url,parentId:0}),e.children&&e.children.length)for(let t=0;t<e.children.length;t++){let l=e.children[t];i.push({unitId:r,name:l.name,sort:g-n,level:2,url:l.url,parentId:o})}}for(var u=[],s=0;s<i.length;s++)!function(e){i[e].parentId=i[e].parentId||0,i[e].editAble=i[e].editAble||0,u[e]=new Promise(function(t,l){n.menu.insert(i[e],function(l){l.errorMsg?console.log(l):n.group_menu.insert({unitId:r,groupId:o,menuId:l.id},function(n){n.errorMsg&&console.log("创建后台菜单 "+i[e].name+" 失败"),t()})})})}(s);var a={};for(var c in a)for(s=0;s<a[c].length;s++)u.push(new Promise(function(){var e=a[c][s],o=c;e.unitId||(e.unitId=r),n[c].insert(e,function(n){n.errorMsg&&console.log("配置 "+o+" 失败",e),t()})}));Promise.all(u).then(function(){t()})}})})}).then(function(){if(console.log("数据库初始化完成!!!"),o&&o(n),e.java){for(let o in n)toJava(o,n[o].schemas,e.java,n[o]);console.log("构建Java实体类完成")}if(e.dart){for(let o in n)toDart(o,n[o].schemas,e.dart,n[o]);console.log("构建Dart实体类完成")}})})};
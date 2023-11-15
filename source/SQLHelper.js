const mysql=require("mysql");var pool;module.exports={connect(e,t){pool||(pool=mysql.createPool(Object.assign({connectionLimit:100,multipleStatements:!0,charset:"utf8mb4",supportBigNumbers:!0,bigNumberStrings:!0},Config.sql)));var r=this,i=0;pool.getConnection((o,n)=>{o?(console.log("connection connect err",o),3==i?"function"==typeof t&&t({errorMsg:"mysql connection connect err 3 times"}):(i++,"PROTOCOL_CONNECTION_LOST"!==o.code&&"PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"!==o.code&&"ETIMEDOUT"!==o.code||r.connect(e,t))):"function"==typeof e&&e(n)})},_eval(e,t,r){r=r||{},new Promise(e=>{r.connection?e(r.connection):this.connect(e,t)}).then(i=>{i.query(e,(o,n)=>{if(r.connection||pool.releaseConnection(i),o){var a=o.sqlMessage||o.code||"数据库未知错误";"function"==typeof t&&t({errorMsg:a}),console.log(`error sql:\n          ${e}\n          -------------------- \n          ${a}\n          `)}else r.logs&&console.log(e),"function"==typeof t&&t(n)})})},_evalSync(e,t){return new Promise(r=>{this._eval(e,r,t)})},reName:(e,t)=>(t||Config.sql.database)+"."+e,queryToWhere(e,t){var r="";function i(t,r){var i="",o=0;return r&&"object"==typeof r?(void 0!=r.$gt&&(i+=" AND "+e+"."+t+">"+r.$gt,o++),void 0!=r.$gte&&(i+=" AND "+e+"."+t+">="+r.$gte,o++),void 0!=r.$lt&&(i+=" AND "+e+"."+t+"<"+r.$lt,o++),void 0!=r.$lte&&(i+=" AND "+e+"."+t+"<="+r.$lte,o++),void 0!=r.$ne&&(i+=" AND "+e+"."+t+"<>"+("string"==typeof r.$ne?"'"+r.$ne+"'":r.$ne),o++),r.$in&&(r.$in=r.$in instanceof Array?"'"+r.$in.join("','")+"'":r.$in,i+=" AND "+e+"."+t+" IN ("+r.$in+")"),r.$regex&&(i+=" AND "+e+"."+t+" REGEXP '"+r.$regex+"'",o++)):"IS NOT NULL"==r||"ISNOTNULL"==r?(i+=" AND "+e+"."+t+" IS NOT NULL",o++):"IS NULL"==r||"ISNULL"==r?(i+=" AND "+e+"."+t+" IS NULL",o++):(i+=" AND "+e+"."+t+"="+("string"==typeof r?"'"+r+"'":r),o++),i=i.replace(" AND ",""),1===o?i:"("+i+")"}for(var o in t)if("pageNum"!=o&&"pageSize"!=o){var n=t[o];if("$or"===o){for(var a="",l=0;l<n.length;l++){var s="",c=0;for(var f in n[l])s+=" AND "+i(f,n[l][f]),c++;s=s.replace(" AND ",""),a+=1==c?" OR "+s:" OR ("+s+")"}r+=" AND ("+a.replace(" OR ","")+")"}else r+=" AND "+i(o,n)}return r&&"()"!=r?" WHERE "+r.replace(" AND ",""):""},projectionToRows(e,t){var r="";if(t)for(var i in t)r+=","+e+"."+i,"string"==typeof t[i]&&(r+=" AS "+t[i]);return r.replace(",","")||e+".*"},projectionToJoin(e,t,r){var i="",o="",n="";for(var a in t){a=t[a].id||a;var l=this.reName(t[a].name,r),s=t[a].projection;if(o+=" "+(t[a].type||"LEFT")+" JOIN "+l+" ON "+(t[a].base||e)+"."+a+"="+l+"."+(t[a].key||"id"),t[a].query){var c=this.queryToWhere(l,t[a].query).replace(" WHERE","");c&&(n+=" AND "+c)}if(s)for(var f in s)i+=","+l+"."+f,"string"==typeof s[f]&&(i+=" AS "+s[f]);else for(var f in s=Config.models[l])i+=","+l+"."+f,i+=" AS "+l+"_"+f}return[i,o,n]},find(e,t,r,i,o){i=i||{},e=this.reName(e,o);var n=this.projectionToJoin(e,i.join,o),a=this.queryToWhere(e,t);n[1]&&(a=n[1]+a),n[2]&&(a+=n[2]),this._eval("SELECT "+this.projectionToRows(e,i.projection)+n[0]+" FROM "+e+a+" LIMIT 1",e=>{e.errorMsg?"function"==typeof r&&r(e):"function"==typeof r&&r(e instanceof Array&&e.length>0?e[0]:{errorMsg:"未找到记录",nodata:!0})},i)},list(e,t,r,i,o){i=i||{},e=this.reName(e,o);var n=i.limit?" LIMIT "+i.limit+" OFFSET "+(i.skip||0):"",a="";if(i.sort){for(var l in i.sort)a+=" ,"+l+(-1===i.sort[l]?" DESC":"");a&&(a=" ORDER BY "+a.replace(" ,",""))}var s=this.projectionToJoin(e,i.join,o),c=this.queryToWhere(e,t);s[1]&&(c=s[1]+c),s[2]&&(c+=s[2]);var f=i.group?" GROUP BY "+i.group:"";if(t.pageNum||t.pageSize){t.pageSize=t.pageSize||10,t.pageNum=t.pageNum||1;var p="SELECT COUNT(*) AS total FROM "+e+c+f;n=" LIMIT "+t.pageSize+" OFFSET "+t.pageSize*(t.pageNum-1);var E="SELECT "+this.projectionToRows(e,i.projection)+s[0]+" FROM "+e+c+f+a+n;this._eval(E+";"+p,e=>{if("function"!=typeof r)throw e;r(e.errorMsg?e:{total:e[1]?e[1][0].total:0,rows:e[0]})},i)}else{var u="SELECT "+this.projectionToRows(e,i.projection)+s[0]+" FROM "+e+c+f+a+n;if("function"!=typeof r)return u;this._eval(u,r,i)}},functions:function(e,t,r,i,o,n){o=o||{},e=this.reName(e,n),(t=t||[{_id:"*",type:"count",as:""}])instanceof Array||(t=[t]);for(var a="",l=0;l<t.length;l++){var s="string"==typeof t[l]?{_id:"*",type:t[l]}:t[l];a+=s.type+"("+s._id+")"+(s.as?" AS "+s.as:"")}var c="";if(o.sort){for(var f in o.sort)c+=" ,"+f+(-1===o.sort[f]?" DESC":"");c&&(c=" ORDER BY "+c.replace(" ,",""))}var p=o.limit?" LIMIT "+o.limit+" OFFSET "+(o.skip||0):"",E=this.projectionToJoin(e,o.join,n),u=this.queryToWhere(e,i);E[1]&&(u=E[1]+u),E[2]&&(u+=E[2]);var T="SELECT "+a+" FROM "+e+u+(o.group?" GROUP BY "+o.group:"")+c+p;if("function"!=typeof r)return T;this._eval(T,r,o)},insert:function(e,t,r,i,o){i=i||{},e=this.reName(e,o);var n="",a="";for(var l in t)void 0!=t[l]&&null!=t[l]&&""!==t[l]&&(n+=","+l,a+=",'"+t[l]+"'");var s="INSERT INTO "+e+" ("+n.replace(",","")+") VALUES ("+a.replace(",","")+");";if("function"!=typeof r)return s;this._eval(s,r,i)},update:function(e,t,r,i,o,n){o=o||{},e=this.reName(e,n),o.multi=void 0==o.multi||o.multi;var a="";for(var l in r)""===r[l]?a+=","+l+"=null":a+=","+l+"='"+r[l]+"'";var s=o.limit?" LIMIT "+o.limit+" OFFSET "+(o.skip||0):"",c="SET SQL_SAFE_UPDATES = 0;UPDATE "+e+" SET "+a.replace(",","")+this.queryToWhere(e,t)+s+";SET SQL_SAFE_UPDATES = 1;";if("function"!=typeof i)return c;this._eval(c,i,o)},remove:function(e,t,r,i,o){i=i||{},e=this.reName(e,o);var n=i.limit?" LIMIT "+i.limit+" OFFSET "+(i.skip||0):"",a="SET SQL_SAFE_UPDATES = 0;DELETE FROM "+e+this.queryToWhere(e,t)+n+";SET SQL_SAFE_UPDATES = 1;";if("function"!=typeof r)return a;this._eval(a,r,i)},jsSave:function(e,t,r,i){this._eval("CREATE PROCEDURE "+e+t,r,i)},jsLoad:function(e,t,r){this._eval("CALL "+e,t,r)},dropIndex:function(e,t,r){let i=`SELECT CONCAT('ALTER TABLE _ZWF',i.TABLE_NAME,'ZWF_ DROP INDEX ',i.INDEX_NAME,' ;') AS dropSql\n    FROM INFORMATION_SCHEMA.STATISTICS i\n    WHERE TABLE_SCHEMA = '${r=r||Config.sql.database}' AND i.INDEX_NAME <> 'PRIMARY'`;i+=t?` AND i.TABLE_NAME = '${t}';`:";",this._eval(i,t=>{let i="";for(let e=0;e<t.length;e++)i+=t[e].dropSql.replace(/_ZWF(.+)ZWF_/,r+".$1");i?this._eval(i,e):e({})})},createTable:function(e,t,r,i){var o=this.reName(e,i),n={},a={};for(var l in t){if("title"==t[l].type)continue;var s=t[l].data_type||"";if("id"!=l||s||(s="BIGINT NOT NULL UNIQUE PRIMARY KEY"),t[l].rule=t[l].rule||{},!s){var c=t[l].rule.PositiveNum?"DOUBLE":t[l].rule.PositiveInt?"INT":"VARCHAR(255)";/sort|state|level|status/.test(l)||"switch"==t[l].type||t[l].attr&&"number"==t[l].attr.type?c="INT":"datetime"==t[l].type&&(c="BIGINT"),s+=c,t[l].rule.NotNull&&(s+=" NOT NULL")}/file|editor|table|form|mappolygon/.test(t[l].type)?s="LONGTEXT":/image/.test(t[l].type)&&t[l].attr&&t[l].attr.limit>2&&(s="LONGTEXT"),n[l]=l+" "+(s||"VARCHAR(255)"),t[l].unique&&(n[l]+=" UNIQUE"),t[l].defaultValue&&(/^[0-9]*$/.test(t[l].defaultValue)?n[l]+=" DEFAULT "+t[l].defaultValue:n[l]+=' DEFAULT "'+t[l].defaultValue+'"');let e=t[l].desc||t[l].label||"";if(e&&(n[l]+=' COMMENT "'+e+'"'),t[l].attr&&t[l].attr.actions){let r=[];for(let e=0;e<t[l].attr.actions.length;e++){let i=t[l].attr.actions[e];r.push(`${i.name}:${i.value}`)}r.length&&(e+=` ${r.join(",")}`)}if(t[l].index){let e="string"==typeof t[l].index?t[l].index:"IDX_"+l;a[e]||(a[e]=[]),a[e].push(l)}}this._eval("DESC "+o+";",t=>{var l="";if(t.errorMsg){for(var s in l+="CREATE TABLE "+o+"(",n)l+=","+n[s];for(var s in a)l+=",INDEX "+s+"("+a[s].join(",")+")";l=(l+=")").replace(",",""),this._eval(l,r)}else{var c={};l+="ALTER TABLE "+o+" ";for(var f=0;f<t.length;f++)c[t[f].Field]=t[f];for(var s in n)c[s]?"id"!=s&&(l+=",CHANGE COLUMN "+s+" "+n[s]):l+=",ADD COLUMN "+n[s];for(var s in a)l+=",ADD INDEX "+s+"("+a[s].join(",")+")";l=l.replace(",",""),this.dropIndex(e=>{this._eval(l,r)},e,i)}})}};
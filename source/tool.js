var a = {};a.string = function (s, o) {
  if (s == null || s == undefined) s = '';
  if(s && typeof s == 'object') s = JSON.stringify(s)
  s = new String(s);
  s.replaceAll = function (k, v) {
    return this.split(k).join(v);
  }
  s.fixInt = function(num){
    num = num || 2
    let pow = Math.pow(10,num)
    return parseInt(this * pow) / pow
  }
  s.max = function (n, r) {
    r = r || "...";
    var _this = this;
    _this = _this.length > n ? _this.substr(0, n - r.length) + r : _this;
    return _this;
  }
  s._eval = function (o, fn, finalFunction) {
    var _this = this;
    _this = _this.replace(new RegExp('{{', 'gmi'), '{').replace(new RegExp('}}', 'gmi'), '}');
    for (var k in o) {
      var v = o[k];
      v = v == undefined || v == null ? '' : v;
      _this = _this.replace(new RegExp("{()" + k + "}", "g"), v); //直接替换
      _this = _this.replace(new RegExp("{listStyle_" + k + "}", "g"), typeof v === "string" ? v.charAt(0) : "?"); //列表风格
      if (typeof fn == 'function') {
        _this = args(_this, k, v, o);
      }
    }
    if (typeof finalFunction == 'function') _this = finalFunction(_this, o);
    return _this;
  }
  s.dhms = function (type) {
    var _s = -(-s),
      rc = '';
    var oDay = parseInt(_s / (24 * 60 * 60));
    rc = oDay > 0 ? oDay + '天' : '';
    var oHours = parseInt(_s / (60 * 60) % 24);
    if (rc || oHours > 0) rc += oHours + '时';
    var oMinutes = parseInt(_s / 60 % 60);
    if (rc || oMinutes > 0) rc += oMinutes + '分';
    var oSeconds = parseInt(_s % 60);
    if (rc || oSeconds > 0) rc += oSeconds + '秒';
    if (type == 'Array') {
      rc = [oDay, oHours, oMinutes, oSeconds];
    } else if (type == 'Object') {
      rc = {
        d: oDay,
        h: oHours,
        m: oMinutes,
        s: oSeconds
      }
    }
    return rc;
  }
  s.Format = function () {
    var _this = this;
    for (var i = 0; i < arguments.length; i++) _this = _this.replace(/%(s|d)/, arguments[i] == undefined ? '' : arguments[i]);
    return _this;
  }
  s.parse = function (error, replace) {
    try {
      if (s) {
        if (typeof replace == 'function') s = replace(s);
        return JSON.parse(s);
      } else {
        return error || {};
      }
    } catch (e) {
      return error || {};
    }
  }
  s.urlParse = function (flog) {
    var query = {};
    var _query = decodeURIComponent(s).split(flog || '&');
    for (var i = 0; i < _query.length; i++) {
      _query[i] = _query[i].split('=');
      if(/^[0-9]+$/.test(_query[i][1])) _query[i][1] = -(-_query[i][1]);
      query[_query[i][0]] = _query[i][1] == undefined ? '' : _query[i][1];
    }
    return query;
  }
  if (o instanceof Array) {
    return s.Format.apply(s, o);
  } else if (o && typeof o == 'object') {
    return s._eval.call(s, o);
  } else {
    return s;
  }
}var fs = require('fs');
var https = require('https');
var http = require('http');
var request;
///下载文件
function downLoad(from,to,func){
  request = request || require('request');
  var writeStream = fs.createWriteStream(to);
  var readStream = request(from);
  readStream.pipe(writeStream);
  readStream.on('end', function() {
    
  });
  readStream.on('error', function(err) {
    console.log("错误信息:" + err);
    func({errorMsg:JSON.stringify(err)});
  })
  writeStream.on("finish", function() {
    writeStream.end();
    func({});
  });
}
///复制文件
function copyFile(from,to,replace,func,type){
  var pathArr = to.split('/'),file = pathArr[pathArr.length - 1];
  if(/\./.test(file)) pathArr.pop();
  var nowPath = '';
  for(var i = 0; i < pathArr.length; i ++){
    if(!pathArr[i]) continue;
    var p = nowPath ? '/' + pathArr[i] : (to.charAt(0) == '/' ? '/' + pathArr[i] : pathArr[i]);
    if (!fs.existsSync(nowPath + p)) fs.mkdirSync(nowPath + p);
    nowPath += p;
  }
  if(!/\./.test(file)) return false;
  var fromString = fs.readFileSync(from, type === false ? null : (type || 'utf-8'));
  if(typeof replace == 'object'){
    fromString = fileReplace(fromString,replace);
  }else if(typeof replace == 'function'){
    fromString = replace(fromString,from,to);
  }
  if(func) fromString = func(fromString);
  if(fromString == null || fromString == undefined) return;
  fs.writeFileSync(to, fromString);
}
///
function fileReplace(string,replace){
  if(typeof replace == 'function'){
    string = replace(string);
  }else if(replace && typeof replace == 'object'){
    for(var key in replace){
      switch(typeof replace[key]){
        case 'string':
          string = string.replace ? string.replace(new RegExp(key,'gmi'),replace[key]) : string;
          break;
        case 'function':
          string = replace[key](string,key);
          break;
        default:
          break;
      }
    }
  }
  return string;
}
///复制文件夹
function copyFolder(from,to,replace,func){
  if(!fs.existsSync(from)) return false;
  try{
    var files = fs.readdirSync(from);
    if(files && files.length){
      var pathArr = to.split('/'),file = pathArr[pathArr.length - 1];
      var nowPath = '';
      for(var i = 0; i < pathArr.length; i ++){
        if(!pathArr[i]) continue;
        var p = nowPath ? '/' + pathArr[i] : (to.charAt(0) == '/' ? '/' + pathArr[i] : pathArr[i]);
        if (!fs.existsSync(nowPath + p)) fs.mkdirSync(nowPath + p);
        nowPath += p;
      }
      for(var i = 0; i < files.length; i ++ ) {
        (function(i){
          if(files[i].indexOf('.') === -1){
            copyFolder(from + '/' + files[i],to + '/' + files[i],replace,func);
          }else{
            var type = /\.(text)|(js)|(css)|(html)|(json)|(wxml)|(wxss)|(axml)|(acss)$/.test(files[i]) ? 'utf-8' : undefined;
            var fromString = fs.readFileSync(from + '/' + files[i],type);
            if(typeof replace == 'object'){
              fromString = fileReplace(fromString,replace);
            }else if(typeof replace == 'function'){
              fromString = replace(fromString,from + '/' + files[i],to + '/' + files[i]);
            }
            if(func) fromString = func(fromString,from + '/' + files[i],to + '/' + files[i]);
            if(fromString == null || fromString == undefined) return;
            fs.writeFileSync(to + '/' + files[i], fromString);
          }
        })(i)
      }
    }
  }catch(e){
    console.log(from,to,e)
  }
}
///删除文件
function deleteFile(path) {
  if( fs.existsSync(path) ) fs.rmdirSync(path);
}
///删除文件夹
function deleteFolder(path) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
          deleteFolder(curPath);
      } else { // delete file
          fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
a.node = {
  downLoad,
  copyFile,
  fileReplace,
  copyFolder,
  deleteFile,
  deleteFolder,
  proxy:function(options){
    if(Config.proxy){
      if(typeof options == 'string'){
        for(let key in Config.proxy){
          options = options.replace(key,Config.proxy[key])
        }
      }else if(options.url){
        for(let key in Config.proxy){
          options.url = options.url.replace(key,Config.proxy[key])
        }
      }
    }
    return options;
  },
  get:function(url,next,dataType){
    url = this.proxy(url)
    dataType = dataType || 'json';
    (url.indexOf('https://') == 0 ? https : http).get(url, function(response){
        var data = '';
        response.on('data', function(chunk){
            data += chunk;
        });
        response.on('end', function(){
          next(dataType == 'json' ? JSON.parse(data) : data);
          data = '';
        })
    })
  },
  // ajax:function(options,bodyString,next){
  //   options = this.proxy(options);
  //   bodyString = typeof bodyString == 'string' ? bodyString : JSON.stringify(bodyString);
  //   options.dataType = options.dataType || 'json';
  //   var _options = {
  //     hostname: options.hostname,
  //     port: options.port || 443,
  //     path: options.path,
  //     method: options.method || 'POST',
  //     headers: options.headers || {
  //         'Content-Type': options.contentType || 'application/json',
  //         'Content-Length': bodyString.length
  //       }
  //   };
  //   var req = (_options.port == 443 ? https : http).request(_options, function(response){
  //     response.setEncoding(options.encoding || 'utf8');
  //     var data = '';
  //     response.on('data', function(d){
  //       data += d;
  //     });
  //     response.on('end', function(){
  //       try{
  //         data = decodeURIComponent(data)
  //         next(options.dataType == 'json' ? JSON.parse(data) : data);
  //       }catch(e){
  //         next(data);
  //       }
  //     })
  //   });
  //   req.on('error', function(err){
  //     next({errorMsg:err.errno});
  //   });
  //   req.write(bodyString);
  //   req.end();
  // },
  fetch(options){
    options = this.proxy(options)
    request = request || require('request');
    return new Promise(next => {
      if(typeof options == 'string'){
        this.get(options,next)
      }else{
        options.dataType = options.dataType || 'json'
        request({
          url: options.url,
          method: options.method || 'POST',
          headers: options.headers || {},
          body: typeof options.data == 'string' ? options.data : JSON.stringify(options.data) 
        }, function (err, response, ret) {
          if(err){
            next({errorMsg:err.toString()})
          }else{
            next(typeof ret == 'string' && options.dataType == 'json' ? JSON.parse(ret) : ret)
          }
        })
      }
    })
  },
  buildXML:function(json){
    var xml2js = require('xml2js');
    var builder = new xml2js.Builder();
    return builder.buildObject(json);
  },
  parseXML:function(xml, fn){
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser({ trim:true, explicitArray:false, explicitRoot:false });
    parser.parseString(xml, fn||function(err, result){});
  },
  parseRaw:function(){
    return function(req, res, next){
      var buffer = [];
      req.on('data', function(trunk){
        buffer.push(trunk);
      });
      req.on('end', function(){
        req.rawbody = Buffer.concat(buffer).toString('utf8');
        next();
      });
      req.on('error', function(err){
        next(err);
      });
    }
  },
  pipe:function(stream, fn){
    var buffers = [];
    stream.on('data', function (trunk) {
      buffers.push(trunk);
    });
    stream.on('end', function () {
      fn(null, Buffer.concat(buffers));
    });
    stream.once('error', fn);
  },
  mix:function(){
    var root = arguments[0];
    if (arguments.length==1) { return root; }
    for (var i=1; i<arguments.length; i++) {
      for(var k in arguments[i]) {
        root[k] = arguments[i][k];
      }
    }
    return root;
  },
  generateNonceString:function(length){
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var noceStr = "";
    for (var i = 0; i < (length || 32); i++) {
      noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
  }
}a.date = function(sysData){
    function init(sysData){
        sysData = sysData || new Date();
        sysData = /^\d|-+$/.test(sysData) ? new Date(-(-sysData)) : sysData;
        if(typeof sysData == 'number') sysData = new Date(-(-sysData));
        sysData.unix = Math.round(sysData.getTime() / 1000);
        sysData.Format = function(fmt){
            fmt = fmt || 'yyyy-MM-dd hh:mm:ss';
            var o = {
                "M+": sysData.getMonth() + 1, //月份 
                "d+": sysData.getDate(), //日 
                "h+": sysData.getHours(), //小时 
                "m+": sysData.getMinutes(), //分 
                "s+": sysData.getSeconds(), //秒 
                "q+": Math.floor((sysData.getMonth() + 3) / 3), //季度 
                "S": sysData.getMilliseconds() //毫秒 
            };
            fmt = fmt.replace(/(y+)/,function($0,$1){
                return (sysData.getFullYear() + "").substr(4 - $1.length);
            })
            for (var k in o) {
                fmt = fmt.replace(new RegExp("(" + k + ")"), function($0,$1){
                    return ($1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length));
                });
            }
            return fmt;
        }
        sysData.prev = function(ms){
            ms = ms || 1000 * 60 * 60 * 24;
            return init(sysData.getTime() - ms);
        }
        sysData.parse = function(d,type){
            var day = [],time = [];
            switch(type){
                case 'date':
                    day = d.split('-');
                    break;
                case 'time':
                    time = d.split(':');
                    break;
                default:
                    d = d.split(' ');
                    day = d[0].split('-'),time = d[1].split(':');
                    break;
            }
            if(day[0]) sysData.setFullYear(day[0]);
            if(day[1]) sysData.setMonth(day[1] - 1);
            if(day[2]) sysData.setDate(day[2]);
            if(time[0]) sysData.setHours(time[0]);
            if(time[1]) sysData.setMinutes(time[1]);
            if(time[2]) sysData.setSeconds(time[2]);
            return sysData;
        }
        sysData.contDown = function(d){
            d = d.split(' ');
            var day = d[0].split('-'),time = d[1].split(':'),end = new Date();
            end.setFullYear(day[0],day[1] - 1,day[2]);
            end.setHours(time[0]);
            end.setMinutes(time[1]);
            end.setSeconds(time[2]);
            var countDown = parseInt((end.getTime() - sysData.getTime()) / 1000),countDownString = '';
            var dayNum = 24 * 60 * 60 * 1000, hoursNum = 60 * 60 * 1000, miniteNum = 60 * 1000;
            var day = Math.floor(countDown / dayNum);
            if(day > 0) countDownString = day + '天';
            countDown = countDown % dayNum;
            var hours = Math.floor(countDown / hoursNum);
            if (hours > 0) countDownString += hours + '时';
            countDown = countDown % hoursNum;
            var minite = Math.floor(countDown / miniteNum);
            if (minite > 0) countDownString += minite + '分';
            countDown = countDown % miniteNum;
            var second = Math.floor(countDown / 1000);
            if (second > 0) countDownString += second + '秒';
            return countDownString;
        }
        sysData.only = function(){
            var n = this.getTime().toString();
            n = -(-n.substr((n.length - 10),9));
            return n;
        }
        sysData.age = function(y,m,d){
            var age = 0;
            age = this.getFullYear() - y;
            if(this.getMonth() + 1 > m){
                age ++;
            }else if(this.getMonth() + 1 == m){
                if(this.getDate() >= d){
                    age ++;
                }
            }
            return age;
        }
        sysData.weekDay = function(){
            return ['日','一','二','三','四','五','六'][this.getDay()];
        }
        sysData.toLocalString = function(){
            return this.Format('yyyy-MM-dd hh:mm:ss');
        }
        return sysData;
    }
    return init(sysData);
}a.guid = function(s){
    s = s || '';
    return ('xxxxxxxx' + s + 'xxxx' + s + '4xxx' + s + 'yxxx' + s + 'xxxxxxxxxxxx').replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}a.Storage = {
    state:{},
    config:{},
    localStorage:(function(){try{return sessionStorage;}catch(e){return null}})(),
    setLocalStorage:function(storage){
        if(storage && storage.setItem && storage.getItem && storage.removeItem){
            this.localStorage = storage;
        }
    },
    init:function(key,next){
        var config = {type:0};
        if(typeof next == 'function') {
            config.type = 1;
        }else if(typeof next == 'object' && next.type){
            config = next;
        }else if(typeof next == 'number'){
            config = {type:next};
        }
        if(!this.config[key]) this.config[key] = config;
    },
    set:function(key,value,next){
        this.init(key,next);
        if(this.config[key].type == 1 && this.localStorage) {
            this.localStorage.setItem(key,typeof value === 'string' ? value : JSON.stringify(value),next);
            //if(this.config[key].expires) this.localStorage.setItem(key + '_expires',new Date().getTime() + '_' + this.config[key].expires);
            return false;
        }
        this.state[key] = value;
    },
    get:function(key,next){
        this.init(key,next);
        if(this.config[key].type == 1 && this.localStorage){
            return this.localStorage.getItem(key,next);
        }else{
            return this.state[key];
        }
    },
    remove:function(key,next){
        this.init(key,next);
        if(this.config[key].type == 1 && this.localStorage){
            this.localStorage.removeItem(key,next);
        }else{
            this.state[key] = undefined;
            delete this.state[key];
            this.config[key] = undefined;
            delete this.config[key];
        }
    },
    clear:function(type,next){
        if(type == 1 && this.localStorage && this.localStorage.clear){
            this.localStorage.clear(next);
        }else if(type == undefined){
            this.state = {};
            this.config = {};
        }else{
            for(var key in this.config){
                if(this.config[key].type == type){
                    this.state[key] = undefined;
                    delete this.state[key];
                }
            }
        }
        // for(var key in this.config){
        //     if(this.config[key].type == type){
        //         this.config[key] = undefined;
        //         delete this.config[key];
        //     }
        // }
    }
}a.MD5 = function(instring){
    var hexcase = 0;
    var b64pad  = "";
    function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
    function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
    function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
    function hex_hmac_md5(k, d)
    { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
    function b64_hmac_md5(k, d)
    { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
    function any_hmac_md5(k, d, e)
    { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }
    function md5_vm_test()
    {
        return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
    }
    function rstr_md5(s)
    {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }
    function rstr_hmac_md5(key, data)
    {
        var bkey = rstr2binl(key);
        if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

        var ipad = Array(16), opad = Array(16);
        for(var i = 0; i < 16; i++)
        {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }
    function rstr2hex(input)
    {
        try { hexcase } catch(e) { hexcase=0; }
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var output = "";
        var x;
        for(var i = 0; i < input.length; i++)
        {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F)
                +  hex_tab.charAt( x        & 0x0F);
        }
        return output;
    }
    function rstr2b64(input)
    {
        try { b64pad } catch(e) { b64pad=''; }
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var output = "";
        var len = input.length;
        for(var i = 0; i < len; i += 3)
        {
            var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
            for(var j = 0; j < 4; j++)
            {
                if(i * 8 + j * 6 > input.length * 8) output += b64pad;
                else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
            }
        }
        return output;
    }
    function rstr2any(input, encoding)
    {
        var divisor = encoding.length;
        var i, j, q, x, quotient;

        /* Convert to an array of 16-bit big-endian values, forming the dividend */
        var dividend = Array(Math.ceil(input.length / 2));
        for(i = 0; i < dividend.length; i++)
        {
            dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
        }
        var full_length = Math.ceil(input.length * 8 /
            (Math.log(encoding.length) / Math.log(2)));
        var remainders = Array(full_length);
        for(j = 0; j < full_length; j++)
        {
            quotient = Array();
            x = 0;
            for(i = 0; i < dividend.length; i++)
            {
                x = (x << 16) + dividend[i];
                q = Math.floor(x / divisor);
                x -= q * divisor;
                if(quotient.length > 0 || q > 0)
                    quotient[quotient.length] = q;
            }
            remainders[j] = x;
            dividend = quotient;
        }

        /* Convert the remainders to the output string */
        var output = "";
        for(i = remainders.length - 1; i >= 0; i--)
            output += encoding.charAt(remainders[i]);

        return output;
    }
    function str2rstr_utf8(input)
    {
        var output = "";
        var i = -1;
        var x, y;

        while(++i < input.length)
        {
            /* Decode utf-16 surrogate pairs */
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
            {
                x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                i++;
            }

            /* Encode output as utf-8 */
            if(x <= 0x7F)
                output += String.fromCharCode(x);
            else if(x <= 0x7FF)
                output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                    0x80 | ( x         & 0x3F));
            else if(x <= 0xFFFF)
                output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                    0x80 | ((x >>> 6 ) & 0x3F),
                    0x80 | ( x         & 0x3F));
            else if(x <= 0x1FFFFF)
                output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                    0x80 | ((x >>> 12) & 0x3F),
                    0x80 | ((x >>> 6 ) & 0x3F),
                    0x80 | ( x         & 0x3F));
        }
        return output;
    }
    function str2rstr_utf16le(input)
    {
        var output = "";
        for(var i = 0; i < input.length; i++)
            output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                (input.charCodeAt(i) >>> 8) & 0xFF);
        return output;
    }

    function str2rstr_utf16be(input)
    {
        var output = "";
        for(var i = 0; i < input.length; i++)
            output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                input.charCodeAt(i)        & 0xFF);
        return output;
    }
    function rstr2binl(input)
    {
        var output = Array(input.length >> 2);
        for(var i = 0; i < output.length; i++)
            output[i] = 0;
        for(var i = 0; i < input.length * 8; i += 8)
            output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
        return output;
    }
    function binl2rstr(input)
    {
        var output = "";
        for(var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
        return output;
    }
    function binl_md5(x, len)
    {
        x[len >> 5] |= 0x80 << ((len) % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var a =  1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d =  271733878;

        for(var i = 0; i < x.length; i += 16)
        {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
    }
    function md5_cmn(q, a, b, x, s, t)
    {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
    }
    function md5_ff(a, b, c, d, x, s, t)
    {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t)
    {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t)
    {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t)
    {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }
    function safe_add(x, y)
    {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    function bit_rol(num, cnt)
    {
        return (num << cnt) | (num >>> (32 - cnt));
    }
    return hex_md5(instring);
}a.Base64 = function () {
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var scretKey = 'YXRvYmRlY29kZVVSSUNvbXBvbmVudA=='
    this.encodeURI = function (s) {
        try {
            s = btoa(encodeURIComponent(s))
        } catch (e) {
            s = this.encode(encodeURIComponent(s))
            // return 'YXRvYmRlY29kZVVSSUNvbXBvbmVudA==' + Buffer.from(encodeURIComponent(s), 'utf-8').toString('base64')
        }
        let random = parseInt(Math.random() * (s.length - 1))
        s = s.slice(0,random) + scretKey + s.slice(random,s.length)
        return s
    }
    this.canDecode = function (s) {
        return typeof s == 'string' && s.indexOf(scretKey) > -1
    }
    this.decodeURI = function (s) {
        // return decodeURIComponent(this.decode(s.replace(scretKey, '')))
        try {
            return decodeURIComponent(atob(s.replace(scretKey, '')))
        } catch (e) {
            // return decodeURIComponent(Buffer.from(s.replace(scretKey, ''), 'base64').toString('utf8'))
            return decodeURIComponent(this.decode(s.replace(scretKey, '')))
        }
    }
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }

    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }

    var _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utfText += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }

    // private method for UTF-8 decoding  
    var _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c1 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
                i += 2;
            } else {
                c1 = utftext.charCodeAt(i + 1);
                c2 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                i += 3;
            }
        }
        return string;
    }
}  //队列
a.Item = function(args){
    var _this = this;
    args = args || {};
    this.typeOf = 'Item';
    this.item = [];
    this.length = 0;
    this.flog = 0;
    this.max = args.max || 1;
    this.actionLength = 0;
    this.begined = false;
    this._push = function (fn,index) {
      if(index != undefined && this.length){
        this.item.splice(this.flog + index,0,fn);
      }else{
        this.item.push(fn);
      }
      this.length++;
      if (this.begined && this.actionLength < this.max) this._do();
    }
    this.value = undefined;
    this._do = function () {
      if(!this.begined) this.begined = true;
      if(this.length == 0) return false;
      this.actionLength++;
      this.length--;
      this.item[this.flog](function (value) {
        setTimeout(function(){
          _this.value = value;
          _this.actionLength--;
          if (_this.length > 0) _this._do();
        },100)
      },_this.value);
      this.item[this.flog] = null;
      this.flog++;
    }
}a.Verify = {
  Name: function (b) { //姓名等一般字符
    return [/^([\u2E80-\u9FFF]|\w|-|\(|\))*$/.test(b), '存在特殊字符'];
  },
  NoSpecial: function (b) {
    return [!/~|\^/.test(b), '存在非法字符'];
  },
  Phone: function (t) { //手机号码
    return [/^1\d{10}$/.test(t), '格式错误'];
  },
  IDCard: function (t) { //身份证号码
    if(!t) return [false,'为空']
    var s = t.length,
      b, i, w, m, d;
    if (s === 15) {
      b = t.match(/^(?:\d{6})(\d{2})(\d{2})(\d{2})(?:\d{3})$/);
      if (!b) {
        return [false, '格式错误'];
      }
      i = parseInt("19" + b[1], 10);
      w = parseInt(b[2], 10);
      m = parseInt(b[3], 10);
      d = t.charAt(s - 1) % 2
    } else {
      if (s === 18) {
        var u = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
          y = "10X98765432";
        for (var v = 0, c = 0; v < 17; v++) {
          c += t.charAt(v) * u[v]
        }
        if (y.charAt(c % 11) !== t.charAt(17).toUpperCase()) {
          return [false, '格式错误'];
        }
        b = t.match(/^(?:\d{6})(\d{4})(\d{2})(\d{2})(?:\d{3})(?:[0-9]|X)$/i);
        if (!b) {
          return [false, '格式错误'];
        }
        i = parseInt(b[1], 10);
        w = parseInt(b[2], 10);
        m = parseInt(b[3], 10);
        d = t.charAt(s - 2) % 2
      }
    }
    var x = new Date(i, w - 1, m);
    if (i !== x.getFullYear() || w !== x.getMonth() + 1 || m !== x.getDate()) {
      return [false, '格式错误'];
    }
    return [
      [i + (w < 10 ? "-0" : "-") + w + (m < 10 ? "-0" : "-") + m, i, w, m], '格式错误'
    ];
  },
  Email: function (t) { //邮箱
    return [/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(t), '格式错误'];
  },
  Date: function (b) { //日期
    return [/^\d{4}(-\d{1,2}(-\d{1,2})?)?$/.test(b), '格式错误'];
  },
  PositiveNum: function (n) { //正数 > 0
    return [/^\d+\.?\d*$/.test(n), '必须为正数'];
  },
  PositiveInt: function (n) { //正整数
    return [/^\d+$/.test(n), '必须为正整数'];
  },
  NotNull: function (b) { //不能为空
    if(typeof b == 'string') b = b.trim();
    return [!(b == null || b == undefined || b === ''), '不能为空'];
  },
  MaxLength: function (b, n) { //最大长度
    return [b.length <= n, '最大长度为' + n];
  },
  MinLength: function (b, n) {
    return [b.length >= n, '最小长度为' + n];
  },
  MaxNumber: function (b, n) {
    return [b <= n, '最大值为' + n];
  },
  MinNumber: function (b, n) {
    return [b >= n, '最小值为' + n];
  },
  Regx: function (s, r) {
    r = r.split('_gmi_');
    return [new RegExp(r[0], r[1]).test(s), r[2] || '格式错误'];
  },
  Function: function (s, fn) {
    return fn(s);
  },
  Rules: function (value, rules, msg) {
    msg = msg || {};
    rules = rules || {};
    var err = [];
    if (!rules.NotNull && !this.NotNull(value)[0]) {
      //无需验证为空 但为空的情况
    } else {
      for (var k in rules) {
        var _rule = rules[k];
        if (_rule != false) {
          var v = this[k](value, _rule);
          if (!v[0]) {
            err.push(typeof msg[k] == 'string' ? msg[k] : v[1]);
            break;
          }
        }
      }
    }
    return [err.length == 0, err.join(',')];
  },
  ComponentsData: function (data, components, eachFunction) {
    var err = [];
    for (var i = 0; i < components.length; i++) {
      if (components[i].rule) {
        var v = this.Rules(data[components[i].id], components[i].rule);
        if (typeof eachFunction == 'function') eachFunction.call(components[i], v);
        if (!v[0]) err.push(components[i].label + v[1]);
      }
    }
    return [err.length == 0, err.join(',')];
  }
}a.clone = function(obj,JSONMeth){
	function clon(p){
	if(!p || typeof p !== "object") return p;
    if(JSONMeth && JSON){
      return JSON.parse(JSON.stringify(p));
    }else{
			var o = {};
			if(p.constructor === Array){
				o = [];
				for(var i = 0; i < p.length; i ++) o[i] = typeof p[i] !== "object" ? p[i] : (!p[i] ? p[i] : clon(p[i]));
			}else{
				for(var key in p) o[key] = typeof p[key] !== "object" ? p[key] : (!p[key] ? p[key] : clon(p[key]));
			}
      return o;
    }
	}
	return clon(obj);
}a.SQLite = function(data,args){
    data = data || [],args = args || {};
    function forEach(query,fn,args){
        query = query || {},args = args || {};
        for(var i = 0; i < data.length; i ++){
            var isQuery = true;
            for(var k in query) {
                if(/_|pageSize|pageNum/.test(k)) continue;
                if(data[i] === undefined || query[k] != data[i][k]) isQuery = false;
            }
            if(isQuery) {
                fn(data[i],i);
                if(args.findOne) break;
            }
        }
    }
    this.find = function(query,fn,args){
        args = args || {};
        var rc = [];
        var index = 0;
        forEach(query,function(res,i){
            res._id = i;
            res.index = index;
            index ++;
            rc.push(args.filter ? args.filter(res) : a.clone(res,args.cloneType));
        },args)
        if(args.sortFn) rc.sort(args.sortFn);
        if(args.pageNum){
            var pageSize = args.pageSize || 10,pageNum = args.pageNum || 1,min = pageSize * (pageNum - 1),max = pageNum * pageSize - 1,rows = [];
            for(var i = 0; i < rc.length; i ++) if(i >= min && i <= max) rows.push(rc[i]);
            if(typeof fn == 'function'){
                fn({pageSize:pageSize,pageNum:pageNum,rows:rows,total:rc.length});
            }else{
                return {pageSize:pageSize,pageNum:pageNum,rows:rows,total:rc.length};
            }
        }else{
            if(typeof fn == 'function'){
                fn(rc);
            }else{
                return rc;
            }
        }
    }
    this.insert = function(_data,fn){
        _data = _data || {};
        data.push(_data);
    }
    this.update = function(query,_data,fn,args){
        _data = _data || {};
        var isOk = false;
        forEach(query,function(res,i){
            for(var k in _data){
                res[k] = _data[k];
            }
            data[i] = res;
            isOk = true;
        },args)
        if(typeof fn == 'function'){
            fn(isOk);
        }else{
            return isOk;
        }
    }
    this.remove = function(query,fn,args){
        var isOk = false;
        forEach(query,function(res,i){
            data[i] = undefined;
            isOk = true;
        },args)
        if(typeof fn == 'function'){
            fn(isOk);
        }else{
            return isOk;
        }
    }
}a.toolVerify = (function(params){
    setTimeout(function(){
        if(a.Version){
        	if(a.Version.authorize && new Date().getTime() - a.Version.createTime > a.Version.authorize) a = null;
        }else{
        	a = null;
        }
    },1000 * 10)
})()a.merge = function(a,b){
    var c = false,changes = {};
    function _merge(a,b,changes){
        if(a && b && typeof a === 'object' && typeof b === 'object'){
            if(a instanceof Array && b instanceof Array){
                a.splice(0,a.length);
                for(var i = 0; i < b.length; i ++) a.push(b[i]);
            }else{
                for(var key in b){
                    if(a[key] && b[key] && typeof a[key] === 'object' && typeof b[key] === 'object') {
                        changes[key] = {};
                        _merge(a[key],b[key],changes[key]);
                    }else{
                        a[key] = b[key];
                        changes[key] = true;
                    }
                }
            }
        }else{
            console.err('typeof arguments must be object and not null',a,b);
        }
    }
    _merge(a,b,changes);
    return a;
}a.Vnode = (function(){
  function _Vnode(tagName,args){
    args = args || {};
    this.parentNode = null;
    this.childNodes = [];
    this.nextSibling = null;
    this.firstChild = null;
    this.lastChild = null;
    this._id_ = a.zIndex();
    this.attributes = {};
    this.tagName = tagName;
    this.nodeType = 1;
    this.nodeValue = null;
    for(var key in args) this[key] = args[key];
    this.getAttribute = function(name){
      return this.attributes[name];
    }
    this.setAttribute = function(name,value){
      this.attributes[name] = value;
    }
    this.removeAttribute = function(name){
      var attributes = {};
      for(var key in this.attributes) if(key != name) attributes[key] = this.attributes[key];
      this.attributes = attributes;
    }
    this.events = {};
    this.addEventListener = function(type,func,useCapture){
      if(!this.events[type]) this.events[type] = {};
      var name = func.toString().match(/^function\s*([\S]*)\(/)[1] || 'default';
      this.events[type][name] = {func:func,useCapture:useCapture};
    }
    this.removeEventListener = function(type,func){
      if(this.events[type]){
        if(!func) {
          this.events[type] = null;
        }else{
          var name = func.toString().match(/^function\s*([\S]*)\(/)[1];
          if(name && this.events[type][name]) this.events[type][name] = null;
        }
      }
    }
    this.attributesToString = function(){
      if(this.nodeType === 3){
        return this.nodeValue;
      }else{
        var rc = '<' + this.tagName + ' ';
        for(var key in this.attributes) {
          if(this.attributes[key] != undefined) {
            if(this.attributes[key] === true){
              rc += key + ' ';
            }else{
              rc += key + '="' + this.attributes[key] + '" ';
            }
          }
        }
        return rc.replace(/ $/,'') + '>';
      }
    }
    this.toString = function(before){
      if(typeof before == 'function') before.call(this);
      if(this.nodeType === 3){
        return this.nodeValue;
      }else{
        var innerHTML = '';
        for(var i = 0; i < this.childNodes.length; i ++) innerHTML += this.childNodes[i].toString(before);
        return this.attributesToString() + innerHTML + '</' + this.tagName + '>';
      }
    }
    this.appendChild = function(vnode){
      if(vnode.parentNode) vnode.parentNode.removeChild(vnode);
      vnode.parentNode = this;
      var prev = this.childNodes[this.childNodes.length - 1];
      if(prev) prev.nextSibling = vnode;
      vnode.previousSibling = prev;
      vnode.nextSibling = null;
      this.childNodes.push(vnode);
      if(this.childNodes.length == 1) this.firstChild = vnode;
      this.lastChild = vnode;
    }
    this.removeChild = function(vnode){
      var index = null;
      for(var i = 0; i < this.childNodes.length; i ++) if(this.childNodes[i]._id_ == vnode._id_) index = i;
      if(index >= 0){
        if(vnode.previousSibling) vnode.previousSibling.nextSibling = vnode.nextSibling;
        if(vnode.nextSibling) vnode.nextSibling.previousSibling = vnode.previousSibling;
        this.childNodes.splice(index,1);
        vnode.parentNode = null;
        vnode.nextSibling = null;
        vnode.previousSibling = null;
      }
    }
    this.insertBefore = function(vnode,existingvnode){
      if(!existingvnode){
        this.appendChild(vnode);
      }else{
        var index = null;
        for(var i = 0; i < this.childNodes.length; i ++) if(this.childNodes[i]._id_ == existingvnode._id_) index = i;
        if(index >= 0){
          if(vnode.parentNode) vnode.parentNode.removeChild(vnode);
          if(existingvnode.previousSibling){
            existingvnode.previousSibling.nextSibling = vnode;
            vnode.previousSibling = existingvnode.previousSibling;
          }
          vnode.nextSibling = existingvnode;
          existingvnode.previousSibling = vnode;
          vnode.parentNode = this;
          this.childNodes.splice(index,0,vnode);
        }
      }
    }
    this.replaceChild = function(newVnode,oldVnode){
      this.insertBefore(newVnode,oldVnode);
      this.removeChild(oldVnode);
    }
    this.vnodeTree = function(){
      var rc = {
        attributes:this.attributes,
        tagName:this.tagName,
        nodeType:this.nodeType,
        nodeValue:this.nodeValue,
        childNodes:[]
      }
      for(var i = 0; i < this.childNodes.length; i ++) rc.childNodes.push(this.childNodes[i].vnodeTree());
      return rc;
    }
    this.cloneNode = function(deep){
      return _Vnode.parseVnodeTree(this.vnodeTree());
    }
  }
  _Vnode.parseVnodeTree = function(obj){
    var rc = new _Vnode(obj.tagName);
    rc.attributes = obj.attributes;
    rc.tagName = obj.tagName;
    rc.nodeType = obj.nodeType;
    rc.nodeValue = obj.nodeValue;
    rc.childNodes = [];
    var previousSibling = null;
    for(var i = 0; i < obj.childNodes.length; i ++){
      var childNode = _Vnode.parseVnodeTree(obj.childNodes[i]);
      if(previousSibling) previousSibling.nextSibling = childNode;
      if(i == 0) rc.firstChild = childNode;
      if(i == obj.childNodes.length - 1) rc.lastChild = childNode;
      childNode.parentNode = rc;
      childNode.previousSibling = previousSibling;
      rc.childNodes.push(childNode);
      previousSibling = childNode;
    }
    return rc;
  }
  _Vnode.parseXml = function(xml,args){
    var i = 0;
    var prev = '',word = '',current,vnode;
    var building = false;
    var state = {
      tagNameing:false,//开始标签
      attrNameing:false,//属性名称
      attrValueing:false//属性值
    }
    function state_to(name){
      if(!name) {
        building = false;
        for(var key in state) state[key] = false;
      }else{
        building = true;
        for(var key in state) state[key] = (key === name);
      }
    }
    function buildNode(tagName){
      var node = new _Vnode(tagName);
      if(!current) {
        vnode = node;
      }else{
        current.appendChild(node);
      }
      current = node;
      word = '';
      state_to('attrNameing');
    }
    var attrName = '';
    while(i < xml.length){
      var addWord = false,now = xml.charAt(i);
      switch(now){
        case '<':
          if(!building) {
            if(word/*.replace(/\s/g,'')*/){
              var node = new _Vnode('');
              node.nodeType = 3;
              node.nodeValue = word;
              current.appendChild(node);
            }
            word = '';
            state_to('tagNameing');
          }else{
            addWord = true;
          }
          break;
        case '>':
          if(state.tagNameing) {
            if(word.charAt(0) === '/'){
              if(current && current.tagName === word.replace('/','')) {
                current = current.parentNode;
                word = '';
              }else{
                var parent = current.parentNode;
                parent.removeChild(current);
                current = parent;
                word = '<' + word + '>';
              }
            }else{
              buildNode(word);
            }
            state_to();
          }else if(state.attrValueing){
            if((word.charAt(0) === '"' || word.charAt(0) === "'") && word.charAt([word.length - 1]) === word.charAt(0)){
              current.setAttribute(attrName,word.replace(/^"/,'').replace(/^'/,'').replace(/"$/,'').replace(/'$/,''));
              state_to();
              word = '';
            }else{
              addWord = true;
            }
          }else if(state.attrNameing){
            attrName = word.replace(' ','');
            current.setAttribute(attrName,true);
            word = '';
            state_to();
          }else{
            addWord = true;
          }
          break;
        case '=':
          if(state.attrNameing) {
            attrName = word.replace(' ','');
            word = '';
            state_to('attrValueing');
          }else if(state.attrValueing && !word.replace(/\s/g,'')){
            //
          }else{
            addWord = true;
          }
          break;
        case ' ':
          if(state.tagNameing){
            if(word.charAt(0) !== '/'){
              if(/\w$/.test(word)){
                buildNode(word);
              }else{
                addWord = true;
              }
            }else{
              addWord = true;
            }
          }else if(state.attrValueing){
            if(word.replace(/\s/g,'')){
              if((word.charAt(0) === '"' || word.charAt(0) === "'") && word.charAt([word.length - 1]) === word.charAt(0)){
                current.setAttribute(attrName,word.replace(/^"/,'').replace(/^'/,'').replace(/"$/,'').replace(/'$/,''));
                state_to('attrNameing');
                word = '';
              }else{
                addWord = true;
              }
            }
          }else if(state.attrNameing){
            attrName = word.replace(' ','');
            current.setAttribute(attrName,true);
            state_to('attrValueing');
            word = '';
          }else{
            addWord = true;
          }
          break;
        default:
          if(state.attrValueing && !word.replace(/\s/g,'') && /\w/.test(now)){
            state_to('attrNameing');
          }
          addWord = true;
          break;
      }
      if(addWord) word += now;
      prev = now;
      i ++;
    }
    return vnode;
  }
  return _Vnode;
})()var Snowflake = /** @class */ (function() {
    function Snowflake(_workerId, _dataCenterId, _sequence) {
        this.twepoch = 1288834974657n;
        //this.twepoch = 0n;
        this.workerIdBits = 5n;
        this.dataCenterIdBits = 5n;
        this.maxWrokerId = -1n ^ (-1n << this.workerIdBits); // 值为：31
        this.maxDataCenterId = -1n ^ (-1n << this.dataCenterIdBits); // 值为：31
        this.sequenceBits = 12n;
        this.workerIdShift = this.sequenceBits; // 值为：12
        this.dataCenterIdShift = this.sequenceBits + this.workerIdBits; // 值为：17
        this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.dataCenterIdBits; // 值为：22
        this.sequenceMask = -1n ^ (-1n << this.sequenceBits); // 值为：4095
        this.lastTimestamp = -1n;
        //设置默认值,从环境变量取
        this.workerId = 1n;
        this.dataCenterId = 1n;
        this.sequence = 0n;
        if(this.workerId > this.maxWrokerId || this.workerId < 0) {
            throw new Error('_workerId must max than 0 and small than maxWrokerId-[' + this.maxWrokerId + ']');
        }
        if(this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0) {
            throw new Error('_dataCenterId must max than 0 and small than maxDataCenterId-[' + this.maxDataCenterId + ']');
        }
 
        this.workerId = BigInt(_workerId);
        this.dataCenterId = BigInt(_dataCenterId);
        this.sequence = BigInt(_sequence);
    }
    Snowflake.prototype.tilNextMillis = function(lastTimestamp) {
        var timestamp = this.timeGen();
        while(timestamp <= lastTimestamp) {
            timestamp = this.timeGen();
        }
        return BigInt(timestamp);
    };
    Snowflake.prototype.timeGen = function() {
        return BigInt(Date.now());
    };
    Snowflake.prototype.nextId = function() {
        var timestamp = this.timeGen();
        if(timestamp < this.lastTimestamp) {
            throw new Error('Clock moved backwards. Refusing to generate id for ' +
                (this.lastTimestamp - timestamp));
        }
        if(this.lastTimestamp === timestamp) {
            this.sequence = (this.sequence + 1n) & this.sequenceMask;
            if(this.sequence === 0n) {
                timestamp = this.tilNextMillis(this.lastTimestamp);
            }
        } else {
            this.sequence = 0n;
        }
        this.lastTimestamp = timestamp;
        return((timestamp - this.twepoch) << this.timestampLeftShift) |
            (this.dataCenterId << this.dataCenterIdShift) |
            (this.workerId << this.workerIdShift) |
            this.sequence;
    };
    return Snowflake;
}());

//下面是测试代码部分,不需要的可以直接移除
const snid = new Snowflake(1n, 1n, 0n)
a.snowflake = () => {
    return snid.nextId().toString()
}var fs = require('fs');
var crypto = require('crypto');
var request = require('request');
a.Tencent = function (option) {
  option = option || {};
  var _this = this;
  this.baseRouter = option.baseRouter || '/tencent'
  this.app = option.app;
  this.login = option.login;
  this.option = option || {};
  this.option.miniappid = option.miniappid || option.appid;
  this.option.minisecret = option.minisecret || option.secret;
  this.auth = {
    //小程序code登录
    code2Session: function (code, next) {
      a.node.get(a.string('https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code').Format(_this.option.miniappid, _this.option.minisecret, code), function (ret) {
        if (ret.openid) {
          next(ret);
        } else {
          next({
            errorMsg: ret.errmsg || 'jscode2session未知错误'
          });
        }
      })
    },
    decryptData: function (encryptedData, iv, sessionKey) {
      // base64 decode
      encryptedData = new Buffer(encryptedData, 'base64')
      iv = new Buffer(iv, 'base64')

      try {
        // 解密
        var decipher = crypto.createDecipheriv('aes-128-cbc', new Buffer(sessionKey, 'base64'), iv)
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true)
        var decoded = decipher.update(encryptedData, 'binary', 'utf8')
        decoded += decipher.final('utf8')

        decoded = JSON.parse(decoded)

      } catch (err) {
        throw new Error('Illegal Buffer')
      }

      if (decoded.watermark.appid !== _this.option.miniappid) {
        throw new Error('Illegal Buffer')
      }

      return decoded
    },
    access_token: '',
    getAccessToken: function (next) {
      var self = this;
      if (this.access_token && (new Date().getTime() - this.access_token.time) < 1200 * 1000) {
        next(this.access_token);
        return false;
      }
      a.node.get(a.string('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s').Format(_this.option.miniappid, _this.option.minisecret), function (ret) {
        if (ret.access_token) {
          ret.time = new Date().getTime();
          self.access_token = ret;
          next(self.access_token);
        } else {
          next({
            errorMsg: ret.errmsg || 'getAccessToken未知错误'
          });
        }
      })
    }
  }
  this.formatRet = function(ret){
    try{
      if(typeof ret == 'string' && ret.charAt(0) == '{') ret = JSON.parse(ret);
      if(ret.errcode != 0 && ret.errmsg != 'ok') ret.errorMsg = ret.errmsg;
      if(ret.errcode == 40001 && ret.errmsg.indexOf('access_token is invalid') > -1) {
        ret.errtoken = true;
        _this.auth.access_token = '';
      }
    }catch(e){}
    return ret;
  }
  this.ai = {
    printedTextOCR:function(img_url,next){
      _this.auth.getAccessToken(function asycn (ret) {
        if(ret.access_token){
          a.node.fetch({
            url:`https://api.weixin.qq.com/cv/ocr/comm?access_token=${ret.access_token}&img_url=${img_url}`
          }).then(ret => {
            if(ret.errcode) ret.errorMsg = ret.errmsg
            next(ret)
          })
        }
      })
    }
  }

  this.wxacode = {
    //获取限量小程序码
    get:function(args,next){
      _this.auth.getAccessToken(function (ret) {
        if (ret.access_token) {
          args = args || {};
          args.is_hyaline = args.is_hyaline == undefined ? true : args.is_hyaline;
          a.node.fetch({
            method:'POST',
            url:'https://api.weixin.qq.com/wxa/getwxacode?access_token=' + ret.access_token,
            dataType:'text',
            encoding:'binary',
            data:args
          }).then(ret => {
            ret = _this.formatRet(ret);
            if (ret.errcode == 45009) ret.errorMsg = '操作太频繁,请稍后再试!';
            if (ret.errcode == 41030) ret.errorMsg = '此功能尚未开放!';
            if(ret.errtoken){
              _this.wxacode.get(args,next);
            }else{
              next(ret);
            }
          })
        } else {
          next(ret)
        }
      })
    },
    //获取不限量小程序码
    getUnlimited: function (args, next) {
      _this.auth.getAccessToken(function (ret) {
        if (ret.access_token) {
          args = args || {};
          args.scene = args.scene || '';
          //args.is_hyaline = args.is_hyaline == undefined ? true : args.is_hyaline;
          a.node.fetch({
            path: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + ret.access_token,
            method: 'POST',
            dataType: 'text',
            encoding: 'binary',
            data:args
          }).then(ret => {
            ret = _this.formatRet(ret);
            if (ret.errcode == 45009) ret.errorMsg = '操作太频繁,请稍后再试!';
            if (ret.errcode == 41030) ret.errorMsg = '此功能尚未开放!';
            if(ret.errtoken){
              _this.wxacode.get(args,next);
            }else{
              next(ret);
            }
          })
        } else {
          next(ret)
        }
      })
    }
  }

  this.subscribeMessage = {
    send:function(args,next){
      _this.auth.getAccessToken(function (ret) {
        if (ret.access_token) {
          request({
            url: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + ret.access_token,
            method: 'POST',
            body: JSON.stringify(args)
          }, function (err, response, ret) {
            ret = _this.formatRet(ret);
            if(ret.errtoken){
              _this.subscribeMessage.send(args,next);
            }else{
              next(ret);
            }
          })
        } else {
          next(ret)
        }
      })
    }
  }

  this.option.WXPay = {
    appid:this.option.appid,
    mch_id:this.option.mch_id,
    partner_key:this.option.partner_key,
    pfx:this.option.pfx ? fs.readFileSync(this.option.pfx) : ''
  }

  function WXPay() {
    if (!(this instanceof WXPay)) return new WXPay(arguments[0]);
    this.options = arguments[0];
    this.wxpayID = {
      appid: this.options.appid,
      mch_id: this.options.mch_id
    };
  }

  WXPay.mix = function () {
    switch (arguments.length) {
      case 1:
        var obj = arguments[0];
        for (var key in obj) {
          if (WXPay.prototype.hasOwnProperty(key)) {
            throw new Error('Prototype method exist. method: ' + key);
          }
          WXPay.prototype[key] = obj[key];
        }
        break;
      case 2:
        var key = arguments[0].toString(),
          fn = arguments[1];
        if (WXPay.prototype.hasOwnProperty(key)) {
          throw new Error('Prototype method exist. method: ' + key);
        }
        WXPay.prototype[key] = fn;
        break;
    }
  }

  WXPay.mix('option', function (option) {
    for (var k in option) {
      this.options[k] = option[k];
    }
  })

  WXPay.mix('sign', function (param, isSHA256) {
    var querystring = Object.keys(param).filter(function (key) {
      return param[key] !== undefined && param[key] !== '' && ['pfx', 'partner_key', 'sign', 'key'].indexOf(key) < 0;
    }).sort().map(function (key) {
      return key + '=' + param[key];
    }).join("&") + "&key=" + this.options.partner_key;
    if (isSHA256) {
      return crypto.createHmac('sha256', this.options.partner_key).update(querystring, 'utf8').digest('hex').toUpperCase()
    } else {
      return crypto.createHash('md5').update(querystring).digest('hex').toUpperCase()
    }
  })

  WXPay.mix('createUnifiedOrder', function (opts, fn) {
    opts.appid = opts.appid || _this.option.appid;
    opts.nonce_str = opts.nonce_str || a.node.generateNonceString();
    a.node.mix(opts, this.wxpayID);
    opts.sign = this.sign(opts);
    request({
      url: "https://api.mch.weixin.qq.com/pay/unifiedorder",
      method: 'POST',
      body: a.node.buildXML(opts),
      // agentOptions: {
      //   pfx: this.options.pfx,
      //   passphrase: this.options.mch_id
      // }
    }, function (err, response, body) {
      a.node.parseXML(body, fn);
    })
  })

  WXPay.mix('createMiniAppPay', function (opts) {
    var _options = {
      appId: _this.option.appid,
      timeStamp: Math.floor(Date.now() / 1000) + "",
      nonceStr: opts.out_trade_no,
      package: 'prepay_id=' + opts.prepay_id,
      signType: 'MD5'
    }
    return {
      ..._options,
      paySign: this.sign(_options)
    }
  })

  WXPay.mix('getBrandWCPayRequestParams', function (order, fn) {
    order.trade_type = "JSAPI";
    var _this = this;
    this.createUnifiedOrder(order, function (err, data) {
      var reqparam = {
        appId: _this.options.appid,
        timeStamp: Math.floor(Date.now() / 1000) + "",
        nonceStr: data.nonce_str,
        package: "prepay_id=" + data.prepay_id,
        signType: "MD5"
      };
      reqparam.paySign = _this.sign(reqparam);
      fn(err, reqparam);
    })
  })

  WXPay.mix('createMerchantPrepayUrl', function (param) {
    param.time_stamp = param.time_stamp || Math.floor(Date.now() / 1000);
    param.nonce_str = param.nonce_str || a.node.generateNonceString();
    a.node.mix(param, this.wxpayID);
    param.sign = this.sign(param);
    var query = Object.keys(param).filter(function (key) {
      return ['sign', 'mch_id', 'product_id', 'appid', 'time_stamp', 'nonce_str'].indexOf(key) >= 0;
    }).map(function (key) {
      return key + "=" + encodeURIComponent(param[key]);
    }).join('&');
    return "weixin://wxpay/bizpayurl?" + query;
  })

  WXPay.mix('useWXCallback', function (fn) {
    return function (req, res, next) {
      var _this = this;
      res.success = function () {
        res.end(a.node.buildXML({
          xml: {
            return_code: 'SUCCESS'
          }
        }));
      };
      res.fail = function () {
        res.end(a.node.buildXML({
          xml: {
            return_code: 'FAIL'
          }
        }));
      };
      a.node.pipe(req, function (err, data) {
        var xml = data.toString('utf8');
        a.node.parseXML(xml, function (err, msg) {
          req.wxmessage = msg;
          fn.apply(_this, [msg, req, res, next]);
        })
      })
    }
  })

  WXPay.mix('queryOrder', function (query, fn) {
    if (!(query.transaction_id || query.out_trade_no)) {
      fn(null, {
        return_code: 'FAIL',
        return_msg: '缺少参数'
      });
    }
    query.nonce_str = query.nonce_str || a.node.generateNonceString();
    a.node.mix(query, this.wxpayID);
    query.sign = this.sign(query);
    request({
      url: "https://api.mch.weixin.qq.com/pay/orderquery",
      method: "POST",
      body: a.node.buildXML({
        xml: query
      })
    }, function (err, res, body) {
      a.node.parseXML(body, fn);
    })
  })

  WXPay.mix('closeOrder', function (order, fn) {
    if (!order.out_trade_no) {
      fn(null, {
        return_code: "FAIL",
        return_msg: "缺少参数"
      });
    }

    order.nonce_str = order.nonce_str || a.node.generateNonceString();
    a.node.mix(order, this.wxpayID);
    order.sign = this.sign(order);
    request({
      url: "https://api.mch.weixin.qq.com/pay/closeorder",
      method: "POST",
      body: a.node.buildXML({
        xml: order
      })
    }, function (err, res, body) {
      a.node.parseXML(body, fn);
    })
  })

  WXPay.mix('refund', function (order, fn) {
    if (!(order.transaction_id || order.out_refund_no)) {
      fn(null, {
        return_code: 'FAIL',
        return_msg: '缺少参数'
      });
    }
    order.appid = _this.option.appid;
    order.mch_id = _this.option.WXPay.mch_id;
    order.nonce_str = order.nonce_str || a.node.generateNonceString();
    a.node.mix(order, this.wxpayID);
    order.sign = this.sign(order);
    request({
      url: "https://api.mch.weixin.qq.com/secapi/pay/refund",
      method: "POST",
      body: a.node.buildXML({
        xml: order
      }),
      agentOptions: {
        pfx: this.options.pfx,
        passphrase: this.options.mch_id
      }
    }, function (err, response, body) {
      a.node.parseXML(body, fn);
    })
  })
  //添加分账接收方
  WXPay.mix('profitsharingaddreceiver', function (receiver, fn) {
    var order = {};
    order.appid = _this.option.appid;
    order.mch_id = _this.option.WXPay.mch_id;
    order.receiver = JSON.stringify(receiver);
    order.nonce_str = order.nonce_str || a.node.generateNonceString();
    a.node.mix(order, this.wxpayID);
    order.sign = this.sign(order, true);
    request({
      url: "https://api.mch.weixin.qq.com/pay/profitsharingaddreceiver",
      method: "POST",
      body: a.node.buildXML({
        xml: order
      }),
    }, function (err, response, body) {
      a.node.parseXML(body, fn);
    })
  })
  WXPay.mix('profitsharingaddreceivers', function (receivers, fn) {
    var promises = [],
      _this = this,
      _err = null;
    for (var i = 0; i < receivers.length; i++) {
      promises.push(new Promise(function (resolve, reject) {
        var receiver = {
          type: receivers[i].type || 'PERSONAL_OPENID',
          account: receivers[i].account,
          name: receivers[i].name,
          relation_type: receivers[i].relation_type
        };
        _this.profitsharingaddreceiver(receiver, function (err, ret) {
          if (ret.result_code != 'SUCCESS') {
            ret.errorMsg = receiver.name + '(' + receiver.account + ')'
            ret.errorMsg += ret.err_code_des || '添加分账接收方失败'
            _err = ret;
          }
          resolve(ret)
        })
      }))
    }
    Promise.all(promises).then(function (ret) {
      fn(_err, _err || ret[0])
    });
  })

  //单次分账
  WXPay.mix('profitsharing', function (order, fn) {
    if (!(order.transaction_id || order.out_order_no)) {
      fn(null, {
        return_code: 'FAIL',
        return_msg: '缺少参数'
      });
    }
    order.appid = _this.option.appid;
    order.mch_id = _this.option.WXPay.mch_id;
    order.receivers = JSON.stringify(order.receivers);
    order.nonce_str = order.nonce_str || a.node.generateNonceString();
    a.node.mix(order, this.wxpayID);
    order.sign = this.sign(order, true);
    request({
      url: "https://api.mch.weixin.qq.com/secapi/pay/profitsharing", //multiprofitsharing
      method: "POST",
      body: a.node.buildXML({
        xml: order
      }),
      agentOptions: {
        pfx: this.options.pfx,
        passphrase: this.options.mch_id
      }
    }, function (err, response, body) {
      a.node.parseXML(body, fn);
    })
  })
  //完结分账
  WXPay.mix('profitsharingfinish', function (order, fn) {
    if (!(order.transaction_id || order.out_order_no)) {
      fn(null, {
        return_code: 'FAIL',
        return_msg: '缺少参数'
      });
    }
    order.appid = _this.option.appid;
    order.mch_id = _this.option.WXPay.mch_id;
    order.description = order.description || '分账已完成';
    order.nonce_str = order.nonce_str || a.node.generateNonceString();
    a.node.mix(order, this.wxpayID);
    order.sign = this.sign(order, true);
    request({
      url: "https://api.mch.weixin.qq.com/secapi/pay/profitsharingfinish",
      method: "POST",
      body: a.node.buildXML({
        xml: order
      }),
      agentOptions: {
        pfx: this.options.pfx,
        passphrase: this.options.mch_id
      }
    }, function (err, response, body) {
      a.node.parseXML(body, fn);
    })
  })
  //查询分账结果
  WXPay.mix('profitsharingquery', function (order, fn) {
    if (!(order.transaction_id || order.out_order_no)) {
      fn(null, {
        return_code: 'FAIL',
        return_msg: '缺少参数'
      });
    }
    order.mch_id = _this.option.WXPay.mch_id;
    order.nonce_str = order.nonce_str || a.node.generateNonceString();
    order.sign = this.sign(order, true);
    request({
      url: "https://api.mch.weixin.qq.com/pay/profitsharingquery",
      method: "POST",
      body: a.node.buildXML({
        xml: order
      }),
    }, function (err, response, body) {
      a.node.parseXML(body, fn);
    })
  })

  this.WXPay = WXPay(option.WXPay);

  this.qy = {
    access_token:'',
    getToken:function(next){
      request({
        url: "https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=" + option.qyId + "&corpsecret=" + option.qySecret,
        method: "GET"
      }, function (err, response, body) {
        body = JSON.parse(JSON.parse(body));
        if(body.access_token) {
          _this.qy.access_token = body.access_token;
        }else{
          body.errorMsg = '获取授权失败，请检测企业微信配置是否正确!'
        }
        next(body)
      })
    },
    getUserByMobile:function(mobile,next){
      this.getToken(function(ret){
        if(ret.errorMsg){
          next(ret);
          return false;
        }
        request({
          url: "https://qyapi.weixin.qq.com/cgi-bin/user/getuserid?access_token=" + ret.access_token,
          method: "POST",
          json: true,
          headers: {
            "content-type": "application/json",
          },
          body: {
            mobile
          }
        }, function (err, response, body) {
          body = JSON.parse(JSON.parse(body));
          if(!body.userid) {
            body.errorMsg = body.errmsg || '获取用户信息失败!'
          }
          next(body)
        })
      })
    },
    messageSend:function(data,next){
      this.getToken(function(ret){
        if(ret.errorMsg){
          next(ret);
          return false;
        }
        data.agentid = option.qyAgentid;
        data.type = data.type || 'text';
        request({
          url: "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=" + ret.access_token,
          method: "POST",
          json: true,
          headers: {
            "content-type": "application/json",
          },
          body: data
        }, function (err, response, body) {
          body = JSON.parse(JSON.parse(body));
          if(!body.userid) {
            body.errorMsg = body.errmsg || '发送信息失败!'
          }
          next(body)
        })
      })
    },
    messageSendByPhone:function(phone,data,next){
      var qyThis = this;
      this.getUserByMobile(phone,function(user){
        if(user.userid){
          data.userid = user.userid;
          data.touser = user.userid;
          qyThis.messageSend(data,function(ret){
            next(ret);
          })
        }else{
          next(user);
        }
      })
    }
  }
  /*Region列表
    北京一区（华北）	tj	<bucketname-APPID>.costj.myqcloud.com	tj.file.myqcloud.com
    北京	bj	<bucketname-APPID>.cosbj.myqcloud.com	bj.file.myqcloud.com
    上海（华东）	sh	<bucketname-APPID>.cossh.myqcloud.com	sh.file.myqcloud.com
    广州（华南）	gz	<bucketname-APPID>.cosgz.myqcloud.com	gz.file.myqcloud.com
    成都（西南）	cd	<bucketname-APPID>.coscd.myqcloud.com	cd.file.myqcloud.com
    中国香港	hk	<bucketname-APPID>.coshk.myqcloud.com	hk.file.myqcloud.com
    新加坡	sgp	<bucketname-APPID>.cossgp.myqcloud.com	sgp.file.myqcloud.com
    多伦多	ca	<bucketname-APPID>.cosca.myqcloud.com	ca.file.myqcloud.com
    法兰克福	ger	<bucketname-APPID>.cosger.myqcloud.com	ger.file.myqcloud.com
  */
  //对象存储
  this.option.cos = this.option.cos || {
    appId:this.option.cosAppId,
    SecretId:this.option.apiKeyId,
    SecretKey:this.option.apiKey,
    Bucket:this.option.cosBucket,
    Region:this.option.cosRegion
  }
  this.cos = {
    CryptoJS: (function () {
      var CryptoJS = function (g, l) {
        var e = {},
          d = e.lib = {},
          m = function () {},
          k = d.Base = {
            extend: function (a) {
              m.prototype = this;
              var c = new m;
              a && c.mixIn(a);
              c.hasOwnProperty("init") || (c.init = function () {
                c.$super.init.apply(this, arguments)
              });
              c.init.prototype = c;
              c.$super = this;
              return c
            },
            create: function () {
              var a = this.extend();
              a.init.apply(a, arguments);
              return a
            },
            init: function () {},
            mixIn: function (a) {
              for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
              a.hasOwnProperty("toString") && (this.toString = a.toString)
            },
            clone: function () {
              return this.init.prototype.extend(this)
            }
          },
          p = d.WordArray = k.extend({
            init: function (a, c) {
              a = this.words = a || [];
              this.sigBytes = c != l ? c : 4 * a.length
            },
            toString: function (a) {
              return (a || n).stringify(this)
            },
            concat: function (a) {
              var c = this.words,
                q = a.words,
                f = this.sigBytes;
              a = a.sigBytes;
              this.clamp();
              if (f % 4)
                for (var b = 0; b < a; b++) c[f + b >>> 2] |= (q[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((f + b) % 4);
              else if (65535 < q.length)
                for (b = 0; b < a; b += 4) c[f + b >>> 2] = q[b >>> 2];
              else c.push.apply(c, q);
              this.sigBytes += a;
              return this
            },
            clamp: function () {
              var a = this.words,
                c = this.sigBytes;
              a[c >>> 2] &= 4294967295 <<
                32 - 8 * (c % 4);
              a.length = g.ceil(c / 4)
            },
            clone: function () {
              var a = k.clone.call(this);
              a.words = this.words.slice(0);
              return a
            },
            random: function (a) {
              for (var c = [], b = 0; b < a; b += 4) c.push(4294967296 * g.random() | 0);
              return new p.init(c, a)
            }
          }),
          b = e.enc = {},
          n = b.Hex = {
            stringify: function (a) {
              var c = a.words;
              a = a.sigBytes;
              for (var b = [], f = 0; f < a; f++) {
                var d = c[f >>> 2] >>> 24 - 8 * (f % 4) & 255;
                b.push((d >>> 4).toString(16));
                b.push((d & 15).toString(16))
              }
              return b.join("")
            },
            parse: function (a) {
              for (var c = a.length, b = [], f = 0; f < c; f += 2) b[f >>> 3] |= parseInt(a.substr(f,
                2), 16) << 24 - 4 * (f % 8);
              return new p.init(b, c / 2)
            }
          },
          j = b.Latin1 = {
            stringify: function (a) {
              var c = a.words;
              a = a.sigBytes;
              for (var b = [], f = 0; f < a; f++) b.push(String.fromCharCode(c[f >>> 2] >>> 24 - 8 * (f % 4) & 255));
              return b.join("")
            },
            parse: function (a) {
              for (var c = a.length, b = [], f = 0; f < c; f++) b[f >>> 2] |= (a.charCodeAt(f) & 255) << 24 - 8 * (f % 4);
              return new p.init(b, c)
            }
          },
          h = b.Utf8 = {
            stringify: function (a) {
              try {
                return decodeURIComponent(escape(j.stringify(a)))
              } catch (c) {
                throw Error("Malformed UTF-8 data");
              }
            },
            parse: function (a) {
              return j.parse(unescape(encodeURIComponent(a)))
            }
          },
          r = d.BufferedBlockAlgorithm = k.extend({
            reset: function () {
              this._data = new p.init;
              this._nDataBytes = 0
            },
            _append: function (a) {
              "string" == typeof a && (a = h.parse(a));
              this._data.concat(a);
              this._nDataBytes += a.sigBytes
            },
            _process: function (a) {
              var c = this._data,
                b = c.words,
                f = c.sigBytes,
                d = this.blockSize,
                e = f / (4 * d),
                e = a ? g.ceil(e) : g.max((e | 0) - this._minBufferSize, 0);
              a = e * d;
              f = g.min(4 * a, f);
              if (a) {
                for (var k = 0; k < a; k += d) this._doProcessBlock(b, k);
                k = b.splice(0, a);
                c.sigBytes -= f
              }
              return new p.init(k, f)
            },
            clone: function () {
              var a = k.clone.call(this);
              a._data = this._data.clone();
              return a
            },
            _minBufferSize: 0
          });
        d.Hasher = r.extend({
          cfg: k.extend(),
          init: function (a) {
            this.cfg = this.cfg.extend(a);
            this.reset()
          },
          reset: function () {
            r.reset.call(this);
            this._doReset()
          },
          update: function (a) {
            this._append(a);
            this._process();
            return this
          },
          finalize: function (a) {
            a && this._append(a);
            return this._doFinalize()
          },
          blockSize: 16,
          _createHelper: function (a) {
            return function (b, d) {
              return (new a.init(d)).finalize(b)
            }
          },
          _createHmacHelper: function (a) {
            return function (b, d) {
              return (new s.HMAC.init(a,
                d)).finalize(b)
            }
          }
        });
        var s = e.algo = {};
        return e
      }(Math);
      (function () {
        var g = CryptoJS,
          l = g.lib,
          e = l.WordArray,
          d = l.Hasher,
          m = [],
          l = g.algo.SHA1 = d.extend({
            _doReset: function () {
              this._hash = new e.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
            },
            _doProcessBlock: function (d, e) {
              for (var b = this._hash.words, n = b[0], j = b[1], h = b[2], g = b[3], l = b[4], a = 0; 80 > a; a++) {
                if (16 > a) m[a] = d[e + a] | 0;
                else {
                  var c = m[a - 3] ^ m[a - 8] ^ m[a - 14] ^ m[a - 16];
                  m[a] = c << 1 | c >>> 31
                }
                c = (n << 5 | n >>> 27) + l + m[a];
                c = 20 > a ? c + ((j & h | ~j & g) + 1518500249) : 40 > a ? c + ((j ^ h ^ g) + 1859775393) : 60 > a ? c + ((j & h | j & g | h & g) - 1894007588) : c + ((j ^ h ^
                  g) - 899497514);
                l = g;
                g = h;
                h = j << 30 | j >>> 2;
                j = n;
                n = c
              }
              b[0] = b[0] + n | 0;
              b[1] = b[1] + j | 0;
              b[2] = b[2] + h | 0;
              b[3] = b[3] + g | 0;
              b[4] = b[4] + l | 0
            },
            _doFinalize: function () {
              var d = this._data,
                e = d.words,
                b = 8 * this._nDataBytes,
                g = 8 * d.sigBytes;
              e[g >>> 5] |= 128 << 24 - g % 32;
              e[(g + 64 >>> 9 << 4) + 14] = Math.floor(b / 4294967296);
              e[(g + 64 >>> 9 << 4) + 15] = b;
              d.sigBytes = 4 * e.length;
              this._process();
              return this._hash
            },
            clone: function () {
              var e = d.clone.call(this);
              e._hash = this._hash.clone();
              return e
            }
          });
        g.SHA1 = d._createHelper(l);
        g.HmacSHA1 = d._createHmacHelper(l)
      })();
      (function () {
        var g = CryptoJS,
          l = g.enc.Utf8;
        g.algo.HMAC = g.lib.Base.extend({
          init: function (e, d) {
            e = this._hasher = new e.init;
            "string" == typeof d && (d = l.parse(d));
            var g = e.blockSize,
              k = 4 * g;
            d.sigBytes > k && (d = e.finalize(d));
            d.clamp();
            for (var p = this._oKey = d.clone(), b = this._iKey = d.clone(), n = p.words, j = b.words, h = 0; h < g; h++) n[h] ^= 1549556828, j[h] ^= 909522486;
            p.sigBytes = b.sigBytes = k;
            this.reset()
          },
          reset: function () {
            var e = this._hasher;
            e.reset();
            e.update(this._iKey)
          },
          update: function (e) {
            this._hasher.update(e);
            return this
          },
          finalize: function (e) {
            var d =
              this._hasher;
            e = d.finalize(e);
            d.reset();
            return d.finalize(this._oKey.clone().concat(e))
          }
        })
      })();


      (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Base64 = C_enc.Base64 = {
          stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
              var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
              var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
              var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

              var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

              for (var j = 0;
                (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
              }
            }

            // Add padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
              }
            }

            return base64Chars.join('');
          },
          parse: function (base64Str) {
            // Shortcuts
            var base64StrLength = base64Str.length;
            var map = this._map;

            // Ignore padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              var paddingIndex = base64Str.indexOf(paddingChar);
              if (paddingIndex != -1) {
                base64StrLength = paddingIndex;
              }
            }

            // Convert
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
              if (i % 4) {
                var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
                var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
                words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
                nBytes++;
              }
            }

            return WordArray.create(words, nBytes);
          },

          _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        };
      }());
      return CryptoJS;
    })(),
    ..._this.option.cos,
    serveLessSign: function (url, args, meth) {
      args = args || {};
      args.SecretId = this.SecretId;
      args.SignatureMethod = 'HmacSHA1';
      args.Region = this.Region;
      args.Timestamp = parseInt(Date.now() / 1000);
      args.Nonce = parseInt(Math.random() * Math.pow(2, 32));
      //排序
      var arr = [];
      for (var key in args) arr.push(key);
      arr = arr.sort();
      var s = (meth || 'GET') + url + '?';
      for (var i = 0; i < arr.length; i++) s += (i ? '&' : '') + arr[i] + '=' + args[arr[i]];
      args.Signature = this.CryptoJS.HmacSHA1(s, this.SecretKey).toString(this.CryptoJS.enc.Base64);
      s = '';
      for (key in args) s += '&' + key + '=' + encodeURIComponent(args[key]);
      return s.replace(new RegExp('&'), '');
    },
    serveLess: function (functionName, param, callback) {
      var _this = this,
        url = 'scf.api.qcloud.com/v2/index.php';
      return 'https://' + url + '?' + _this.serveLessSign(url, {
        Action: 'InvokeFunction',
        functionName: functionName,
        param: JSON.stringify(param),
        invokeType: 'RequestResponse'
      });
    },
    cosSign: function (path) {
      var random = parseInt(Math.random() * Math.pow(2, 32));
      var now = parseInt(Date.now() / 1000);
      var e = now + 600; //签名过期时间为当前+600s
      var str = 'a=' + this.appId + '&k=' + this.SecretId + '&e=' + e + '&t=' + now + '&r=' + random + '&f=' + encodeURI('/' + this.appId + '/' + this.Bucket + path) + '&b=' + this.Bucket;
      var sha1Res = this.CryptoJS.HmacSHA1(str, this.SecretKey); // 这里使用CryptoJS计算sha1值，你也可以用其他开源库或自己实现
      var strWordArray = this.CryptoJS.enc.Utf8.parse(str);
      var resWordArray = sha1Res.concat(strWordArray);
      return resWordArray.toString(this.CryptoJS.enc.Base64);
    },
    cosUpload: function (tempFilePath) {
      var _this = this;
      var host = this.Region + '.file.myqcloud.com/files/v2/' + this.appId + '/' + this.Bucket;
      var names = tempFilePath.split('.');
      var path = '/' + a.guid() + '.' + names[names.length - 1];
      return {
        url: 'https://' + host + path,
        filePath: tempFilePath,
        method: 'POST',
        name: 'filecontent',
        header: [{
            key: 'Authorization',
            value: _this.cosSign(path)
          },
          {
            key: 'insertOnly',
            value: 0
          }
        ],
        formData: {
          'op': 'upload'
        }
      }
    },
    cosList: function () {
      var host = this.Region + '.file.myqcloud.com';
      var path = '/files/v2/' + this.appId + '/' + this.Bucket;
      var head = {
        'Authorization': this.cosSign('')
      };
      return {
        url: 'https://' + host + path + '?op=list&num=10',
        header: head,
      }
    }
  }
  //微信开放平台
  this.wxcpt = new WXCrypt(option.wxcptAPPID,option.wxcptToken,option.wxcptKey,option.wxcptAPPSECRET,option.wxcptPhone)
  function WXCrypt(appID, token, encodingAESKey, appSecret,phone) {
    this.appID = appID;
    this.token = token;
    this.aesKey = new Buffer(encodingAESKey + '=', 'base64');
    this.iv = this.aesKey.slice(0, 16);
    this.appSecret = appSecret;
    this.phone = phone;
  }
  (function(){
    WXCrypt.prototype.decryptMsg = function (msgSignature, timestamp, nonce, data) {
      const msg_encrypt = data.Encrypt;
      //if(data.ToUserName!=this.appID)throw new Error("ToUserName is invalid");
      if (this.getSignature(timestamp, nonce, msg_encrypt) != msgSignature) throw new Error('msgSignature is not invalid');
      const decryptedMessage = this.decrypt(msg_encrypt);
      return a.node.parseXML(decryptedMessage, { explicitArray: false });
    };

    WXCrypt.prototype.encryptMsg = function (replyMsg, opts) {
      const result = {};
      const options = opts || {};
      result.Encrypt = this.encrypt(replyMsg);
      result.Nonce = options.nonce || parseInt((Math.random() * 100000000000), 10);
      result.TimeStamp = options.timestamp || Date.now();

      result.MsgSignature = this.getSignature(result.TimeStamp, result.Nonce, result.Encrypt);

      return a.node.buildXML(result);
    };

    WXCrypt.prototype.encrypt = function (xmlMsg) {
      const random16 = crypto.pseudoRandomBytes(16);

      const msg = new Buffer(xmlMsg);

      const msgLength = new Buffer(4);
      msgLength.writeUInt32BE(msg.length, 0);

      const corpId = new Buffer(this.appID);

      const raw_msg = Buffer.concat([random16, msgLength, msg, corpId]);//randomString + msgLength + xmlMsg + this.corpID;
      const encoded = PKCS7Encoder(raw_msg);
      const cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, this.iv);
      cipher.setAutoPadding(false);// crypto的padding模式不是PKCS7!!!

      // const cipheredMsg = Buffer.concat([cipher.update(/*encoded*/raw_msg), cipher.final()]);
      const cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()]);

      return cipheredMsg.toString('base64');
    };

    WXCrypt.prototype.decrypt = function (str) {
      const aesCipher = crypto.createDecipheriv("aes-256-cbc", this.aesKey, this.iv);
      aesCipher.setAutoPadding(false);
      let decipheredBuff = Buffer.concat([aesCipher.update(str, 'base64'), aesCipher.final()]);

      decipheredBuff = PKCS7Decoder(decipheredBuff);

      const len_netOrder_corpid = decipheredBuff.slice(16);

      const msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
      //recoverNetworkBytesOrder(len_netOrder_corpid.slice(0, 4));

      const result = len_netOrder_corpid.slice(4, msg_len + 4).toString();

      const appId = len_netOrder_corpid.slice(msg_len + 4).toString();

      if (appId != this.appID) throw new Error('appId is invalid');

      return result;

    };

    WXCrypt.prototype.getSignature = function (timestamp, nonce, encrypt) {
      const raw_signature = [this.token, timestamp, nonce, encrypt].sort().join('');

      const sha1 = crypto.createHash("sha1");
      sha1.update(raw_signature);

      return sha1.digest("hex");
    };

    function PKCS7Decoder(buff) {
      var pad = buff[buff.length - 1];

      if (pad < 1 || pad > 32) {
          pad = 0;
      }

      return buff.slice(0, buff.length - pad);
    }

    function PKCS7Encoder(buff) {
      const blockSize = 32;
      const strSize = buff.length;
      const amountToPad = blockSize - (strSize % blockSize);

      var pad = new Buffer(amountToPad);
      pad.fill(String.fromCharCode(amountToPad));

      return Buffer.concat([buff, pad]);
    }
    var ComponentVerifyTicket,CreateTime;
    WXCrypt.prototype.notify = function(req,res){
      if(req.body.xml.appid != this.appID) {
        res.send('success');
        return false;
      }
      var xml = this.decrypt(req.body.xml.encrypt);
      a.node.parseXML(xml,function(err,ret){
        if(!err && typeof ret == 'object'){
          if(ret.InfoType == 'component_verify_ticket'){
            ComponentVerifyTicket = ret.ComponentVerifyTicket;
            CreateTime = ret.CreateTime;
            fs.writeFileSync('./logs/ComponentVerifyTicket.txt',ret.ComponentVerifyTicket);
          }
        }
      })
      res.send('success');
    }
    var component_access_token,expires_in;
    WXCrypt.prototype.getAccessToken = function(next){
      if(!ComponentVerifyTicket){
        ComponentVerifyTicket = fs.readFileSync('./logs/ComponentVerifyTicket.txt','utf-8').toString();
        if(!ComponentVerifyTicket){
          next({errorMsg:'token正在生成中,请稍后再试!'});
          return false;
        }
      }
      request({
        url: "https://api.weixin.qq.com/cgi-bin/component/api_component_token",
        method: "POST",
        json: true,
        headers: {
          "content-type": "application/json",
        },
        body:{
          component_appid:this.appID,
          component_appsecret:this.appSecret,
          component_verify_ticket:ComponentVerifyTicket
        }
      }, function (err, response, body) {
        if(body.component_access_token) {
          component_access_token = body.component_access_token;
          expires_in = body.expires_in;
        }else{
          body.errorMsg = body.errmsg || body.errcode || '获取accessToken出错';
        }
        next(body);
      })
    }
    WXCrypt.prototype.fastregisterweappCreate = function(next,body){
      this.getAccessToken((ret)=>{
        if(ret.errorMsg){
          next(ret);
          return false;
        }
        body.component_phone = this.phone;
        request({
          url: "https://api.weixin.qq.com/cgi-bin/component/fastregisterweapp?action=create&component_access_token=" + component_access_token,
          method: "POST",
          json: true,
          headers: {
            "content-type": "application/json",
          },
          body:body
        }, function (err, response, body) {
          if(body.errcode) body.errorMsg = body.errmsg || body.errcode || '快速创建小程序出错';
          next(body);
        })
      })
    }
    WXCrypt.prototype.fastregisterweappSearch = function(next,body){
      this.getAccessToken((ret)=>{
        if(ret.errorMsg){
          next(ret);
          return false;
        }
        body.code_type = undefined;
        request({
          url: "https://api.weixin.qq.com/cgi-bin/component/fastregisterweapp?action=search&component_access_token=" + component_access_token,
          method: "POST",
          json: true,
          headers: {
            "content-type": "application/json",
          },
          body:body
        }, function (err, response, body) {
          if(body.errcode) body.errorMsg = body.errmsg || body.errcode || '查询快速创建小程序状态出错';
          next(body);
        })
      })
    }
    WXCrypt.prototype.preauthcode = function(next,body){
      var _this = this;
      this.getAccessToken((ret)=>{
        if(ret.errorMsg){
          next(ret);
          return false;
        }
        request({
          url: "https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token=" + component_access_token,
          method: "POST",
          json: true,
          headers: {
            "content-type": "application/json",
          },
          body:{component_appid:this.appID}
        }, function (err, response, body) {
          if(!body.pre_auth_code) {
            body.errorMsg = body.errmsg || body.errcode || '预授权码出错';
          }else{
            body.url = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + _this.appID + '&pre_auth_code=' + body.pre_auth_code + '&';
          }
          next(body);
        })
      })
    }
  })()
}
a.Version = {"createTime":1697505481096,"authorize":0};
module.exports = a;
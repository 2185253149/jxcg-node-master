Y.common = function(args, type) {
  var $ = this;
  if(!args){//全局对象公共扩展方法
    function ajax(meth,url,data,next,args){
      return new Promise(resolve => {
        args = args || {};
        args.meth = meth || 'GET';
        args.data = data;
        args.loading = args.loading || (args.meth == 'GET' ? false : undefined)
        Y.ajax(url,function(ret){
          if(typeof next == 'function') next(ret);
          resolve(ret);
        },args);
      })
    }
    this.get = function(url,data,next,args){
      return ajax('GET',url,data,next,args);
    }
    this.post = function(url,data,next,args){
      return ajax('POST',url,data,next,args);
    }
    this.put = function(url,data,next,args){
      return ajax('PUT',url,data,next,args);
    }
    this.delete = function(url,data,next,args){
      return ajax('DELETE',url,data,next,args);
    }
    ///自定义表单model解析
    this.formExtendModel = function(formExtend){
      formExtend = typeof formExtend == 'string' ? JSON.parse(formExtend) : formExtend;
      let models = {};
      for (let i = 0; i < formExtend.length; i++) {
        let id = formExtend[i].id || i;
        models[id] = formExtend[i];
        models[id].type = models[id].type || 'input'
        let _rule = models[id].rule ? models[id].rule.split(',') : [];
        let rule = {};
        for(let j = 0; j < _rule.length; j ++){
          let rule_d = _rule[j].split('_');
          rule[rule_d[0]] = rule_d[1] || true;
        }
        models[id].rule = rule;
      }
      return models;
    }
    this.Config = function(config) {
      config.statics = config.statics || {};
      for (var key in config.statics) {
        if (config.statics[key].charAt(0) == '/') config.statics[key] = config.staticURL + config.statics[key];
        if (config.statics[key].charAt(0) == '~') config.statics[key] = config.statics[key].replace('~', '/');
        config.statics[key] += '?_=' + config.version;
      }
      if(config.models){
        for(key in config.models) {
          config.models[key].id = Y.merge({label:''},config.models[key].id || {});
          config.models[key].createTime = Y.merge({label:''},config.models[key].createTime || {});
          config.models[key].updateTime = Y.merge({label:''},config.models[key].updateTime || {});
          config.models[key].state = Y.merge({label:'',defaultValue:1},config.models[key].state || {});
          config.models[key].unitId = Y.merge({label:''},config.models[key].unitId || {});
          for(var _key in config.models[key]) {
            config.models[key][_key] = typeof config.models[key][_key] == 'string' ? {label:config.models[key][_key]} : config.models[key][_key];
            config.models[key][_key].id = _key;
          }
        }
      }
      config.nickNames = config.nickNames || {};
      for (key in config) {
        if(key == 'nickNames'){
          Y.ajax('/nickNames',function(ret){
            if(!ret.errorMsg) Y.merge(config.nickNames,ret);
            Y.Storage.set('nickNames',config.nickNames,3);
          },{errNotify:false})
        }else{
          Y.Storage.set(key, config[key], 3);
        }
      }
    }
    this.formatImgURL = function(imgUrl){
      if (imgUrl.charAt(0) == '/') imgUrl = Y.Storage.get('APIURL') + imgUrl;
      return imgUrl;
    }
    this.setStore = function(name,data){
      var stores = Y.Storage.get(name);
      if(stores) for(var i = 0; i < stores.length; i ++) stores[i].setData(data);
    }
    this.modelList = function(option,args){
      option = option || {};
      args = args || {}
      return {
        data: Y.merge({
          title:'',
          modelName:'',
          models:{},
          nickName:'',
          platform: Y.platform
        },args.data || {}),
        methods: Y.merge({
          load: function (next) {
            this.selectComponent('#listpage').load(next);
          },
          refresh: function (next) {
            this.selectComponent('#listpage').refresh(next);
          },
          onPullDownRefresh: function (event) {
            this.refresh(function () {
              Y.stopPullDownRefresh();
            })
          },
          onReachBottom: function (event) {
            this.load();
          },
          edit:function(event,query){
            var modeleditquery = {
              values:{},
              refresh: this.refresh,
              models: this.getData('models'),
              url: '/api/model/' + this.getData('modelName')
            }
            if (event.type == 'edit'){
              modeleditquery.values = event.detail;
              if(option.pageUrl){
                if(/admin\//.test(option.pageUrl)) option.pageUrl = option.pageUrl.replace('admin/','');
                modeleditquery.models.pageUrl = {
                  label:'页面路径',
                  type:'textarea',
                  readOnly:true,
                  allWidth:true
                }
                modeleditquery.values.pageUrl = Y.string(option.pageUrl)._eval(event.detail);
              }
              modeleditquery.title = '修改 ' + this.getData('nickName');
              modeleditquery.meth = 'PUT';
            }else{
              modeleditquery.title = '新增 ' + this.getData('nickName');
              modeleditquery.meth = 'POST';
            }
            if(typeof option.modeleditquery == 'function'){
              option.modeleditquery.call(this,modeleditquery,event,query);
            }else if(typeof option.modeleditquery == 'object'){
              Y.merge(modeleditquery,option.modeleditquery);
            }
            Y.Storage.set('modeleditquery', modeleditquery);
            this.$go('/pages/model/edit/edit');
          },
          mount:function(ret,query,nickName){
            var _this = this;
            if (!ret.errorMsg) {
              var edit = {},join = [];
              for (var key in ret) {
                if(ret[key].type == 'onlyselect'){
                  var _key = key.replace('Id','');
                  join.push(_key);
                  ret[key].attr = ret[key].attr || {};
                  ret[key].attr.skey = ret[key].attr.skey || 'name';
                  ret[key].attr.title = ret[key].attr.title || ('选择' + ret[key].label);
                  ret[key].attr.url = ret[key].attr.url || ('/api/model/' + _key);
                  ret[key].attr.placeholder = ret[key].attr.placeholder || ('请选择' + ret[key].label);
                }
                if (ret[key].label && /switch/.test(ret[key].type)) edit[key] = '/api/model/' + query.modelName;
                if (ret[key].label && /anyselect|editor|form|title|table/.test(ret[key].type)) ret[key].unList = true;
              }
              var getUrl = '/api/model/' + query.modelName;
              if(join.length) getUrl += '?join=' + join.join(',');
              var listPage = {
                getUrl: getUrl,
                models: ret,
                searchKey: query.searchKey,
                edit: edit,
                actions:{
                  edit: {
                    action: function (event) {
                      _this.edit(event,query);
                    },
                    name: '修改'
                  },
                  delet:{
                    action: '/api/model/' + query.modelName,
                    name:'删除'
                  },
                  add:{
                    action: function (event) {
                      _this.edit(event,query);
                    },
                    name: '新增'
                  }
                }
              }
              if(typeof option.listPage == 'function'){
                option.listPage.call(_this,listPage,query);
              }else if(typeof option.listPage == 'object'){
                Y.merge(listPage,option.listPage);
              }
              _this.selectComponent('#listpage').init(listPage);
              _this.load();
              _this.setData({ models: ret,nickName: nickName, title: query.title || nickName || '列表', modelName: query.modelName});
            }
          }
        },args.methods || {}),
        mounted: function (query) {
          var _this = this;
          Y.merge(query,option);
          var nickName = Y.Storage.get('nickNames')[query.modelName] || query.nickName;
          var storageModels = Y.Storage.get('models');
          if(storageModels && storageModels[query.modelName]){
            _this.mount(storageModels[query.modelName],query,nickName);
          }else{
            Y.ajax('/model/' + query.modelName, function (ret) {
              _this.mount(ret,query,nickName);
            }, {
              storageName: query.storageName || (query.modelName + 'Model')
            })
          }
          if(args.mounted) args.mounted.call(this,query)
        }
      }
    }
    this.classifyList = function(option,args){
      option = option || {};
      args = args || {}
      return {
        data: Y.merge({
          tree: [],
          models:{}
        },args.data || {}),
        methods: Y.merge({
          getItem: function (event, next) {
            var index = event.currentTarget.dataset.index.toString();
            index = index ? index.split(',') : [];
            var tree = this.getData('tree'), item = '',parent = '';
            for (var i = 0; i < index.length; i++) {
              if (i === 0) {
                item = tree[index[0]];
              } else {
                parent = item;
                item = item.children[index[i]];
              }
            }
            next.call(this, item, tree, index,parent);
          },
          change: function (event) {
            this.getItem(event, function (item, tree) {
              item.opened = !item.opened;
              this.setData({
                tree: tree
              });
            });
          },
          delet: function (event) {
            var _this = this;
            this.getItem(event, function (item, tree, index,parent) {
              Y.confirmx('确定删除?', function () {
                Y.ajax('/api/model/' + option.modelName + '?id=' + item.id, function (ret) {
                  if (ret.errorMsg) {
                    Y.showToast('删除失败!!' + ret.errorMsg);
                  } else {
                    if(parent){
                      parent.children.splice(index[index.length - 1], 1);
                    }else{
                      tree.splice(index[0], 1);
                    }
                    _this.setData({
                      tree: tree
                    });
                  }
                }, {
                    meth: 'DELETE'
                  })
              })
            })
          },
          edit: function (event) {
            var _this = this;
            this.getItem(event, function (item) {
              var models = this.getData('models');
              if(option.pageUrl){
                models.pageUrl = {
                  label:'页面路径',
                  type:'textarea',
                  readOnly:true,
                  allWidth:true
                }
                item.pageUrl = Y.string(option.pageUrl)._eval(item);
              }
              var modeleditquery = {
                values: item,
                title: '修改 ' + item.name,
                meth: 'PUT',
                refresh: this.getList,
                models: models,
                readOnly: item.editAble == 0,
                url: '/api/model/' + option.modelName
              }
              if(typeof option.modeleditquery == 'function'){
                option.modeleditquery.call(_this,modeleditquery,item,'edit');
              }else if(typeof option.modeleditquery == 'object'){
                Y.merge(modeleditquery,option.modeleditquery);
              }
              Y.Storage.set('modeleditquery', modeleditquery);
              this.$go('/pages/model/edit/edit');
            })
          },
          add: function (event) {
            var _this = this;
            this.getItem(event, function (item) {
              var modeleditquery = {
                values: {},
                title: (item ? item.name : '') + ' 新增子' + option.nickName,
                meth: 'POST',
                refresh: this.getList,
                models: this.getData('models'),
                url: '/api/model/' + option.modelName,
                submit: function (data) {
                  if (item) {
                    data.parentId = item.id;
                    data.level = parseInt(item.level) + 1;
                    //data.id = item.id + '_' + Y.guid();
                  }else{
                    data.level = 1;
                  }
                  return data;
                }
              }
              if(typeof option.modeleditquery == 'function'){
                option.modeleditquery.call(_this,modeleditquery,item,'add');
              }else if(typeof option.modeleditquery == 'object'){
                Y.merge(modeleditquery,option.modeleditquery);
              }
              Y.Storage.set('modeleditquery', modeleditquery);
              this.$go('/pages/model/edit/edit');
            })
          },
          getList: function () {
            var _this = this;
            Y.ajax('/api/model/' + option.modelName, function (ret) {
              if (!ret.errorMsg) {
                var tree = {
                  '0': {
                    children: []
                  }
                };
                for (var i = 0; i < ret.length; i++) {
                  ret[i].parentId = ret[i].parentId || '0';
                  ret[i].opened = true;
                  ret[i].children = [];
                  tree[ret[i].id] = ret[i];
                  if (tree[ret[i].parentId]) tree[ret[i].parentId].children.push(ret[i])
                }
                _this.setData({
                  tree: tree['0'].children
                })
              }
            },{
              data:{sql:'classifySort'}
            })
          }
        },args.methods || {}),
        mounted: function (query) {
          Y.merge(query,option);
          var _this = this;
          this.getList();
          var storageModels = Y.Storage.get('models');
          if(storageModels && storageModels[query.modelName]){
            _this.setData({models:storageModels[query.modelName]});
          }else{
            Y.ajax('/model/' + query.modelName, function (ret) {
              if(!ret.errorMsg) _this.setData({models:ret});
            }, {
              storageName: query.modelName + 'Model'
            })
          }
          if(args.mounted) args.mounted.call(this,query)
        }
      }
    }
    return false;
  }

  //app对象公共扩展方法
  if(type == 'app'){
    for(var key in args) {
      try{
        $[key] = args[key];
      }catch(e){}
    }
    return args;
  }
  //页面/组件对象公共扩展方法
  args.data = args.data || {};
  args.methods = args.methods || {};
  var going = false;
  args.methods.$go = function(e, type) {
    if(going) return false;
    going = true;
    setTimeout(function(){
      going = false;
    },2000)
    var url, openType;
    if (e.currentTarget) {
      url = e.currentTarget.dataset.url;
      openType = e.currentTarget.dataset.type;
    } else if (typeof e == 'string') {
      url = e;
    }
    if (!url) return false;
    Y.$go(url, openType);
  }
  args.methods.$back = function() {
    Y.$go('', 'navigateBack');
  }
  args.methods.getStore = function(name,stores){
    if(!Y.Storage.get(name)) Y.Storage.set(name,[]);
    Y.Storage.get(name).push(this);
    var rc = {};
    for(var key in stores) {
      var _key = key,type = stores[key];
      if(typeof stores[key] == 'string'){
        _key = stores[key];
        type = 0;
      }else if(stores[key] && typeof stores[key] == 'object'){
        _key = stores[key].key;
        type = stores[key].type;
      }
      if(Y.Storage.get(_key,type)) rc[key] = Y.Storage.get(_key,type);
    }
    return rc;
  }
  var funcs = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack', 'showToast', 'showLoading', 'hideLoading', 'showModal', 'makePhoneCall', 'openLocation','saveFile'];
  if(Y.Storage.get('autoMethods') instanceof Array) funcs = funcs.concat(Y.Storage.get('autoMethods'));
  for (var i = 0; i < funcs.length; i++) {
    if (typeof $[funcs[i]] == 'function') {
      (function(i) {
        args.methods['$' + funcs[i]] = function(event) {
          if (event.currentTarget.dataset[funcs[i]]) {
            $[funcs[i]](Y.string(event.currentTarget.dataset[funcs[i]]).parse());
          } else {
            $[funcs[i]](event.currentTarget.dataset);
          }
        }
      })(i)
    }
  }
  return args;
}
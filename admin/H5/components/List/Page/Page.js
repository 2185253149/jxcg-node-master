(function (G) {
  var drawerStyle = 'left:300rpx;right:0rpx;top:0rpx;bottom:0rpx;';
  if (G.platform == 'iOS' || G.platform == 'Android') drawerStyle = G.styleSheet(G.computStyle(drawerStyle));
  window["components_List_Page_Page"]({
  "component": true,
  "usingComponents": {
    "drawer": "/components/Drawer/Drawer",
    "mixinput": "/components/Input/Mixinput/Mixinput",
    "liststatus": "/components/List/Status/Status",
    "inputcheckbox":"/components/Input/Checkbox/Checkbox"
  },
  "Web":{
    "usingComponents": {
      "listtable": "/components/List/Table/Table"
    }
  }
},{
template:'#TEMPLATE_components_List_Page_Page',

    options: {
      multipleSlots: true
    },
    props: {

    },
    data: function () {
      return {
        oid:'',
        show: false,
        platform: G.platform,
        drawerStyle: drawerStyle,
        searchValues: {},
        searchValuesShow:[{}],
        models: {},
        modelLength:0,
        searchs: [],
        active: -1,
        actionsStyle: '',
        pagination: [],
        actions: [],
        getUrl: '',
        canDelete: false,
        deleteKey: 'id',
        canCheck: true,
        exportUrl: '',
        canAdd: false,
        canEdit: true,
        canBack: false,
        selected: {},
        listData: G.list().getData(),
        textstitle:'',
        textstitleStyle:'',
        statistics:'',
        statisticsString:'',
        textssearchBtn:'搜索',
        textsaddBtn:'新增',
        textseditBtn:'编辑',
        textsbackBtn:'返回',
        textsexportBtn:'导出',
        textsoutEditBtn:'取消',
        textsdeletsBtn:'批删',
        textsallCheckBtn:'全选',
        textsunAllCheckBtn:'反选',
        textscheckBtn:'选择',
        editing:true
      }
    },
    methods: {
      openSearch: function () {
        this.setData({ show: !this.getData('show') });
      },
      openImg: function (e) {
        var dataset = e.currentTarget.dataset, url = this.getData('listData').rows[dataset.index][dataset.key];
        if (url) {
          if (G.previewImage) {
            G.previewImage({
              urls: [url]
            })
          } else {
            window.open(url);
          }
        }
      },
      changeEditing:function(){
        this.setData({editing:!this.getData('editing')})
      },
      exportExcel:function(event){
        //通用导出
        var exportUrl = this.getData('exportUrl');
        if(exportUrl) {
          if(exportUrl == 'action'){
            var actions = G.Storage.get(this.getData('oid'));
            if (actions.export && typeof actions.export.action == 'function') actions.export.action.call(this,{type:'export',event:event,detail:{}})
          }else{
            exportUrl = exportUrl.replace(new RegExp('^{(.+)}', 'g'), function($0, $1) {
              return G.Storage.get($1) || ('{' + $1 + '}');
            })
            if (exportUrl.indexOf('http') != 0) exportUrl = G.Storage.get('APIURL') + exportUrl;
            var headers = G.Storage.get('ajaxHeader'),_headers = {},_exportUrl = [];
            for(var i = 0; i < headers.length; i ++) _exportUrl.push(headers[i].key + '=' + headers[i].value);
            for(var key in this.getData('searchValues')) if(key != 'pageSize' && key != 'pageNum') _exportUrl.push(key + '=' + this.getData('searchValues')[key]);          
            G.showFile(exportUrl + (exportUrl.indexOf('?') > -1 ? '&' : '?') + _exportUrl.join('&'),false,'excel');
          }
        }
      },
      openActions: function (event) {
        var clientY = event.clientY || event.changedTouches[0].clientY;
        this.setData({ active: event.currentTarget.dataset.index,actionsStyle:'left:auto;bottom:auto;padding:0px 16px;right:16px;top:' + clientY + 'px' });
      },
      closeActions: function () {
        this.setData({ active: -1 });
      },
      clearSearch: function () {
        var searchValues = this.getData('searchValues');
        for (var key in searchValues) searchValues[key] = '';
        this.setData({ searchValues: searchValues });
      },
      change: function (event) {
        var value = event.detail.value, id = event.detail.id, searchValues = this.getData('searchValues');
        searchValues[event.detail.id] = value;
        this.setData({ searchValues: searchValues,searchValuesShow:[searchValues] });
      },
      filter: function (item, key) {
        var models = this.getData('models');
        var rc = '',model = models[key];
        if(model){
          if(typeof model.model == 'function'){
            model = model.model.call(this,item,model) || model;
          }else if(typeof model.model == 'object' && model.model){
            model = model.model;
          }
        }
        if(!model) return '';
        switch (model.type) {
          case 'radio':
          case 'select':
            for (var i = 0; i < model.attr.actions.length; i++) {
              if (item[key] == model.attr.actions[i].value) {
                rc = model.attr.actions[i].name;
                break;
              }
            }
            break;
          case 'checkbox':
            rc = [];
            for (var i = 0; i < model.attr.actions.length; i++) {
              if (new RegExp(',' + model.attr.actions[i].value + ',').test(',' + item[key] + ',')) rc.push(model.attr.actions[i].name);
            }
            rc = rc.join(',');
            break;
          case 'datetime':
            rc = !item[key] ? '' : G.date(-(-item[key])).toLocalString();
            break;
          case 'switch':
            rc = item[key] == 1 ? '是' : '否';
            break;
          case 'image':
            rc = typeof item[key] == 'string' ? item[key].split(',')[0] : '';
            rc = rc.charAt(0) === '/' ? G.Storage.get('APIURL') + rc : rc;
            break;
          case 'file':
            rc = G.string(item[key]).parse([])[0];
            rc = rc && rc.originalname ? rc.originalname : '';
            break;
          case 'onlyselect':
            var keyName = key.replace('Id','') + model.attr.skey.replace(/([A-Za-z])/,function($0,$1){
              return $1.toUpperCase();
            });
            rc = item[keyName] || item[key];
            break;
          default:
            rc = item[key] == null ? '' : item[key];
            break;
        }
        return rc;
      },
      check: function (event) {
        var index = event.detail.index;
        var list = this.buildList();
        if (index > -1) {
          list.checkn(index);
        } else {
          list.checkAll(!this.getData('listData').allChecked);
        }
        this.setData({ listData: list.getData()})
      },
      doAction: function (event) {
        var index = event.currentTarget.dataset.index, action = event.currentTarget.dataset.action;
        var actions = G.Storage.get(this.getData('oid'));
        if (actions[action]) {
          switch (action) {
            case 'delet':
              this.delet.call(this,index);
              break;
            default:
              if (actions[action] && typeof actions[action].action == 'function') {
                actions[action].action.call(this,{ type: action,event:event, detail: G.clone(this.getData('listData').rows[index]) })
              }
              break
          }
        }
      },
      add: function (event) {
        var actions = G.Storage.get(this.getData('oid'));
        if (actions.add && typeof actions.add.action == 'function') actions.add.action.call(this,{ type: 'add',event:event, detail: {} })
      },
      delet: function (index) {
        var _this = this, ids = [], deleteKey = this.getData('deleteKey');
        var actions = G.Storage.get(this.getData('oid'));
        var listData = this.getData('listData');
        if (index > -1) {
          ids.push(listData.rows[index][deleteKey]);
        } else {
          for (var i = 0; i < listData.rows.length; i++) {
            if (listData.rows[i].checked) ids.push(listData.rows[i][deleteKey]);
          }
        }
        if (ids.length) {
          G.confirmx('确定要对此' + ids.length + '项进行删除?', function () {
            var data = {};
            data[deleteKey] = { $in: ids };
            if (typeof actions.delet.action == 'string') {
              G.ajax(actions.delet.action, function (ret) {
                G.alertx(ret.errorMsg || '删除成功!!');
                if (!ret.errorMsg) _this.refresh();
              }, {
                  meth: 'DELETE',
                  data: data
                })
            } else if (typeof actions.delet.action == 'function') {
              actions.delet.action.call(_this,{ type: 'delete', detail: data })
            }
          })
        }else{
          G.alertx('请选择需要删除的项')
        }
      },
      buildList: function () {
        var _this = this;
        var config = this.getData('listData');
        var models = this.getData('models');
        var searchValues = this.getData('searchValues');
        var getUrl = this.getData('getUrl'), url = getUrl, data = {};
        if (typeof getUrl == 'object') {
          if (getUrl.data) data = getUrl.data;
          if (getUrl.url) url = getUrl.url;
        }
        var searchs = this.getData('searchs');
        for(var i = 0; i < searchs.length; i ++) models[searchs[i].id] = searchs[i];
        for (var key in searchValues) {
          data[key] = searchValues[key];
          if(models[key] && models[key].type == 'onlyselect'){
            var value = G.string(searchValues[key]).parse(),vkey = models[key].attr.vkey || 'id';
            data[key] = value[vkey] ? (key == 'unitId' ? { $regex: value[vkey] } : value[vkey]) : undefined;
          } else if (models[key] && models[key].type == 'datetime' && searchValues[key] != undefined) {
            if(/END$/.test(key)){
              continue;
            }else{
              if(this.searchValues[key + 'END']){
                data[key] = {$gte:this.searchValues[key],$lte:this.searchValues[key + 'END']};
              }else{
                data[key] = {$gte:this.searchValues[key]};
              }
            }
          } else if (models[key] && !/select|date|time/.test(models[key].type) &&  !models[key].unRegex) {
            if (searchValues[key] != undefined && searchValues[key].toString && searchValues[key].toString().length > 0) {
              data[key] = { $regex: searchValues[key] };
            }
          }
          if (data[key] === '') {
            data[key] = undefined;
          }
        }
        config.data = url instanceof Array ? url : null;
        config.get = { url: url, data: data };
        var actions = G.Storage.get(this.getData('oid'));
        config.addDataChange = function () {
          this.tdhide = true;
          if(typeof actions.addDataChange == 'function') actions.addDataChange.call(this,this);
          for (var key in models) {
            this[key + '_'] = _this.filter(this, key);
          }
        }
        return G.list(config);
      },
      getRows:function(){
        return this.getData('listData').rows;
      },
      val:function(s){
        return G.platform == 'Web' ? this.selectComponent('#listtable').val(s) : this.buildList().val(s);
      },
      load: function (next) {
        var _this = this;
        if (G.platform == 'Web') {
          this.selectComponent('#listtable').load(next);
        } else {
          this.buildList().load(function () {
            _this.setData({ active: -1, listData: this.getData(),statisticsString:G.string(_this.getData('statistics'))._eval(this.res) });
            if (typeof next == 'function') next.call(this);
          });
        }
      },
      refresh: function (next) {
        var _this = this;
        if (G.platform == 'Web') {
          this.selectComponent('#listtable').refresh(next);
        } else {
          this.buildList().refresh(function () {
            _this.setData({ active: -1, show: false,listData: this.getData(),statisticsString:G.string(_this.getData('statistics'))._eval(this.res) });
            if (typeof next == 'function') next.call(this);
          });
        }
      },
      changeHide:function(event){
        var index = event.currentTarget.dataset.index;
        var listData = this.getData('listData');
        listData.rows[index].tdhide = false;
        this.setData({listData});
      },
      init: function (options) {
        if (G.platform == 'Web') {
          this.selectComponent('#listtable').init(options);
        } else {
          var _this = this, _actions = [], hasEdit = true, hasDelete = true, actions = {};
          options.oid = options.oid || G.zIndex();
          options.actions = options.actions || {};
          for (var key in options.actions) {
            actions[key] = options.actions[key];
            if(!actions[key]) continue
            if (key == 'add' && actions[key]) {
              options.canAdd = true;
              continue;
            } else if (key == 'export') {
              options.exportUrl = 'action';
              options.textsexportBtn = actions[key].name;
              continue;
            } else if (key == 'delet') {
              if(!actions[key]) continue;
              options.canDelete = true;
              //options.canCheck = true;
            }
            _actions.push({
              action: key,
              style:options.actions[key].style || '',
              name: options.actions[key].name
            });
          }
          actions.addDataChange = options.addDataChange;
          G.Storage.set(options.oid,actions);
          options.actions = _actions;
          if (options.searchKey) {
            var searchKey = options.searchKey ? options.searchKey.split(',') : [];
            var searchs = options.searchs || [], searchValues = options.searchValues || {};
            for (var i = 0; i < searchKey.length; i++) {
              var model = {};
              if(searchKey[i] == 'unitId'){
                model = {
                  id:'unitId',
                  label:'所属' + (G.Storage.get('nickNames').unit || '单位'),
                  attr:{
                    skey: 'name',
                    vkey: 'unitId',
                    canClear:true,
                    url: '/api/model/unit',
                    title: '请选择' + (G.Storage.get('nickNames').unit || '单位')
                  },
                  type:'onlyselect'
                }
              }else if(options.models[searchKey[i]]){
                model = G.clone(options.models[searchKey[i]]);
              }
              if (model && model.type != 'checkbox') {
                if (model.type == 'radio') model.type = 'select';
                if (model.type == 'switch') {
                  model.type = 'select';
                  model.attr = model.attr || {};
                  model.attr.actions = [{ name: '否', value: 0 }, { name: '是', value: 1 }]
                }
                if (model.type == 'textarea') model.type = 'input';
                model.attr = model.attr || {};
                model.attr.placeholder = model.label;
                searchValues[searchKey[i]] = model.defaultValue;
                if (model.type == 'select') {
                  model.attr.actions.unshift({
                    name: '全部',
                    value: ''
                  })
                }
                model.id = model.id || searchKey[i];
                model.type = model.type || 'input';
                searchs.push(model);
              }
            }
            options.searchs = searchs;
            options.searchValues = searchValues;
            options.searchValuesShow = [searchValues];
          }
          var i = 0;
          for(var key in options.models) {
            if(options.models[key].unList || !options.models[key].label) continue;
            options.models[key].index = i;
            i ++;
          }
          options.modelLength = i;
          this.setData(options);
        }
      }
    }
  })
})(Y)

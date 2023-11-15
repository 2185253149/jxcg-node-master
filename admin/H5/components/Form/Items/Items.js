(function (G) {
  window["components_Form_Items_Items"]({
  "component": true,
  "usingComponents": {
    "mixinput":"/components/Input/Mixinput/Mixinput",
    "onlyselect": "/components/Input/OnlySelect/OnlySelect",
    "anyselect": "/components/Input/AnySelect/AnySelect",
    "inputeditor":"/components/Input/Editor/Editor",
    "inputtable":"/components/Input/Table/Table",
    "inputform":"/components/Input/Model/index",
    "mappoint":"/components/Input/WMap/Point/Point",
    "mappolygon":"/components/Input/WMap/Polygon/Polygon",
    "wxcustomer":"/components/Input/Customer/Wx/Index"
  },
  "Web":{
    "usingComponents": {
        "webmappoint":"/components/Input/Map/Point/Point",
        "webmappolygon":"/components/Input/Map/Polygon/Polygon",
        "webcustomer":"/components/Input/Customer/Web/Index"
    }
  }
},{
template:'#TEMPLATE_components_Form_Items_Items',

    props: {
      readOnly: {
        type: Boolean,
        'default': false
      },
      models: {
        type: Object,
        'default': {}
      },
      values: {
        type: Object,
        'default': {}
      },
      tips:{
        type:Array,
        'default':[]
      }
    },
    data: function () {
      return {
        _readOnly:false,
        formitems: [],
        tips_:[],
        errorMsg: {},
        value: {},
        valueShow:[{}],
        platform: G.platform,
        _models:{}
      }
    },
    mounted:function(){
      this.init(this.getData('models'), this.getData('values'), this.getData('readOnly'),this.getData('tips'))
    },
    methods: {
      init: function (models, value, readOnly,tips){
        value = value || {};
        var formitems = [];
        for (var key in models) {
          var model = models[key];
          if (!model || !model.type) continue;
          if(typeof model.model == 'function'){
            model = model.model.call(this,value,model) || model;
          }else if(typeof model.model == 'object' && model.model){
            model = model.model;
          }
          model.id = key;
          model.sort = model.sort || 100;
          model.attr = model.attr || {};
          value[key] = value[key] == undefined ? model.defaultValue : value[key];
          if(value[key] && typeof value[key] == 'string' && model.type == 'onlyselect' && /Id$/.test(key)) {
            model.attr.skey = model.attr.skey || 'name';
            model.attr.vkey = model.attr.vkey || 'id';
            var _value = {};
            _value[model.vkey || 'id'] = value[key];
            _value[model.attr.skey] = value[key.replace('Id',model.attr.skey.replace(/([A-Za-z])/,function($0,$1){
              return $1.toUpperCase();
            }))];
            // value[key] = _value;
            value[key] = JSON.stringify(_value)
          }
          if(value[key] && typeof value[key] == 'object' && model.type != 'onlyselect') value[key] = JSON.stringify(value[key]);
          if(value[key] && typeof value[key] == 'string' && /table/.test(model.type)) value[key] = G.string(value[key]).parse([]);
          // if(value[key] && typeof value[key] == 'string' && model.type == 'editor') {
          //   value[key] = G.string(value[key]).parse([],function(s){
          //     return s ? s.split('\n').join('<br/>') : '';
          //   });
          //   for(var i = 0; i < value[key].length; i ++) value[key][i].text = value[key][i].text ? value[key][i].text.split('<br/>').join('\n') : '';
          // }
          if(G.platform === 'Web' && !model.style){
            if(/checkbox|radio|file|title/.test(model.type)) model.style = 'width:90%;min-height:40px;height:auto;float:none;clear:both;';
            if(/textarea|image|editor|table|map|anyselect|model|form|customer/.test(model.type)) model.style = 'width:90%;min-height:40px;height:auto;float:none;clear:both;';
            if(model.type == 'editor') {
              model.attr.height = 200;
            }
          }
          model.errorMsg = '';
          if(readOnly || model.readOnly){
            if(model.attr && model.attr.placeholder){
              model.attr.placeholder = '';
            }
            // if(model.type == 'textarea') {
            //   model.attr = model.attr || {}
            //   model.attr.style = model.attr.style || ''
            //   model.attr.style += ';height:auto;'
            // }
          }
          if(model[G.platform + 'Type']) model.type = model[G.platform + 'Type']
          formitems.push(model);
        }
        formitems.sort(function(a,b){
          return a.sort - b.sort;
        })
        this.setData({ _models:models,tips_:tips,formitems: formitems, valueShow:[value], value: value, _readOnly: !!readOnly });
      },
      change: function (event) {
        var detail = event.detail ? event.detail : event;
        var id = detail.id, index = detail.index;
        var value = this.getData('value'), formitems = this.getData('formitems') ,_models = this.getData('_models');
        value[id] = detail.value;
        var formitem = formitems[index],formitemId = formitem.id
        if (formitems[index].rule) {
          var err = G.Verify.Rules(value[id], _models[formitemId].rule);
          formitems[index].errorMsg = err[0] ? '' : err[1];
        }
        this.setData({
          value: value,
          valueShow:[value],
          formitems: formitems
        })
      },
      submit: function () {
        var errorMsg = [],formitems = this.getData('formitems'),value = this.getData('value');
        for (var i = 0; i < formitems.length; i++) {
          if(!value[formitems[i].id] && /region/.test(formitems[i].type)) value[formitems[i].id] = '北京市北京市东城区';
          if(value[formitems[i].id] && /onlyselect/.test(formitems[i].type)) {
            if(typeof value[formitems[i].id] == 'string') value[formitems[i].id] = G.string(value[formitems[i].id]).parse({})
            var key = formitems[i].id.replace('Id','');
            var name = formitems[i].attr.skey.replace(/([A-Za-z])/,function($0,$1){
              return $1.toUpperCase();
            })
            value[key + 'Object'] = G.clone(value[formitems[i].id]);
            value[key + name] = value[formitems[i].id][formitems[i].attr.skey];
            value[formitems[i].id] = value[formitems[i].id][formitems[i].attr.vkey || 'id'];
          }
          //if(formitems[i].type == 'editor') formitems[i].rule = G.merge(formitems[i].rule || {},{ NoSpecial:true });
          if(formitems[i].type == 'form') formitems[i].rule = G.merge(formitems[i].rule || {},{});
          if (formitems[i].rule){
            // if(formitems[i].type == 'editor'){
            //   if(value[formitems[i].id] && value[formitems[i].id].length && formitems[i].rule.NotNull){
            //     var hasContent = false;
            //     for(var j = 0; j < value[formitems[i].id].length; j ++){
            //       if(value[formitems[i].id][j].text || value[formitems[i].id][j].img || value[formitems[i].id][j].file){
            //         hasContent = true;
            //         break;
            //       }
            //     }
            //     if(!hasContent) errorMsg.push(formitems[i].label + ' 不能为空')
            //   }
            // } else if(formitems[i].type == 'table'){
            if(formitems[i].type == 'table'){
              if(value[formitems[i].id] && value[formitems[i].id].length){
                for(var j = 0; j < value[formitems[i].id].length; j ++){
                  for(var _key in formitems[i].attr.models){
                    var err = G.Verify.Rules(value[formitems[i].id][j][_key], formitems[i].attr.models[_key].rule);
                    if (!err[0]) errorMsg.push(formitems[i].label + ' ' + value[formitems[i].id][j][_key] + ' ' + err[1]);
                  }
                }
              }
            }else if(formitems[i].type == 'form'){
                let inputformdata = this.selectComponent('#' + formitems[i].id).submit();
                if(inputformdata) {
                    value[formitems[i].id] = inputformdata;
                }else{
                    errorMsg.push('请完善' + formitems[i].label);
                }
            }else{
              var err = G.Verify.Rules(value[formitems[i].id], formitems[i].rule);
              if (!err[0]) errorMsg.push(formitems[i].label + ' ' + err[1]);
            }
          }
          if(value[formitems[i].id] && typeof value[formitems[i].id] == 'object' && /table|form|file/.test(formitems[i].type)) value[formitems[i].id] = JSON.stringify(value[formitems[i].id]);
        }
        if (errorMsg.length) {
        //   G.alertx(errorMsg.join('\r\n'))
            G.toask('请完善信息')
        } else {
          return G.clone(value);
        }
      }
    }
  })
})(Y)

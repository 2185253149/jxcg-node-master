(function (G) {
  var pick = G.Picker && new G.Picker();
  window["components_Input_Mixinput_Mixinput"]({
  "component": true,
  "usingComponents": {
    "inputcheckbox": "/components/Input/Checkbox/Checkbox",
    "onlyselect": "/components/Input/OnlySelect/OnlySelect",
    "inputregion": "/components/Input/Region/Region"
  }
},{
template:'#TEMPLATE_components_Input_Mixinput_Mixinput',

    props: {
      value: {
        type: String,
        observer: function (newValue, oldValue) {
          this.filterValue(newValue);
        }
      },
      defaultValue: {
        type: String
      },
      type: {
        type: String,
        default: 'input'
      },
      name: {
        type: String,
        default: ''
      },
      attr: {
        type: Object,
        default: {}
      },
      index:{
        type: Number,
        default: 0
      },
      readOnly: {
        type: Boolean,
        default: false
      }
    },
    data: function () {
      return {
        value1: '',
        platform: G.platform,
        imgActionsShow:false,
        uploading:false
      }
    },
    mounted: function () {
      var value = this.getData('value');
      this.filterValue(value == undefined ? this.getData('defaultValue') : value);
    },
    methods: {
      filterValue: function (value) {
        var _this = this, type = this.getData('type'), attr = this.getData('attr') || {}, value1 = '';
        if (type == 'select') {
          value1 = ['',''];
          for (var i = 0; i < attr.actions.length; i++) {
            if (attr.actions[i].value == value) {
              value1 = [i, attr.actions[i].name];
              break;
            }
          }
        } else if (type == 'switch') {
          value1 = value == 1 ? true : false;
        } else if (type == 'checkbox') {
          value1 = [];
          for (var i = 0; i < attr.actions.length; i++) {
            value1[i] = new RegExp(',' + attr.actions[i].value + ',').test(',' + value + ',');
          }
        } else if (type == 'datetime') {
          if (G.platform == 'WeChatMiniApp' || G.platform == 'AlipayMiniApp'){
            attr.args = attr.args || [];
            attr.args[0] = attr.args[0] || {};
            attr.args[0].min = attr.args[0].min || '1900-01-01';
            attr.args[0].max = attr.args[0].max || '2050-12-31';
            attr.args[0].type = attr.args[0].type > 0 ? attr.args[0].type : 3;
            attr.args[0].type = ['year', 'month', 'data'][attr.args[0].type - 1];
            attr.args[1] = attr.args[1] || {};
          }
          value1 = [value, G.date(-(-value)).Format('yyyy-MM-dd'), G.date(-(-value)).Format('hh:mm'), attr];
        } else if (type == 'image') {
          value1 = value && typeof value == 'string' ? value.split(',') : [];
          for(var i = 0; i < value1.length; i ++){
            if (value1[i].charAt(0) === '/') value1[i] = G.Storage.get('APIURL') + value1[i];
          }
        } else if (type == 'file') {
          value1 = G.string(value).parse([]);
          for(var i = 0; i < value1.length; i ++){
            if(!value1[i].originalname){
              var originalname = value1[i].url.split('/');
              value1[i].originalname = originalname[originalname.length - 1].replace(/\?.+$/,'');
            }
            if(typeof value1[i].url == 'string' && value1[i].url.charAt(0) === '/') value1[i].url = G.Storage.get('APIURL') + value1[i].url
          }
        } else if(type == 'onlyselect'){
          value1 = value || '{}';
          value1 = G.string(value).parse();
        } else {
          value1 = value;
        }
        this.setData({ value1: value1 })
        //this._change(p);
      },
      _change: function (event) {
        var type = this.getData('type'), attr = this.getData('attr'), value1 = this.getData('value1');
        var returnValue = '',valueIndex = -1;
        if (event) {
          returnValue = event.srcElement ? event.srcElement.value : event.detail.value;
        }else{
          returnValue = value1;
        }
        if (type == 'select') {
          valueIndex = returnValue[0];
          returnValue = returnValue[0] >= 0 ? attr.actions[returnValue[0]].value : '';
        } else if (type == 'switch') {
          returnValue = returnValue ? 1 : 0;
        } else if (type == 'radio') {
          valueIndex = event.detail.index;
          returnValue = attr.actions[valueIndex].value;
        } else if (type == 'checkbox') {
          valueIndex = event.detail.index;
          value1[valueIndex] = !value1[valueIndex];
          returnValue = [];
          for (var i = 0; i < attr.actions.length; i++) {
            if (value1[i]) returnValue.push(attr.actions[i].value);
          }
          returnValue = returnValue.join(',');
        } else if (type == 'datetime') {
          returnValue = /^\d{4,4}-\d{1,2}-\d{1,2}$/.test(value1[1]) && /^\d{1,2}:\d{1,2}/.test(value1[2]) ? G.date().parse(value1[1] + ' ' + value1[2]).getTime() : '';
        } else if (type == 'image') {
          var APIURL = G.Storage.get('APIURL');
          returnValue = returnValue instanceof Array ? returnValue : [];
          returnValue = returnValue.join(',').replace(APIURL == '.' ? /\.\//g : new RegExp(APIURL + '/','g'),'/');
        } else if (type == 'file') {
          var APIURL = G.Storage.get('APIURL');
          returnValue = JSON.stringify(returnValue).replace(APIURL == '.' ? /\.\//g : new RegExp(APIURL + '/','g'),'/');
        } else if (type == 'onlyselect') {
          returnValue = JSON.stringify(returnValue);
        }
        if(returnValue.trim) returnValue = returnValue.trim()
        this.triggerEvent('change', { id: this.getData('name'), index: this.getData('index'), value: returnValue, valueIndex: valueIndex });
      },
      pickerPick: function (e) {
        if (this.getData('readOnly')) return false;
        var _this = this;
        var items = this.attr.actions;
        var index = 0;
        items.forEach(function (item, i) {
          if (item.value == _this.value1[0]) index = i;
        })
        var rect = G.getBoundingClientRect(e.srcElement);
        if (!rect.trueWidth) {
          rect.left = e.clientX;
          rect.top = e.clientY;
        }
        var styleString = '',bottom = -(-rect.top) - (-rect.height);
        if(G.platform == 'Web'){
          if(bottom + 240 > G.body.clientHeight){
            styleString = 'left:' + rect.left + 'px;top:auto;overflow:hidden;bottom:0px;'
          }else{
            styleString = 'left:' + rect.left + 'px;top:' + bottom + 'px;overflow:hidden;'
          }
        }
        pick.pick({
          items: items,
          index: index,
          pickBox: styleString,
        }, function (ret) {
          if (ret.result == 'success') {
            _this.pickerPickIndex(ret.index);
          } else if (ret.result == 'clear') {
            _this.pickerPickIndex();
          }
        })
      },
      _pickerPick:function(e){
        this.pickerPickIndex(e.detail.value);
      },
      pickerPickIndex:function(index){
        var attr = this.getData('attr');
        if(index >= 0){
          attr = attr || this.getData('attr');
          this.setData({ value1: [index, attr.actions && attr.actions[index] ? attr.actions[index].name : (attr.placeholder || '')]});
        }else{
          this.setData({ value1: ['', attr.placeholder || '']});
        }
        this._change();
      },
      _pickerDate:function(e){
        this.setData({ value1: e.detail.value });
        this._change();
      },
      pickerDate: function (e) {
        if (this.getData('readOnly')) return false;
        var _this = this;
        var attr = this.attr;
        attr.value = this.value1;
        if (G.platform == 'Web'){
          var rect = G.getBoundingClientRect(e.srcElement);
          if (!rect.trueWidth) {
            rect.left = e.clientX;
            rect.top = e.clientY;
          }
          var styleString = '',bottom = -(-rect.top) - (-rect.height);
          if(G.platform == 'Web'){
            if(bottom + 240 > G.body.clientHeight){
              styleString = 'left:' + rect.left + 'px;top:auto;overflow:hidden;bottom:0px;'
            }else{
              styleString = 'left:' + rect.left + 'px;top:' + bottom + 'px;overflow:hidden;'
            }
          }
          attr.pickBox = styleString;
        }
        pick.pickDate(attr, function (ret) {
          if (ret.result == 'success') {
            _this.value1 = ret.data;
            _this._change();
          } else if (ret.result == 'clear') {
            _this.value1 = '';
            _this._change();
          }
        })
      },
      _pickerTime: function (e) {
        this.setData({ value1: e.detail.value });
        this._change();
      },
      pickerTime: function (e) {
        if (this.getData('readOnly')) return false;
        var _this = this;
        var attr = this.attr;
        attr.value = this.value1;
        if (G.platform == 'Web') {
          var rect = G.getBoundingClientRect(e.srcElement);
          if (!rect.trueWidth) {
            rect.left = e.clientX;
            rect.top = e.clientY;
          }
          var styleString = '',bottom = -(-rect.top) - (-rect.height);
          if(G.platform == 'Web'){
            if(bottom + 240 > G.body.clientHeight){
              styleString = 'left:' + rect.left + 'px;top:auto;overflow:hidden;bottom:0px;'
            }else{
              styleString = 'left:' + rect.left + 'px;top:' + bottom + 'px;overflow:hidden;'
            }
          }
          attr.pickBox = styleString;
        }
        pick.pickTime(attr, function (ret) {
          if (ret.result == 'success') {
            _this.value1 = ret.data;
            _this._change();
          } else if (ret.result == 'clear') {
            _this.value1 = '';
            _this._change();
          }
        })
      },
      pickerDateTime_date:function(e){
        var value1 = this.getData('value1');
        value1[1] = e.detail.value;
        this.setData({value1:value1});
        this._change();
      },
      pickerDateTime_time: function (e) {
        var value1 = this.getData('value1');
        value1[2] = e.detail.value;
        this.setData({ value1: value1 });
        this._change();
      },
      pickerDateTime: function (e) {
        if (this.getData('readOnly')) return false;
        var _this = this;
        var attr = this.attr;
        var datetime = this.value1[1].split(' ');
        attr.args = attr.args || [];
        attr.args[0] = attr.args[0] || {};
        attr.args[0].pickType = 'pickDate';
        attr.args[0].value = datetime[0];
        attr.args[1] = attr.args[1] || {};
        attr.args[1].pickType = 'pickTime';
        attr.args[1].value = datetime[1];
        attr.args[1].type = 2;
        if(G.platform == 'Web'){
          var rect = G.getBoundingClientRect(e.srcElement);
          if (!rect.trueWidth) {
            rect.left = e.clientX;
            rect.top = e.clientY;
          }
          var styleString = '',bottom = -(-rect.top) - (-rect.height);
          if(G.platform == 'Web'){
            if(bottom + 240 > G.body.clientHeight){
              styleString = 'left:' + rect.left + 'px;top:auto;overflow:hidden;bottom:0px;width:360px;'
            }else{
              styleString = 'left:' + rect.left + 'px;top:' + bottom + 'px;overflow:hidden;width:360px;'
            }
          }
          attr.pickBox = styleString;
        }
        pick.picks(attr, function (ret) {
          if (ret.result == 'success') {
            _this.value1[1] = ret.data[0];
            _this.value1[2] = ret.data[1];
            _this._change();
          } else if (ret.result == 'clear') {
            _this.value1[1] = '';
            _this.value1[2] = '';
            _this._change();
          }
        })
      },
      showImgActions:function(event){
        if(this.data.readOnly){
          this.showImg(event.currentTarget.dataset.url)
        }else{
          this.setData({ imgActionsShow: true })
        }
      },
      hideImgActions:function(){
        this.setData({ imgActionsShow: false })
      },
      showImg:function(e){
        var url = e;
        if(e.currentTarget){
            var index = e.currentTarget.dataset.index,value1 = this.getData('value1');
            url = value1[index];
        }
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
      uploadFile: function (e) {
        if (this.getData('readOnly')) return false;
        var _this = this,type = this.getData('type'),attr = this.getData('attr'), value1 = this.getData('value1');
        var APIURL = G.Storage.get('APIURL');
        var uploadConfig = {
          id:type,
          url: APIURL + '/upload',
          urlFormat: function (ret) {
            ret.url = APIURL + '/file/' + ret.id
            return ret;
          },
          ajax:{
            loading:{
              open: function() {
                _this.setData({uploading:true});
              },
              close: function() {
                _this.setData({uploading:false});
              }
            }
          }
        }
        var mixinputUpload = G.Storage.get('mixinputUpload');
        if(typeof mixinputUpload == 'function'){
          mixinputUpload.call(this,uploadConfig,type);
        }else if(mixinputUpload && typeof mixinputUpload == 'object' && type == 'image'){
          G.merge(uploadConfig, mixinputUpload);
        }
        G.merge(uploadConfig, attr || {});
        uploadConfig.uploaded = value1;
        uploadConfig.upIndex = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.index != undefined ? e.currentTarget.dataset.index : undefined;
        if(G.platform != 'Web') uploadConfig.ImgEdit = false;
        var values = value1 || [];
        function formatUrl(ret){
          return ret.url.charAt(0) === '/' ? G.Storage.get('APIURL') + ret.url : ret.url
        }
        if(type == 'image'){
          uploadConfig.accept = 'image';
          uploadConfig.maxSize = uploadConfig.maxSize || 1 * 1024 * 1024
          uploadConfig.callback = function (ret, errs) {
            if(uploadConfig.upIndex >= 0){
              values[-(-uploadConfig.upIndex)] = formatUrl(ret[0])
            }else{
              for (var i = 0; i < ret.length; i++)  values.push(formatUrl(ret[i]));
            }
            _this.setData({ value1: values });
            if (errs) G.showToast(errs);
            _this._change();
          }
        }else{
          uploadConfig.callback = function (ret, errs) {
            function fileFormat(ret){
              if(!ret.originalname){
                var originalname = ret.url.split('/');
                ret.originalname = originalname[originalname.length - 1].replace(/\?.+$/,'');
              }
              ret.url = formatUrl(ret);
              return ret;
            }
            if(uploadConfig.upIndex >= 0){
              values[-(-uploadConfig.upIndex)] = fileFormat(ret[0]);
            }else{
              for (var i = 0; i < ret.length; i++) values.push(fileFormat(ret[i]));
            }
            _this.setData({ value1: values });
            if (errs) G.showToast(errs);
            _this._change();
          }
        }
        new G.Upload(uploadConfig).click();
      },
      removeFile: function (e) {
        if (this.getData('readOnly')) return false;
        var value1 = this.getData('value1');
        value1.splice(e.currentTarget.dataset.index,1);
        this.setData({value1:value1});
        this._change()
      },
      showFile:function(e){
        var value1 = this.getData('value1');
        var url = value1[e.currentTarget.dataset.index],isImg = true,type = '';
        if(url && typeof url == 'object' && url.url) {
          isImg = /image/.test(url.mimetype);
          type = url.originalname.split('.');
          type = type[type.length - 1];
          url = url.url;
        }
        G.showFile(isImg && (G.platform == 'WeChatMiniApp' || G.platform == 'AlipayMiniApp') ? url + '?download=true' : url,isImg,type);
      }
    }
  })
})(Y)

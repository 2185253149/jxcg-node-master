(function (G) {
  var areaCode = [];
  window["components_Input_Region_Region"]({
  "component": true,
  "usingComponents": {}
},{
template:'#TEMPLATE_components_Input_Region_Region',

    props: {
      name:{
        type:String,
        default:''
      },
      index: {
        type: Number
      },
      value: {
        type: String,
        default: '',
        observer: function (newValue, oldValue) {
          this.filterValue(newValue);
        }
      },
      customItem:{
        type: Object
      },
      disabled:{
        type:Boolean,
        default:false
      }
    },
    data: function () {
      return {
        region:[],
        codes:[],
        platform: G.platform,
      }
    },
    mounted: function () {
      var _this = this;
      if (!areaCode.length){
        var storageAreaCode = G.Storage.get('areaCode');
        if(storageAreaCode){
          areaCode = new G.SQLite(storageAreaCode);
          _this.filterValue(_this.getData('value'));
        }else{
          G.ajax('/areaCode',function(ret){
            if (!ret.errorMsg) areaCode = new G.SQLite(ret);
            _this.filterValue(_this.getData('value'));
          },{
            storageName:'areaCode'
          })
        }
      }
    },
    methods: {
      filterValue: function (value) {
        value = value || '北京市北京市东城区';
        if(areaCode instanceof Array) return false;
        var provinces = '-' + areaCode.find({ parentId: '' }, null, {
          filter: function (data) {
            return data.name + '_' + data.id + '_' + data.index;
          }
        }).join('-') + '-', citys = '', districts = '';
        var words = '', province = '', city = '', district = '';
        var indexs = [], codes = [];
        for (var i = 0; i < value.length; i++) {
          words += value.charAt(i);
          if (!province) {
            var reg = new RegExp('-(' + words + ')_([0-9]+)_([0-9]+)-');
            provinces.replace(reg, function ($0, $1, $2, $3) {
              province = $1;
              indexs[0] = $3;
              codes[0] = $2;
              citys = '-' + areaCode.find({ parentId: $2 }, null, {
                filter: function (data) {
                  return data.name + '_' + data.id + '_' + data.index;
                }
              }).join('-') + '-';
              words = '';
              return '-' + $1 + '_' + $2 + '-'
            })
          } else if (!city) {
            var reg = new RegExp('-(' + words + ')_([0-9]+)_([0-9]+)-');
            citys.replace(reg, function ($0, $1, $2, $3) {
              city = $1;
              indexs[1] = $3;
              codes[1] = $2;
              districts = '-' + areaCode.find({ parentId: $2 }, null, {
                filter: function (data) {
                  return data.name + '_' + data.id + '_' + data.index;
                }
              }).join('-') + '-';
              words = '';
              return '-' + $1 + '_' + $2 + '-'
            })
          } else if (!district) {
            var reg = new RegExp('-(' + words + ')_([0-9]+)_([0-9]+)-');
            districts.replace(reg, function ($0, $1, $2, $3) {
              district = $1;
              indexs[2] = $3;
              codes[2] = $2;
              words = '';
              return '-' + $1 + '_' + $2 + '-'
            })
          }
        }
        this.setData({
          region: [province, city, district, words],
          codes: codes,
          indexs: indexs
        })
      },
      openPicker: function (e) {
        if (this.getData('disabled')) return false;
        var _this = this;
        var codes = this.getData('codes'), indexs = this.getData('indexs');
        var pick = new G.Picker();
        var attr = {
          args: [
            {
              pickType: 'pick',
              index: parseInt(indexs[0]),
              items: areaCode.find({ parentId: '' }, null, {
                filter: function (data) {
                  data.value = data.id
                  return data;
                }
              })
            },
            {
              pickType: 'pick',
              index: parseInt(indexs[1]),
              items: areaCode.find({ parentId: codes[0] }, null, {
                filter: function (data) {
                  data.value = data.id
                  return data;
                }
              })
            },
            {
              pickType: 'pick',
              index: parseInt(indexs[2]),
              items: areaCode.find({ parentId: codes[1] }, null, {
                filter: function (data) {
                  data.value = data.id
                  return data;
                }
              })
            }
          ],
          endFn: function (i, pickers, index, pickDoms) {
            if (i == 0) {
              var parentId = pickers[0].args.items[index].id;
              pickers[1].args.items = areaCode.find({ parentId: parentId });
              pickDoms[1].build(pickers[i].createDomItems(pickers[1].args.items), 0);
              parentId = pickers[1].args.items[0].id;
              pickers[2].args.items = areaCode.find({ parentId: parentId });
              pickDoms[2].build(pickers[2].createDomItems(pickers[2].args.items), 0);
            } else if (i == 1) {
              var parentId = pickers[1].args.items[index].id;
              pickers[2].args.items = areaCode.find({ parentId: parentId });
              pickDoms[2].build(pickers[2].createDomItems(pickers[2].args.items), 0);
            }
          }
        };
        if (G.platform == 'Web') {
          var rect = G.getBoundingClientRect(e.srcElement);
          if (!rect.trueWidth) {
            rect.left = e.clientX;
            rect.top = e.clientY;
          }
          var styleString = '', bottom = -(-rect.top) - (-rect.height);
          if (G.platform == 'Web') {
            if (bottom + 240 > G.body.clientHeight) {
              styleString = 'left:' + rect.left + 'px;top:auto;overflow:hidden;bottom:0px;width:360px;'
            } else {
              styleString = 'left:' + rect.left + 'px;top:' + bottom + 'px;overflow:hidden;width:360px'
            }
          }
          attr.pickBox = styleString;
        }
        pick.picks(attr, function (ret) {
          if (ret.result == 'success') {
            _this.setData({
              codes: [ret.data[0].id, ret.data[1].id, ret.data[2].id],
              indexs: [ret.data[0].index, ret.data[1].index, ret.data[2].index]
            })
            _this._change({ detail: { code: [ret.data[0].id, ret.data[1].id, ret.data[2].id], value: [ret.data[0].name, ret.data[1].name, ret.data[2].name] } });
          } else if (ret.result == 'clear') {
            _this._change({ detail: { code: '', value: '' } });
          }
        })
      },
      _change: function (e) {
        this.setData({
          region: e.detail.value
        })
        this.triggerEvent('change', { code:e.detail.code[2],value: e.detail.value.join(''), id:this.getData('name'),index:this.getData('index') });
      }
    }
  })
})(Y)

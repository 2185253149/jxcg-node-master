(function (G) {
  window["components_Input_Model_index"]({
  "component": true,
  "usingComponents": {
    "formitems":"/components/Form/Items/Items"
  }
},{
template:'#TEMPLATE_components_Input_Model_index',

    props: {
      name: {
        type: String,
        default: '',
        observer: function (newValue, oldValue) {
          // this.init(this.getData('models'), this.getData('value'));
        }
      },
      index: {
        type: Number,
        observer: function (newValue, oldValue) {
          // this.init(this.getData('models'), this.getData('value'));
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      hideHead:{
        type:Boolean,
        default: false
      },
      title:{
        type:String,
        default:''
      },
      models:{
        type:Object,
        default:{},
        observer: function (newValue, oldValue) {
          // this.init(newValue, this.getData('value'));
        }
      },
      style:{
        type:String,
        default:''
      },
      value:{
        type:Array,
        default:'',
        observer: function (newValue, oldValue) {
          // this.init(this.getData('models'), newValue);
        }
      }
    },
    data: function () {
      return {
        th: [],
        td: [],
        editValueTeplate:{},
        editValue:{},
        editIndex:-1,
        show:false,
        contentStyle:'',
        oid:G.zIndex()
      }
    },
    mounted: function () {
      this.init(this.getData('models'), this.getData('value'));
    },
    methods: {
      openImg: function (e) {
        var url = e.currentTarget.dataset.url;
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
      filter: function (item, key, models) {
        var rc = '', type = models[key] ? models[key].type : '';
        switch (type) {
          case 'radio':
          case 'select':
            for (var i = 0; i < models[key].attr.actions.length; i++) {
              if (item[key] == models[key].attr.actions[i].value) {
                rc = models[key].attr.actions[i].name;
                break;
              }
            }
            break;
          case 'checkbox':
            rc = [];
            for (var i = 0; i < models[key].attr.actions.length; i++) {
              if (new RegExp(',' + models[key].attr.actions[i].value + ',').test(',' + item[key] + ',')) rc.push(models[key].attr.actions[i].name);
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
            item[key] = typeof item[key] == 'string' ? item[key].split(',')[0] : '';
            rc = item[key].charAt(0) === '/' ? G.Storage.get('APIURL') + item[key] : item[key];
            break;
          case 'file':
            rc = item[key][0].originalname;
            break;
          default:
            rc = item[key] == null ? '' : item[key];
            break;
        }
        return rc;
      },
      init: function (models, data){
        var th = [], editValueTeplate = {};
        for(var key in models){
          models[key].sort = 100 || models[key].sort;
          models[key].id = models[key].id || key;
          editValueTeplate[key] = models[key].defaultValue || '';
          th.push(models[key]);
          if(typeof data == 'string') data = G.string(data).parse([])
          if(!(data instanceof Array)) data = [];
          for(var i = 0; i < data.length; i ++){
            if (data[i][key] == undefined && models[key].defaultValue != undefined) data[i][key] = models[key].defaultValue;
            if (this.getData('disabled')) data[i][key] = this.filter(data[i], key, models)
          }
        }
        th.sort(function(a,b){
          return a.sort - b.sort;
        })
        this.setData({
          th: th,
          td: !data.length && !this.getData('disabled') ? [{}] : data,
          editValueTeplate:editValueTeplate
        })
      },
      edit:function(event){
        var index = event.currentTarget.dataset.index;
        if(index == undefined) index = -1;
        if(index > -1){

        }else{
          let td = this.getData('td')
          td.push({})
          this.setData({
              td
          })
        }
      },
      closeEdit:function(){
        this.setData({ show:false });
      },
      submit:function(event){
          let td = this.getData('td'),oid = this.getData('oid'),index = event && event.currentTarget && event.currentTarget.dataset.index
          let values = []
          for(let i = 0; i < td.length; i ++){
              let formitem = this.selectComponent('#form' + oid + i).submit();
              if(!formitem) return false;
              values.push(formitem);
          }
          this.triggerEvent('change', { type: index > -1 ? 'edit' : 'save', value: JSON.stringify(values), id: this.getData('name'), index: this.getData('index') });
          return values;
      },
      delet:function(event){
        var td = this.getData('td');
        td.splice(event.currentTarget.dataset.index, 1);
        this.setData({ td: td });
        this.triggerEvent('change', { type: 'delete', value: td, id: this.getData('name'), index: this.getData('index') });
      },
      change: function (event) {
        var detail = event.detail ? event.detail : event;
        var id = detail.id, index = detail.index;
        var value = this.getData('editValue'), formitems = this.getData('th');
        value[id] = detail.value;
        if (formitems[index].rule) {
          var err = G.Verify.Rules(value[id], formitems[index].rule);
          formitems[index].errorMsg = err[0] ? '' : err[1];
        }
        this.setData({
          editValue: value,
          th: formitems
        })
      }
    }
  })
})(Y)

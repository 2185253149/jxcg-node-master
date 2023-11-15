(function (G) {
  window["components_Input_OnlySelect_OnlySelect"]({
  "component": true,
  "usingComponents": {
    "drawer": "/components/Drawer/Drawer",
    "liststatus": "/components/List/Status/Status"
  }
},{
template:'#TEMPLATE_components_Input_OnlySelect_OnlySelect',

    props: {
      name: {
        type: String
      },
      index: {
        type: Number
      },
      disabled: {
        type: Boolean,
        default: false
      },
      value: {
        type: Object,
        default: {},
        observer: function (newValue, oldValue) {
          this.filterValue(newValue);
        }
      },
      placeholder:{
        type: String,
        default: '请选择'
      },
      skey:{
        type:String,
        default:'name'
      },
      sitem:{
        type:String,
        default:''
      },
      vkey:{
        type:String,
        default:'id'
      },
      canClear:{
        type:Boolean,
        default:true
      },
      searchKey:{
        type:String,
        default:'name'
      },
      searchRegex:{
        type:Boolean,
        default:true
      },
      url:{
        type:String
      },
      meth:{
        type:String,
        default:'GET'
      },
      data:{
        type:Object,
        default:{}
      },
      title:{
        type:String,
        default:'请选择'
      },
      clearText:{
        type:String,
        default:'清空'
      }
    },
    data: function () {
      return {
        index1:{},
        value1: -1,
        show:false,
        contentStyle:'',
        search:'',
        listData: G.list().getData()
      }
    },
    methods: {
      filterValue:function(value){
        var listData = this.getData('listData'),skey = this.getData('skey'),vkey = this.getData('vkey'),rows = listData ? listData.rows : [];
        for(var i = 0; i < rows.length; i ++){
          if(rows[i][vkey] == value[vkey]){
            this.setData({index1:i,value1:rows[i]});
            return;
          }
        }
        this.setData({index1:-1,value1:value});
      },
      changeSearch:function(event){
        this.setData({ search: event.srcElement ? event.srcElement.value : event.detail.value});
      },
      openDrawer:function(event){
        if (this.getData('disabled')) return false;
        var contentStyle = this.getData('contentStyle');
        var show = this.getData('show');
        if (!show && G.platform == 'Web') {
          var rect = G.getBoundingClientRect(event.srcElement);
          rect.bottom = 'auto'
          rect.right = 'auto'
          rect.top += rect.height
          if (!rect.trueWidth) {
            rect.left = event.clientX;
            rect.top = event.clientY + 40;
          }
          if(rect.left + rect.width > window.innerWidth){
            rect.left = 'auto'
            rect.right = '0px'
          }
          if(280 + rect.top > window.innerHeight - 16){
            rect.top = 'auto'
            rect.bottom = '16px'
          }
          rect.left = rect.left > 0 ? rect.left + 'px' : rect.left
          rect.right = rect.right > 0 ? rect.right + 'px' : rect.right
          rect.top = rect.top > 0 ? rect.top + 'px' : rect.top
          rect.bottom = rect.bottom > 0 ? rect.bottom + 'px' : rect.bottom
          contentStyle = 'left:{left};bottom:{bottom};top:{top};right:{right};width:300px;background:#fff;box-shadow: 0 2px 4px rgba(0,0,0,0.2);border-radius:3px;'._eval(rect)
        }
        this.setData({ show: !show, contentStyle: contentStyle });
        if (!show) this.load();
      },
      buildList:function(){
        var _this = this;
        var config = this.getData('listData');
        config.data = null;
        var data = this.getData('data') || {},searchKey = this.getData('searchKey'),skey = this.getData('skey'),sitem = this.getData('sitem');
        data[searchKey] = this.getData('search') || undefined;
        if(this.getData('searchRegex') && data[searchKey]) data[searchKey] = { $regex: data[searchKey] };
        config.get = {
          url:this.getData('url'),
          meth:this.getData('meth'),
          data: data
        }
        config.addDataChange = function(){
          if(this[skey] == undefined) this[skey] = G.string(skey)._eval(this);
          if(sitem && this[sitem] == undefined) this[sitem] = G.string(sitem)._eval(this);
          _this.triggerEvent('adddatachange', this);
        }
        return G.list(config);
      },
      load:function(){
        var _this = this;
        this.buildList().load(function(){
          _this.setData({ listData: this.getData() })
        });
      },
      refresh:function(){
        var _this = this;
        this.buildList().refresh(function () {
          _this.setData({ listData:this.getData() })
        });
      },
      change: function (event) {
        var index = event.currentTarget.dataset.index;
        this.setData({ index1:index });
        this.submit();
      },
      clear:function(){
        if (this.getData('disabled')) return false;
        var value1 = {},vkey = this.getData('vkey'),skey = this.getData('skey');
        value1[vkey] = '';
        value1[skey] = '';
        this.setData({ show: false,value1:value1,index1:-1 });
        this.triggerEvent('change', { value: {}, id: this.getData('name'), index: this.getData('index') });
      },
      submit:function(){
        if (this.getData('disabled')) return false;
        var index1 = this.getData('index1'),value1 = this.getData('listData').rows[index1];
        this.setData({ show: false,value1:value1 });
        this.triggerEvent('change', { value: value1, id: this.getData('name'), index: this.getData('index') });
      }
    },
    mounted: function () {
      var contentStyle = '';
      if (G.platform == 'Web') contentStyle = 'left:0px;top:48px;right:auto;width:200px;background:rgb(56, 56, 56);'
      this.setData({ contentStyle: contentStyle});
      this.filterValue(this.getData('value'))
    }
  })
})(Y)
// unitId:{
//   label:'所属校友会',
//   attr:{
//     skey: 'name',
//     vkey: 'unitId',
//     url: '/api/model/unit',
//     canClear:true,
//     title: '请选择所属校友会'
//   },
//   type:'onlyselect'
// }
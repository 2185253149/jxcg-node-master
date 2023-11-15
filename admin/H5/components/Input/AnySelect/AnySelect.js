(function (G) {
  window["components_Input_AnySelect_AnySelect"]({
  "component": true,
  "usingComponents": {
    "drawer": "/components/Drawer/Drawer",
    "liststatus": "/components/List/Status/Status"
  }
},{
template:'#TEMPLATE_components_Input_AnySelect_AnySelect',

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
      placeholder:{
        type: String,
        default: ''
      },
      skey:{
        type:String,
        default:'name'
      },
      value: {
        type: Object,
        default: {},
        observer: function (newValue, oldValue) {
          this.filterValue(newValue);
        }
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
        default:false
      },
      showValue:{
        type:Boolean,
        default:false
      },
      searchKey:{
        type:String,
        default:'name'
      },
      url:{
        type:String
      },
      data:{
        type:Object,
        default:{}
      },
      title:{
        type:String,
        default:'请选择'
      }
    },
    data: function () {
      return {
        disClicks:'',
        show:false,
        contentStyle:'',
        search:'',
        values:'',
        valuesSelect:[],
        listData: G.list().getData()
      }
    },
    mounted(){
      this.filterValue(this.getData('value'))
      // _this.selectComponent('#productAnySelect').open(event.event, {
      //   value: _this.selectComponent('#listpage').getRows(),
      //   contentStyle:G.platform == 'Web' ? 'right:16px;left:auto;' : ''
      // })
    },
    methods: {
      filterValue:function(value){
        if(value && typeof value == 'string') {
          if(value == JSON.stringify(this.getData('valuesSelect'))) return
          value = JSON.parse(value)
        }
        var vkey = this.getData('vkey'),skey = this.getData('skey'),disClicks = '|',values = []
        for(var i = 0; i < value.length; i ++) {
          disClicks += value[i][vkey] + '|'
          values.push(value[i][skey])
        }
        this.setData({ disClicks:disClicks,valuesSelect:value,values:values.join(',') });
      },
      changeSearch:function(event){
        this.setData({ search: event.srcElement ? event.srcElement.value : event.detail.value});
      },
      tapOpen:function(event){
        if(this.getData('showValue')) this.open(event,{
          //value:this.getData('valuesSelect')
        })
      },
      open:function(event,args){
        if (this.getData('disabled')) return false;
        args = args || {};
        var vkey = this.getData('vkey'),disClicks = '|';
        if(args.value instanceof Array) for(var i = 0; i < args.value.length; i ++) disClicks += args.value[i][vkey] + '|'
        var contentStyle = this.getData('contentStyle');
        if (G.platform == 'Web') {
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
        args.contentStyle = contentStyle + (args.contentStyle || '');
        args.disClicks = args.disClicks || disClicks;
        args.show = true;
        args.listData = G.list().getData();
        this.setData(args);
        this.load();
      },
      close:function(){
        this.setData({ show: false });
      },
      buildList:function(){
        var _this = this;
        var config = this.getData('listData');
        config.data = null;
        var data = this.getData('data') || {},searchKey = this.getData('searchKey'),skey = this.getData('skey'),sitem = this.getData('sitem');
        data[searchKey] = this.getData('search') || undefined;
        if(data[searchKey]) data[searchKey] = { $regex: data[searchKey] };
        config.get = {
          url:this.getData('url'),
          data: data
        }
        config.idKey = this.getData('vkey');
        var disClicks = this.getData('disClicks');
        config.disClicks = disClicks;
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
      checkn: function (event) {
        var _this = this;
        var list = this.buildList();
        list.checkn(event.currentTarget.dataset.index);
        this.setData({ listData: list.getData() })
      },
      clear:function(){
        if (this.getData('disabled')) return false;
        this.setData({ show: false,values:'',valuesSelect:[] });
        this.triggerEvent('change', { value: [], id: this.getData('name'), index: this.getData('index') });
      },
      getValues(values){
        var skey = this.getData('skey')
        let valueString = []
        for(let i = 0; i < values.length; i ++){
          valueString.push(values[i][skey])
        }
        return valueString.join(',')
      },
      submit:function(){
        if (this.getData('disabled')) return false;
        var skey = this.getData('skey'),vkey = this.getData('vkey')
        let values = this.buildList().val(),_values = []
        for(let i = 0; i < values.length; i ++){
          let data = {}
          data[skey] = values[i][skey]
          data[vkey] = values[i][vkey]
          _values.push(data)
        }
        this.setData({ show: false,values:this.getValues(_values),valuesSelect:_values });
        this.triggerEvent('change', { value: this.getData('showValue') ? JSON.stringify(_values) : _values, id: this.getData('name'), index: this.getData('index') });
      }
    }
  })
})(Y)

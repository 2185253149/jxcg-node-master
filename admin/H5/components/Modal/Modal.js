(function (G) {
  window["components_Modal_Modal"]({
  "component": true,
  "usingComponents": {}
},{
template:'#TEMPLATE_components_Modal_Modal',

    options: {
      multipleSlots: true
    },
    props: {
      oid:{
        type:String,
        observer:function(newValue,oldValue){
          this.setStyle();
        }
      },
      visible:{
        type:Boolean,
        default:false
      },
      title: {
        type: String,
        default:'提示'
      },
      content: {
        type: String
      },
      backgroundStyle:{
        type:String
      },
      showCancel: {
        type: Boolean,
        default: true
      },
      cancelText: {
        type: String,
        default: '取消'
      },
      cancelColor:{
        type: String,
        default: '#000000'
      },
      showConfirm: {
        type: Boolean,
        default: true
      },
      confirmText: {
        type: String,
        default: '确定'
      },
      titleStyle:{
        type:String,
        default:''
      },
      confirmColor: {
        type: String,
        default: '#3CC51F'
      },
      contentStyle:{
        type: String,
        default: ''
      },
      confirmBoxStyle:{
        type: String,
        default: ''
      }
    },
    data: function () {
      return {
        cancelStyle:{},
        confirmStyle:{}
      }
    },
    methods: {
      _fail: function (event) {
        var ret = { cancel: true };
        this.triggerEvent('fail', ret);
        this._complete(ret);
      },
      _success: function () {
        var ret = { confirm: true },_this = this;
        this.triggerEvent('success', ret);
        _this._complete(ret);
      },
      _complete:function(ret){
        this.triggerEvent('complete', ret);
      },
      show: function () {
        this.setData({ visible:true});
      },
      hide: function () {
        this.setData({ visible: false });
      },
      setStyle:function(){
        this.setData({
          cancelStyle:{color:this.getData('cancelColor')},
          confirmStyle: { color: this.getData('confirmColor') }
        })
      }
    },
    mounted:function(){
      this.setStyle();
    }
  })
})(Y)
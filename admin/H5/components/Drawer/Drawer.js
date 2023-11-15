(function (G) {
  window["components_Drawer_Drawer"]({
  "component": true,
  "usingComponents": {}
},{
template:'#TEMPLATE_components_Drawer_Drawer',

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
        default:false,
        observer:function(newValue,oldValue){
          G.canPullDownRefresh = !newValue;
        }
      },
      coverStyle:{
        type: String,
        default: ''
      },
      contentStyle:{
        type: String,
        default: ''
      }
    },
    methods: {
      _close: function (event) {
        G.canPullDownRefresh = true;
        this.triggerEvent('close');
      }
    }
  })
})(Y)
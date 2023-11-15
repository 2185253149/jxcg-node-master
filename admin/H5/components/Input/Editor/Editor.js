(function (G) {
  window["components_Input_Editor_Editor"]({
  "component": true,
  "usingComponents": {
    "mixinput": "/components/Input/Mixinput/Mixinput"
  }
},{
template:'#TEMPLATE_components_Input_Editor_Editor',

    props: {
      name: {
        type: String,
        default:G.guid()
      },
      index: {
        type: Number
      },
      disabled: {
        type: Boolean,
        default: false
      },
      value: {
        type: String,
        default: '',
        observer: function (newValue, oldValue) {
          this.fliter(newValue);
        }
      },
      placeholder: {
        type: String,
        default: ''
      },
      file:{
        type:Boolean,
        default:false
      },
      attr:{
        type:Object,
        default:{}
      }
    },
    data: function () {
      return {
        platform: G.platform,
        value1: '',
        heightStyle:'100%'
      }
    },
    methods: {
      change: function (event) {
        var detail = event.detail;
        this.fliter(detail.html);
        this.triggerEvent('change', { value: detail.html,detail, id: this.getData('name'), index: this.getData('index') });
      },
      fliter:function(value){
        this.setData({ value1: value });
        if(this.editor) this.editor.setContents({html:value});
      }
    },
    mounted: function () {
      let name = this.getData('name'),attr = this.getData('attr') || {};
      if(this.getData('platform') == 'Web'){
        this.editor = new G.RichEditor(this.$refs[name],{
          ...attr,
          name,
          placeholder:this.getData('placeholder'),
          value:this.getData('value'),
          bindinput:this.change
        });
      }else{
        this.setData({heightStyle:attr.height ? attr.height + 'rpx' : '100%;'});
        this.createSelectorQuery().select('#' + name).context((res)=> {
          this.editor = res.context;
          this.fliter(this.getData('value'));		
        }).exec()
      }
    }
  })
})(Y)

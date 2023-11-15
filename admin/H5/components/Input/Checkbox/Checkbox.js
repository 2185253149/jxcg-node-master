(function (G) {
  window["components_Input_Checkbox_Checkbox"]({
  "component": true,
  "usingComponents": {}
},{
template:'#TEMPLATE_components_Input_Checkbox_Checkbox',

    props: {
      name:{
        type:String,
        observer:function(newValue,oldValue){
          this.setStyle();
        }
      },
      index: {
        type: Number,
        observer: function (newValue, oldValue) {
          this.setStyle();
        }
      },
      checked: {
        type: Boolean,
        default: false,
        observer: function (newValue, oldValue) {
          this.setStyle(newValue);
        }
      },
      size: {
        type: Number,
        default: 23
      },
      type: {
        type: String,
        default: 'checkbox'
      },
      items:{
        type:Boolean,
        default: true
      },
      color:{
        type:String,
        default:'#4b83d6'
      },
      disabled:{
        type:Boolean,
        default:false
      }
    },
    data:function(){
      return {
        styleBox: '',
        isChecked:false
      }
    },
    methods:{
      change:function(){
        if (this.getData('disabled')) return false;
        if(this.getData('items') && this.getData('type') == 'radio' && this.getData('isChecked')) return false;
        var isChecked = this.getData('isChecked');
        this.setStyle(!isChecked);
        this.triggerEvent('change', { value: !isChecked,id:this.getData('name'),index:this.getData('index') });
      },
      setStyle:function(isChecked){
        isChecked = isChecked == undefined ? this.getData('isChecked') : isChecked;
        var size = this.getData('size'), type = this.getData('type'),color = this.getData('color');
        if (G.platform == 'WeChatMiniApp' || G.platform == 'AlipayMiniApp'){
          size *= 2;
        } else if (G.platform == 'Web'){
          size -= 2;
        }
        var style = {
          size: size, 
          color: color,
          radius: type == 'checkbox' ? 0 : (size / 2),
          borderColor: !isChecked || type == 'checkbox' ? color : 'rgba(0,0,0,0)',
        }
        this.setData({
          styleBox: G.styleSheet('width: {size}rpx; height: {size}rpx;margin-right:4rpx;border:1rpx solid {borderColor};border-radius: {radius}rpx;',style),
          isChecked: isChecked
        })
      }
    },
    mounted:function(){
      this.setStyle(this.getData('checked'));
    }
  })
})(Y)

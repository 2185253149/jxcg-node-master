(function (G) {
  var timeout = '', interval = '', _value = '';
  window["components_Input_Number_Number"]({
  "component": true,
  "usingComponents": {}
},{
template:'#TEMPLATE_components_Input_Number_Number',

    props: {
      index:{
        type:String,
        observer:function(newValue,oldValue){
          this.fliterValue()
        }
      },
      name:{
        type:String,
        observer:function(newValue,oldValue){
          this.fliterValue()
        }
      },
      value: {
        type: Number,
        default:1,
        observer:function(newValue,oldValue){
          this.fliterValue()
        }
      },
      min:{
        type:Number,
        default:0,
        observer:function(newValue,oldValue){
          this.fliterValue()
        }
      },
      max: {
        type: Number,
        observer:function(newValue,oldValue){
          this.fliterValue()
        }
      },
      dataset:{
        type:String
      }
    },
    data:function(){
      return {
        number:1
      }
    },
    mounted:function(){
      this.fliterValue()
    },
    methods: {
      fliterValue:function(){
        var number = this.getData('value'),min = this.getData('min'),max = this.getData('max');
        if(number > max) number = max;
        if(number < min) number = min;
        this.setData({number:number})
      },
      tap:function(event){
        this['_' + event.currentTarget.dataset.type]();
      },
      start: function (event){
        var _this = this, func = this['_' + event.currentTarget.dataset.type];
        timeout = setTimeout(function(){
          timeout = '';
          interval = setInterval(function(){
            func.call(_this);
          },100)
        },350)
      },
      end: function (event){
        if (timeout) {
          clearTimeout(timeout);
          timeout = '';
        }
        if(interval){
          clearInterval(interval);
          interval = '';
        }
      },
      _add: function () {
        var number = this.getData('number') + 1, max = this.getData('max');
        if(max && number > max) {
          number = max;
          G.showToast({title:'不能再多了',icon:'none'})
        }else{
          this._change(number);
        }
      },
      _minus: function () {
        var number = this.getData('number') - 1, min = this.getData('min');
        if (number < min) {
          number = min;
          G.showToast({title:'不能再少了',icon:'none'})
        }else{
          this._change(number);
        }
      },
      _input:function(event){
        this._change(event.detail.value);
      },
      _focus: function (event){
        _value = event.detail.value;
      },
      _blur:function(event){
        var value = event.detail.value;
        if (!/-?\d/.test(value) || !(value <= this.getData('max') && value >= this.getData('min'))) {
          this._change(_value);
        }
      },
      _change:function(number){
        this.setData({ number: number });
        this.triggerEvent('change', { value: number, index:this.getData('index'), id: this.getData('name'),dataset: this.getData('dataset') });
      },
      val:function(number){
        if(number == undefined){
          return this.getData('number');
        }else{
          this._change(number);
        }
      }
    }
  })
})(Y)

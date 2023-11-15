(function (G) {
  window["components_Input_Customer_Web_Index"]({
  "component": true,
  "usingComponents": {
    "maphwpoint":"/components/Input/Map/HwPoint/map",
    "userselect":"/components/Input/UserSelect/Web/index"
  }
},{
template:'#TEMPLATE_components_Input_Customer_Web_Index',

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
      item:{
        type: Object,
        default: {},
      },
      attr:{
        type:Object,
        default:{}
      }
    },
    data: function () {
      return {
        value1: [],
        map:'',
        markers:{}
      }
    },
    methods: {
      change(event){
        this.triggerEvent('change', event.detail)
      },
      fliter(value){
        //if(value == JSON.stringify(this.value1)) return
        //this.setData({ value1: G.string(value).parse([]) });
      }
    },
    mounted: function () {
      
    }
  })
})(Y)

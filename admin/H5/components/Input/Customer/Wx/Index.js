/* UNMINIFY */
(function (G) {
  window["components_Input_Customer_Wx_Index"]({
  "component": true,
  "usingComponents": {
  }
},{
template:'#TEMPLATE_components_Input_Customer_Wx_Index',

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
      
    },
    mounted: function () {
      
    }
  })
})(Y)

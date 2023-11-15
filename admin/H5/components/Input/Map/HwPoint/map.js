/* UNMINIFY */
(function (G) {
    window["components_Input_Map_HwPoint_map"]({
    "component": true,
    "usingComponents": {
        "webmappoint":"/components/Input/Map/Point/Point",
        "webmappolygon":"/components/Input/Map/Polygon/Polygon"
    }
  },{
  template:'#TEMPLATE_components_Input_Map_HwPoint_map',
  
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
        attr:{
          type:Object,
          default:{}
        },
        cename:{
          type:String
        }
      },
      data: function () {
        return {
            options: [],
            selectValue: '',
            list: [],
            loading: false,
            states: [],
            units:[],
            query:'',
            unitValue:'hw',
            typeValue:'',
            types:{
                'hw_res_road':'道路',
                'hw_facility_toilet':'公厕',
                'hw_facility_post':'劳动者港湾',
                'hw_facility_transit':'垃圾中转站',
                'hw_facility_collect':'垃圾收集点',
                'hw_facility_water_pile':'水车加水柱',
                'hw_facility_advertising':'户外广告',
                'hw_facility_septic_tank':'化粪池',
                'hw_facility_outfit':'垃圾分类设施'
            },
            typeArray:[],
            address:''
        }
      },
      methods: {
        remoteMethod(query) {
            this.loading = true;
            let papm = { unitId:{$regex:this.unitValue} }
            if(query) papm.name = {$regex:query}
            if(this.typeValue) papm.type = this.typeValue
            G.get('/api/model/facility', papm).then(res => {
                this.loading = false;
                if(res.length){
                    for(let i = 0; i < res.length; i ++){
                        res[i].name = `[${this.types[res[i].type] || '其它'}]${res[i].name}`
                        res.value = JSON.stringify([[res[i].longitude,res[i].latitude]])
                    }
                    this.options = res
                }else{
                    this.options = []
                }
            })
        },
        fliter(value){
            if(value == JSON.stringify(this.value1)) return
            //this.setData({ value1: G.string(value).parse([]) });
        },
        uChange(){
            this.selectValue = ''
            this.remoteMethod()
        },
        fChange(event){
            for(let i = 0; i < this.options.length; i ++){
              if(this.options[i].id == event){
                let lon_lat = [this.options[i].longitude,this.options[i].latitude]
                if(this.options[i].lat_lon_array){
                  let lat_lon_array = JSON.parse(this.options[i].lat_lon_array)
                  if(lat_lon_array[0] && lat_lon_array[0][0]) {
                    lon_lat = lat_lon_array[0][0]
                  }else{
                    G.toask('该区域无坐标数据')
                  }
                }
                let value = []
                if(lon_lat[0] && lon_lat[1]){
                  try{
                    value = JSON.parse(this.getData('value'))
                  }catch(e){

                  }
                  value.push(lon_lat)
                  this.address = this.options[i].address
                  this.triggerEvent('change', {index:this.getData('index'),facilityId:this.options[i].id,facilityName:this.options[i].name,unitId:this.options[i].unitId,address:this.options[i].address,id:this.getData('name'),longitude:this.options[i].longitude,latitude:this.options[i].latitude, event, value:JSON.stringify(value)})
                }
                return false
              }
            }
        },
        change(event){
          G.get('/v1/map/geocodeRegeo',{...event.detail}).then(res => {
            event.detail.address = res.regeocode.formatted_address
            this.address = event.detail.address
            this.triggerEvent('change', event.detail)
          })
        }
      },
      mounted: function () {
        this.typeArray = [{name:'全部',value:''}]
        for(let key in this.types) this.typeArray.push({name:this.types[key],value:key})
        G.get('/api/model/unit',{unitId:'all'}).then(res => {
            this.units = res
            this.uChange()
        })
      }
    })
  })(Y)
  
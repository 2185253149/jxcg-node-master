(function (G) {
    window["pages_inspection_ranking_ranking"]({
    "component": true,
    "usingComponents": {
    }
  },{
  template:'#TEMPLATE_pages_inspection_ranking_ranking',
      props: {
        currentYear:{
            type:String,
        }
      },
      data:function(){
        return {
            type:'部门',
            year:this.currentYear,
            unit:[]
        }
      },
      methods:{
        // 获取用户巡查数据
       getNum(){
        let year = parseInt(this.year) || 2022
        G.get('{JAVAURL}/dw/getUserPatrolFrequencyYear?year='+year).then(res=>{
            console.log(res.data)
            let arr = Object.keys(res.data).map(val => ({
              name: val,
              value: res.data[val]
            }))
            let arr1 = arr.sort(function(a,b){
                return b.value-a.value
            })
            this.unit = arr1
        })
       }
      },
      mounted(){
      },
      created(){
        this.getNum()
      }
    })
  })(Y)
  
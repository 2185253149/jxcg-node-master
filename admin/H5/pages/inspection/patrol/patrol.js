(function (G) {
    window["pages_inspection_patrol_patrol"]({
    "component": true,
    "usingComponents": {
    }
  },{
  template:'#TEMPLATE_pages_inspection_patrol_patrol',
      props: {
      },
      data:function(){
        return {
            mypatrol: { width: "100%", height: "400px"},
            year:'2022',
            inspectionNum:[],//次数列表
            inspectionType:[],//类型列表
            typeName:[],
        }
      },
      methods:{
          // 环卫所巡查统计
          initEcharts(){
              // 柱状图
              const option = {
                  legend: {},
                  tooltip: {
                      trigger: 'axis'//显示一种数据所有的数据量
                  },
                  dataset: {
                      source: [
                          ['巡查统计', '日常检查考核', '月度集中考核', '公众监督考核','重大事项考核'],
                          ['杨家坪环卫所', 66,12,5,2],
                          ['石桥铺环卫所', 60,8,6,3],
                          ['中梁山环卫所', 69,15,5,3]
                      ]
                  },
                  xAxis: { type: 'category' },
                  yAxis: {},
                  label: {
                      show: true,
                      position: 'top'
                  },
                  series: [{type: 'bar',},{type: 'bar',},{type: 'bar',},{type: 'bar',}],
                  color:['#007FAA','#227efd','#6fa9fd','#bdf1fc'],
              };
              const myChart = echarts.init(document.getElementById("numpatrol"));
              myChart.setOption(option);
              //随着屏幕大小调节图表
              window.addEventListener("resize", () => {
                  myChart.resize();
              });
          },

        //   // 杨家坪环卫所巡查统计
        // initEcharts(){
        //     // 饼图
        //     const option = {
        //       title: {
        //         text: '杨家坪环卫所巡查统计',
        //         x:'center',
        //         y:'bottom',
        //       },
        //       tooltip: {
        //         trigger: 'item',
        //       },
        //       legend: {
        //         orient: 'vertical',
        //         left: 'right',
        //         top:'bottom'
        //       },
        //       color:['#007FAA','#227efd','#6fa9fd','#bdf1fc'],
        //       series: [
        //         {
        //           type: 'pie',
        //           radius: '70%',
        //           // data: this.inspectionNum,
        //           data:[{ name: '日常检查考核', value: '66' },
        //           { name: '月度集中考核', value: '12' },
        //           { name: '公众监督考核', value: '5' },
        //           { name: '重大事项考核', value: '2' }],
        //           itemStyle : {
        //             normal : {
        //               label : {
        //                 show: true,
        //                 position: 'inside',
        //                 formatter: '{b}'+'\n'+'{d}%',
        //                 textStyle : {
        //                   color:'#fff',
        //                   fontSize : 15,
        //                   fontWeight : 'bolder'
        //                }
        //               },
        //               labelLine : {
        //                 show : false
        //               },
        //
        //             },
        //           },
        //           emphasis: {
        //             itemStyle: {
        //               shadowBlur: 10,
        //               shadowOffsetX: 0,
        //               shadowColor: 'rgba(0, 0, 0, 0.5)'
        //             }
        //           }
        //         }
        //       ]
        //     };
        //     const myChart = echarts.init(document.getElementById("numpatrol"));
        //     myChart.setOption(option);
        //     //随着屏幕大小调节图表
        //     window.addEventListener("resize", () => {
        //       myChart.resize();
        //     });
        // },
        // //石桥铺环卫所巡查统计
        // initEcharts1(){
        //     // 饼图
        //     const option = {
        //       title: {
        //           text: '石桥铺环卫所巡查统计',
        //           x:'center',
        //           y:'bottom'
        //       },
        //       tooltip: {
        //           trigger: 'item',
        //           // formatter: "{a} <br/>{b}: {c} ({d}%)" // 鼠标悬浮在各分区时的提示内容
        //       },
        //       legend: {
        //           orient: 'vertical',
        //           left: 'right',
        //           top:'bottom',
        //           // data:this.typeName
        //           data:[{ name: '日常检查考核', value: '60' },
        //               { name: '月度集中考核', value: '8' },
        //               { name: '公众监督考核', value: '6' },
        //               { name: '重大事项考核', value: '3' }],
        //       },
        //       series: [{
        //           type: 'pie',
        //           radius: '70%',
        //           itemStyle : {
        //             normal : {
        //               label : {
        //                 show: true,
        //                 position: 'inside',
        //                 formatter: '{b}\n{d}%',
        //                 textStyle : {
        //                   color:'#fff',
        //                   fontSize : 15,
        //                   fontWeight : 'bolder'
        //                }
        //               },
        //               labelLine : {
        //                 show : false
        //               },
        //
        //             },
        //           },
        //           color:['#007FAA','#227efd','#6fa9fd','#bdf1fc'],
        //           emphasis: {
        //               itemStyle: {
        //                   shadowBlur: 10,
        //                   shadowOffsetX: 0,
        //                   shadowColor: 'rgba(0, 0, 0, 0.5)'
        //               }
        //           },
        //           // data: this.inspectionType
        //           data:[{ name: '日常检查考核', value: '60' },
        //               { name: '月度集中考核', value: '8' },
        //               { name: '公众监督考核', value: '6' },
        //               { name: '重大事项考核', value: '3' }],
        //       }]
        //   };
        //     const myChart = echarts.init(document.getElementById("typepatrol"));
        //     myChart.setOption(option);
        //     //随着屏幕大小调节图表
        //     window.addEventListener("resize", () => {
        //       myChart.resize();
        //     });
        // },
        //   // 中梁山环卫所巡查统计
        //   initEcharts2(){
        //       // 饼图
        //       const option = {
        //           title: {
        //               text: '中梁山环卫所巡查统计',
        //               x:'center',
        //               y:'bottom',
        //           },
        //           tooltip: {
        //               trigger: 'item',
        //           },
        //           legend: {
        //               orient: 'vertical',
        //               left: 'right',
        //               top:'bottom'
        //           },
        //           color:['#007FAA','#227efd','#6fa9fd','#bdf1fc'],
        //           series: [
        //               {
        //                   type: 'pie',
        //                   radius: '70%',
        //                   // data: this.inspectionNum,
        //                   data:[{ name: '日常检查考核', value: '69' },
        //                       { name: '月度集中考核', value: '15' },
        //                       { name: '公众监督考核', value: '6' },
        //                       { name: '重大事项考核', value: '3' }],
        //                   itemStyle : {
        //                       normal : {
        //                           label : {
        //                               show: true,
        //                               position: 'inside',
        //                               formatter: '{b}'+'\n'+'{d}%',
        //                               textStyle : {
        //                                   color:'#fff',
        //                                   fontSize : 15,
        //                                   fontWeight : 'bolder'
        //                               }
        //                           },
        //                           labelLine : {
        //                               show : false
        //                           },
        //
        //                       },
        //                   },
        //                   emphasis: {
        //                       itemStyle: {
        //                           shadowBlur: 10,
        //                           shadowOffsetX: 0,
        //                           shadowColor: 'rgba(0, 0, 0, 0.5)'
        //                       }
        //                   }
        //               }
        //           ]
        //       };
        //       const myChart = echarts.init(document.getElementById("numpatrols"));
        //       myChart.setOption(option);
        //       //随着屏幕大小调节图表
        //       window.addEventListener("resize", () => {
        //           myChart.resize();
        //       });
        //   },
          // 获取巡查次数部门
        getInspectionNum(){
          let year = parseInt(this.year)
          // G.get('{JAVAURL}/dw/getUnitPatrolpatrolYear?year='+year).then(res=>{
          //   let arr = [],arr1=[]
          //   arr = Object.keys(res.data).map(val => ({
          //     name: val,
          //     value: res.data[val]
          //   }))
          //   this.inspectionNum = arr
          // })
          setTimeout(() =>{
            this.initEcharts()
          },1000)
        },
        // 获取巡查类型
        getInspectionType(){
          let year = parseInt(this.year)
          // G.get('{JAVAURL}/dw/getTypePatrolpatrolYear?year='+year).then(res=>{
          //   console.log(res)
          //   let arr = [],arr1=[]
          //   arr = Object.keys(res.data).map(val => ({
          //     name: val,
          //     value: res.data[val]
          //   }))
          //   this.inspectionType = arr
          //   for(let i=0;i<arr.length;i++){
          //     arr1.push(arr[i].name)
          //   }
          //   this.typeName = arr1
          // })
          setTimeout(() =>{
            this.initEcharts1()
              this.initEcharts2()
          },1000)
        },
        changeNum(){
          if(!this.year){
            this.$message({
                showClose: true,
                message: '时间不能为空',
                type: 'warning'
            });
            this.year = '2022'
        }
          this.getInspectionNum()
          this.getInspectionType()
          this.$emit('getYear',this.year)
        }
      },
      mounted(){
     
      },
      created(){
        this.getInspectionNum()
        this.getInspectionType()
      }
    })
  })(Y)
  
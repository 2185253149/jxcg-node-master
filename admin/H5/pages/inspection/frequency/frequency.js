(function (G) {
    window["pages_inspection_frequency_frequency"]({
    "component": true,
    "usingComponents": {
    }
  },{
  template:'#TEMPLATE_pages_inspection_frequency_frequency',
      props: {
      },
      data:function(){
        return {
            myFrequency: { width: "100%", height: "380px" },
            year:'2023-03',
            inspectionNum:[],//次数列表
            inspectionType:[],//类型列表
            typeName:[],
        }
      },
      methods:{
        // 三方公司巡查统计
          initEcharts() {
              G.get('{JAVAURL}/dw/getAssessThirdCompanyNum').then(res => {
                  const data = res.data;
                  if (data.length === 0 || data[0].thirdCompany === "0") {
                      // 数据为空或数据为0，显示"暂无数据"
                      const noDataText = document.createElement('div');
                      noDataText.className = 'no-data-text';
                      noDataText.innerText = '暂无数据';
                      this.$refs.numFrequency.appendChild(noDataText);
                  } else {
                      const thirdCompany = parseInt(data[0].thirdCompany);

                      const option = {
                          title: {
                              text: '三方公司巡查统计',
                              x: 'center',
                              y: 'bottom',
                          },
                          tooltip: {
                              trigger: 'item',
                          },
                          color: ['#007FAA', '#227efd', '#6fa9fd', '#bdf1fc'],
                          series: [
                              {
                                  type: 'pie',
                                  radius: '70%',
                                  data: [
                                      { name: '三方公司', value: thirdCompany },
                                  ],
                                  itemStyle: {
                                      normal: {
                                          label: {
                                              show: true,
                                              position: 'inside',
                                              formatter: '{b}\n{d}%',
                                              textStyle: {
                                                  color: '#fff',
                                                  fontSize: 15,
                                                  fontWeight: 'bolder',
                                              },
                                          },
                                          labelLine: {
                                              show: false,
                                          },
                                      },
                                  },
                                  emphasis: {
                                      itemStyle: {
                                          shadowBlur: 10,
                                          shadowOffsetX: 0,
                                          shadowColor: 'rgba(0, 0, 0, 0.5)',
                                      },
                                  },
                              },
                          ],
                      };

                      this.tsChart = echarts.init(this.$refs.numFrequency);
                      this.tsChart.setOption(option);
                  }
              });

          },
          //环卫处巡查统计
          initEcharts1() {
              G.get('{JAVAURL}/dw/getAssessNumByJobType').then(res => {
                  const data = res.data;
                  if (data.length === 0 || data[0].department === "0") {
                      // 数据为空或为0，显示"暂无数据"
                      const noDataText = document.createElement('div');
                      noDataText.className = 'no-data-text';
                      noDataText.innerText = '暂无数据';
                      this.$refs.typeFrequency.appendChild(noDataText);
                  } else {
                      // 饼图
                      const chartData = [
                          { name: '部门名称', value: data[0].department }
                      ];

                      const option = {
                          title: {
                              text: '环卫处巡查统计',
                              x: 'center',
                              y: 'bottom'
                          },
                          tooltip: {
                              trigger: 'item'
                          },
                          series: [{
                              name: '',
                              type: 'pie',
                              radius: ['30%', '70%'],
                              itemStyle: {
                                  normal: {
                                      label: {
                                          show: true,
                                          position: 'inside',
                                          formatter: '{b}\n{d}%',
                                          textStyle: {
                                              color: '#fff',
                                              fontSize: 15,
                                              fontWeight: 'bolder'
                                          }
                                      },
                                      labelLine: {
                                          show: false
                                      }
                                  }
                              },
                              color: ['#007FAA', '#227efd', '#6fa9fd', '#bdf1fc'],
                              emphasis: {
                                  itemStyle: {
                                      shadowBlur: 10,
                                      shadowOffsetX: 0,
                                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                                  },
                              }
                          }]
                      };

                      const typeFrequencyChart = echarts.init(this.$refs.typeFrequency);
                      typeFrequencyChart.setOption(option);
                  }
              });
          },



          // 获取巡查次数部门
        getInspectionNum(){
          let year = parseInt(this.year)
          G.get('{JAVAURL}/dw/getUnitPatrolFrequencyYear?year='+year).then(res=>{
            let arr = [],arr1=[]
            arr = Object.keys(res.data).map(val => ({
              name: val,
              value: res.data[val]
            }))
            this.inspectionNum = arr
          })
          setTimeout(() =>{
            this.initEcharts()
          },1000)
        },
        // 获取巡查类型
        getInspectionType(){
          let year = parseInt(this.year)
          G.get('{JAVAURL}/dw/getTypePatrolFrequencyYear?year='+year).then(res=>{
            console.log(res)
            let arr = [],arr1=[]
            arr = Object.keys(res.data).map(val => ({
              name: val,
              value: res.data[val]
            }))
            this.inspectionType = arr
            for(let i=0;i<arr.length;i++){
              arr1.push(arr[i].name)
            }
            this.typeName = arr1
          })
          setTimeout(() =>{
            this.initEcharts1()
          },1000)
        },
        changeTime(){
          if(!this.year){
            this.$message({
                showClose: true,
                message: '时间不能为空',
                type: 'warning'
            });
            this.year = '2023-03'
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
  
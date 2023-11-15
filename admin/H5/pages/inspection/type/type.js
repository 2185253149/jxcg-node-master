(function (G) {
  window["pages_inspection_type_type"]({
    "component": true,
    "usingComponents": {
    }
  }, {
    template: '#TEMPLATE_pages_inspection_type_type',
    props: {
    },
    data: function () {
      return {
        year: '2023-03',//绑定的选择年份
        mytype: { width: '95%', height: '370px' },//折线图样式
        typeX: [],
        typeY: []
      }
    },
    methods: {
      initEcharts() {
        // 折线图
        const option = {
          grid: {
            top: 30,
            left: 40,
            right: 40,
            bottom: 40
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              var res = params[0].name + '\n' + params[0].value + '%';  //可以在这个方法中做改变
              return res;
            }
          },
          color: ['#9dd2fe'],
          xAxis: {
            type: 'category',
            data: this.typeX
          },
          yAxis: [{ // 纵轴标尺固定
            type: 'value',
            scale: true,
            max: 100,
            min:0,
            splitLine: {
              lineStyle: { //设置分割线的样式(图表横线颜色)
                color: ['grey'],
                type: "dashed",
              }
            },
            axisLabel: {
              formatter: '{value}%'
            },
          }],
          series: [
            {
              data: this.typeY,
              type: 'bar',
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    position: 'top',
                    textStyle: {
                      color: 'black',
                      fontSize: 12
                    }
                  }
                }
              },
              barWidth: '20%',
            }
          ]
        };
        const myChart = echarts.init(document.getElementById("type"));
        myChart.setOption(option);
        //随着屏幕大小调节图表
        window.addEventListener("resize", () => {
          myChart.resize();
        });
      },
      // 获取获取类型巡查完成率月度统计
      getType() {
        let year = this.year.split('-')[0]
        let month = this.year.split('-')[1]
        G.get('{JAVAURL}/dw/getTypePatrolCompleteRate?year=' + year + '&month=' + month).then(res => {
          console.log(res.data)
          this.typeX = Object.keys(res.data)
          let arr = Object.values(res.data)
          let arr1 = []
          for (let i = 0; i < arr.length; i++) {
            arr1.push(parseInt(arr[i].split('%')[0]))
          }
          this.typeY = arr1
          setTimeout(() => {
            this.initEcharts()
          }, 500)
        })
      },
      changeTime() {
        if(!this.year){
          this.$message({
            showClose: true,
            message: '时间不能为空',
            type: 'warning'
          });
          this.year = '2023-03'
        }
        this.getType()
      }

    },
    mounted() {
    },
    created() {
      this.getType()
    }
  })
})(Y)

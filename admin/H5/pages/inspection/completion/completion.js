(function (G) {
    window["pages_inspection_completion_completion"]({
        "component": true,
        "usingComponents": {
        }
    }, {
        template: '#TEMPLATE_pages_inspection_completion_completion',
        props: {
        },
        data: function () {
            return {
                year: '2023',//绑定的选择年份
                mycompletion: { width: '95%', height: '370px' },//折线图样式
                unitX: [],
                unitY: []
            }
        },
        methods: {
            initEcharts() {
                // 折线图
                const option = {
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (params) {
                            var res = params[0].name + '\n' + params[0].value + '%';  //可以在这个方法中做改变
                            return res;
                        }
                    },
                    grid: {
                        top: 10,
                        left:40,
                        right: 40,
                        bottom: 40
                    },
                    xAxis: {
                        type: 'category', //坐标轴类型。
                        boundaryGap: false, //坐标轴两边留白策略
                        // data: this.unitX,
                        data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月','八月','九月','十月','十一月','十二月'],
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
                            type: 'line',
                            data: this.unitY,
                            itemStyle: { normal: { label: { show: true } } },

                        },
                    ]
                }
                const myChart = echarts.init(document.getElementById("completionUnit"));
                myChart.setOption(option);
                //随着屏幕大小调节图表
                window.addEventListener("resize", () => {
                    myChart.resize();
                });
            },

            // 获取企业巡查完成率月度统计
            getSucess() {
                let year = parseInt(this.year)
                G.get('{JAVAURL}/dw/getUnitPatrolCompleteRateMonth?year=' + year).then(res => {
                    this.unitX = Object.keys(res.data)
                    let arr = Object.values(res.data)
                    let arr1 = []
                    for (let i = 0; i < arr.length; i++) {
                        arr1.push(parseInt(arr[i].split('%')[0]))
                    }
                    this.unitY = arr1
                    setTimeout(() => {
                        this.initEcharts()
                    }, 500)
                    console.log('ressss',res)
                })
            },
            changeTime(){
                if(!this.year){
                    this.$message({
                        showClose: true,
                        message: '时间不能为空',
                        type: 'warning'
                    });
                    this.year = '2023'
                }
                this.getSucess()
            }
        },
        mounted() {
           
        },
        created() {
            this.getSucess()
        }
    })
})(Y)

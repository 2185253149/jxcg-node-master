(function (G) {
  window["pages_flow_task_detail"]({
  "component": true,
  "usingComponents": {
    "formitems": "/components/Form/Items/Items",
    "mixinput": "/components/Input/Mixinput/Mixinput"
  }
},{
template:'#TEMPLATE_pages_flow_task_detail',
    props: {
      taskId:String
    },
    data:function(){
      return {
        title:'',
        btns:{actions:[]},
        actions:{},
        task:{},
        flow:{},
        details:[],
        userInfo:{},
        form:{
          userId:'',
          remark:'',
          toNodeId:'',
          toUsers:[]
        }
      }
    },
    methods:{
      back(){
        this.$emit('back')
      },
      changeToNodeId(value){
        if(value.detail && value.detail.value) value = value.detail.value
        let models = {},values = { }
        this.form.toNodeId = value
        if(this.actions[value]) {
          models = {
            toUsers:{
              label:'选择处理人',
              rule:{ NotNull:true },
              defaultValue:this.actions[value][0].value,
              attr:{
                actions:this.actions[value]
              },
              type:'checkbox',
              web:true
            },
            remark:{
              label:'处理意见',
              type:'textarea',
              web:true
            }
          }
        }else{
          values.toUsers = this.actions[value] ? this.actions[value][0] : undefined
          models = {
            remark:{
              label:'处理意见',
              type:'textarea',
              web:true
            }
          }
        }
        this.selectComponent('#actionForm').init(models, values, false,[] )
      },
      //节点操作
      action(){
        let node = this.details[this.details.length - 1]
        let nodeForm = this.$refs[node.id][0]
        let data;
        if(nodeForm) {
          data = nodeForm.submit()
          if(!data) return false
        }
        let actionFormData = this.$refs.actionForm.submit()
        if(!actionFormData) return false
        if(actionFormData.toUsers instanceof Array) actionFormData.toUsers = actionFormData.toUsers.join(',')
        let actionName = ''
        for(let i = 0; i < this.btns.actions.length; i ++) {
          if(this.btns.actions[i].value == this.form.toNodeId){
            actionName = this.btns.actions[i].name
            break
          }
        }
        let form = {}
        for(let key in node.form) if(!node.form[key].web) form[key] = node.form[key]
        G.post('/api/model/f_taskDetail', {
          form:JSON.stringify(form),
          data:data ? JSON.stringify(data) : '',
          name:`${node.name}[${actionName}]`,
          status:2,
          userId:this.userInfo.id, 
          toNodeId:this.form.toNodeId,
          f_nodeId:node.id,
          f_taskId:this.task.id,
          f_flowId:node.f_flowId,
          ...actionFormData
        }).then(taskDetail => {
          if(!taskDetail.errorMsg){
            try{
              taskDetail.data = JSON.parse(taskDetail.data)
            }catch(e){
              taskDetail.data = null
            }
            G.get('/api/model/f_node',{ id:this.form.toNodeId }).then(node => {
              //获取当前节点下一步，判断是否叶节点
              G.get('/api/model/f_line', { fromNodeId:node.id }).then(lines => {
                node.status = lines.length ? 1 : 2
                //更新任务
                G.put('/api/model/f_task',{ id:this.task.id,status:node.status,toUsers:actionFormData.toUsers,f_nodeId:this.form.toNodeId || '' }).then(res => {
                  if(!res.errorMsg){
                    let rc = {
                      task:this.task,//流程任务信息
                      currentNode:node,//当前节点信息
                      prevDetail:taskDetail//前一处理结果
                    }
                    //通知业务系统
                    if(this.task.notify_url){
                      G.post(this.task.notify_url, rc).then(res => {
                        if(res.task) G.put('/api/model/f_task',{id:this.task.id, ...res.task}).then(res=>{})
                        this.$emit('back',res)
                      })
                    }else{
                      this.$emit('back',rc)
                    }
                  }
                })
              })
            })
          }
        })
      },
      togget(tit){
        tit.hidden = !tit.hidden
      },
      init(taskId){
        new Promise(next => {//获取任务详情
          G.get('/api/model/f_task',{ 
            id:taskId,
            sql:{
              join:{
                f_flowId:{
                  type: 'LEFT',
                  name: 'f_flow',
                  key: 'id',
                  projection:{
                    notify_url:1,
                    name:'f_flowName'
                  }
                }
              }
            }
           }).then(task => {
            this.task = task
            next()
          })
        }).then(() => {//获取已完成节点并处理
          return new Promise(next => {
            G.get('/api/model/f_taskDetail',{ 
              f_taskId:this.task.id,
              join:'user',
              sql:{
                sort:{ createTime:1 }
              } 
            }).then(details => {
              if(!details.length) details = []
              this.details = []
              for(let i = 0; i < details.length; i ++){
                ((i)=>{
                  details[i].readOnly = true
                  details[i].form = G.merge({tit:{
                    label:`${details[i].name} 由 ${details[i].userName} 于${details[i].createTimeString}完成`,
                    hidden:true,
                    //type:'title',
                    web:true
                  }},details[i].form ? JSON.parse(details[i].form) : {})
                  if(details[i].data) {
                    details[i].data = JSON.parse(details[i].data)
                    if(details[i].remark){
                      details[i].form.remark = { label:'处理意见',type:'textarea' }
                      details[i].data.remark = details[i].remark
                    }
                  }
                  // this.details.push(details[i])
                  // this.$nextTick(() => {
                  //   console.log(this.$refs[details[i].id])
                  //   this.$refs[details[i].id][0].init(details[i].form, details[i].data, true, [])
                  // })
                })(i)
              }
              this.details = details
              //前一步操作指派自己为操作人之一可进行下一步操作
              if(details.length 
                && details[details.length - 1].toUsers 
                && details[details.length - 1].toUsers.indexOf(this.userInfo.id) > -1){
                  next()
              }else{
                this.btns = {actions:[]}
                this.actions = {}
              }
            })
          })
        }).then(() => {//获取当前处理操作
          return new Promise(next => {
            G.get('/api/model/f_line',{ fromNodeId:this.task.f_nodeId }).then(lines => {
              if(lines.length) {
                let btns = {actions:[]}
                let actions = {}
                let promises = []
                for(let i = 0; i < lines.length; i ++){
                  promises.push(new Promise(next => {
                    if(i == 0) this.form.toNodeId = lines[i].toNodeId
                    let users = []
                    if(lines[i].type == 1) lines[i].userType = 'prev'
                    switch(lines[i].userType){
                      case 'start':
                        users = [{ value:this.task.userId,name:'发起人' }]
                        break;
                      case 'prev':
                        users = [{ value:this.details[this.details.length - 1].userId,name:'上一处理人' }]
                        break;
                      case 'self':
                        users = [{ value:this.userInfo.userId,name:'当前处理人' }]
                        break;
                      case 'select':
                        users = G.string(lines[i].users).parse([])
                        // let _users = G.string(lines[i].users).parse([])
                        // //同级或上级部门才能审核
                        // for(let j = 0; j < _users.length; j ++){
                        //   _users[j].unitId = _users[j].unitId || 'hw'
                        //   if(this.task.unitId == _users[j].unitId || (_users[j].unitId + '_').indexOf(this.task.unitId) == 0){
                        //     users.push(_users[j])
                        //   }
                        // }
                        break;
                    }
                    actions[lines[i].toNodeId] = []
                    for(let j = 0; j < users.length; j ++){
                      if(users[j] && users[j].value) actions[lines[i].toNodeId].push(users[j])
                    }
                    btns.actions.push({value:lines[i].toNodeId,name:lines[i].name})
                    next()
                  }))
                }
                Promise.all(promises).then(() => {
                  this.actions = actions
                  this.btns = btns
                  this.changeToNodeId(this.form.toNodeId)
                })
              }
              next()
            })
          })
        }).then(() => {//获取当前处理表单
          return new Promise(next => {
            if(this.task.f_nodeId){
              G.get('/api/model/f_node',{ id:this.task.f_nodeId }).then(node => {
                if(!node.errorMsg) {
                  node.form = G.merge({tit:{
                    label:'当前:' + node.name,
                    type:'title',
                    web:true
                  }},node.form ? JSON.parse(node.form) : {})
                  if(node.data) node.data = JSON.parse(node.data)
                  this.details.push(node)
                }
              })
            }
          })
        })
      }
    },
    mounted(){
      let taskId = this.getData('taskId')
      if(taskId) this.init(taskId)
      this.userInfo = G.Storage.get('userInfo')
    }
  })
})(Y)

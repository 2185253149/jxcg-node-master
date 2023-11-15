# 前端架构

> 基于Vue的前端框架，使用框架提供的组件自适应移动端及PC端
> 前端代码目录admin

## models数据模型

> 后端数据库Entity，前端列表、表单编辑共用数据模型

### rule 校验规则
```
 参数 | 说明 | 示例
 --- | --- | ---
 Name | 姓名 | '张三'
 Phone | 电话号码 | '17215545454'n
 IDCard | 身份证 | '5023145124589654'
 Email | 邮箱 | '313@qq.com'
 Date | 一般日期(使用“-”分隔,例如:2018-01-01) | '2017-12'
 PositiveNum | 正数 | 1.12
 PositiveInt | 正整数 | 1
 NotNull | 不能为空 | 
 MaxLength | 最大长度 | 18
 MinLength | 最小长度 | 6
 MaxNumber | 最大值 | 24
 MinNumber | 最小值 | 12
 Regx | 正则 | '^[a-zA-Z0-9_]{5,12}$_gmi_g_gmi_应该由5-12位数字、大小写字母或下划线组成'
```

### input
+ 普通输入，表单默认输入方式
+ 数据模型适用于mixinput组件，详情参见maxinput组件
```
title: {
    label: '标题',///字段名称
    rule: { NotNull: true,MaxLength:18 },///表单校验规则
    ///defaultValue:'',///默认值
    ///data_type:'VARCHAR(128)',///默认VARCHAR(255)
    ///desc:'这是文章标题字段',///字段描述
    ///index:true,///索引,String/Boolean
    ///unique:true,///唯一指定，true的时候指定此字段为唯一
    ///allWidth: true,///设置pc端占整行
    ///style:'',///Web端CSS样式
    ///unList: true,///设置列表不显示
    attr:{///输入项其他属性
      type:'text',
      placeholder:'请输入标题'///占位符
    },
    ///readOnly:true ///设置只读
    type: 'input'///字段输入类型，默认input
},
```

### select
+ 单选
```
type:{
    label:'类型',
    defaultValue:'article',
    attr:{
        actions: [
            { name: '文章', value: 'article' },
            { name: '新闻', value: 'news' },
            { name: '通知', value: 'notify' },
            { name: '公告', value: 'notice' }
        ]
    },
    type:'select'
},
```
### onlyselect
+ 关联表选择
```
item:{
  id:'unitId',
  label:'所属单位',
  attr:{
    ///skey: 'name',///显示字段，默认name
    ///vkey: 'unitId',///取值字段，默认id
    ///url: '/api/model/unit',///查询API
    ///canClear:true,///是否可清除
    ///title: '请选择所属单位'///标题
  },
  type:'onlyselect'
},

```
+ 建议字段设计时采用表明+Id的方式，同时被关联表如果存在name字段表示名称，可简化attr配置
```
userId:{
  label:'用户',
  type:'onlyselect'
},
```

### image
+ 图片上传
```
images: {
    label: 'LOGO',
    attr: {
      width: 500,///宽带限制
      height: 500,///高度限制
      radius: 250,///圆角
      limit:1///数量限制，默认9张
    },
    type: 'image'
},
```

### file
+ 文件上传
```
files: {
    label: '附件',
    attr: {
      limit:1,///数量限制
      maxSize:200 * 1024 * 1024///大小限制
    },
    type: 'file'
},
```

### textarea
+ 多行输入框
```
digest: {
    label: '摘要',
    unList: true,///一般不显示在列表上
    type: 'textarea'
},
```

### editor
+ 富文本编辑器
```
content: {
    label: '详情',
    type: 'editor'
},
```

### region
+ 省市区选择
```
area: {
    label: '选择城市',
    type: 'region'
},
```

### mappoint
+ 地图选点，以[[longitude,latitude]...]格式保存
```
latLonArray: {
    label: '地图选点',
    data_type:'LONGTEXT',
    attr:{
      max:1//最大选点数,默认1
    },
    type: 'mappoint'
},
```

### mappolygon
+ 地图选区，以[[[longitude,latitude]...]...]格式保存
```
latLonArray: {
    label: '地图选区',
    data_type:'LONGTEXT',
    type: 'mappolygon'
},
```

### date
+ 日期
```
date: {
    label: '日期',
    type: 'date'
},
```

### time
+ 时间
```
time: {
    label: '时间',
    type: 'time'
},
```

### datetime
+ 日期+时间，以时间戳格式保存在数据库中
```
createTime: {
    label: '创建时间',
    type: 'datetime'
},
```

### radio
+ 单选(推荐使用select)
```
sex: {
    label: '性别',
    attr: {
      actions: [
        {
          value: 1,
          name: '男'
        },
        {
          value: 2,
          name: '女'
        }
      ]
    },
    type: 'radio'
},
```

### checkbox
+ 多选
```
tips: {
    label: '标签',
    attr: {
      actions: [
        {
          value: 'java',
          name: 'Java'
        },
        {
          value: 'web',
          name: '前端'
        },
        {
          value: 'test',
          name: '测试'
        },
        {
          value: 'bigdata',
          name: '大数据'
        },
        {
          value: 'ai',
          name: '人工智能'
        }
      ]
    },
    type: 'checkbox'
},
```

### title
+ 对输入项进行分组
```
title1: {
    label: '基本信息',
    type: 'title'
},
```

## 组件

### listtable 
+ 分页列表
```
<template>
  <master :title="title">
    <listpage ref="listpage"></listpage>
  </master>
</template>
<script type="text/javascript">
(function (G) {
G.vue({
  "usingComponents": {///引入组件
    "master": "/components/Master/Master",///母版组件
    "listpage": "/components/List/Page/Page"///通用列表组件
  },
  "enablePullDownRefresh": true
},G.modelList({///配置listpage组件
  	modelName:'article',///entity名称
    title:'新闻',
    listPage(list,query){///query为前一个页面传过来的参数
      list.getUrl = '/api/model/article?type=news';///列表请求API
      list.searchKey = 'title,digest'///搜索字段，来源于列表数据模型
      ///list.canCheck = false ///取消选中按钮 同时取消批量删除
      ///list.canBack = true ///添加返回上一页按钮
      ///list.actions.add = false ///取消新增按钮
      ///list.actions.delet = undefined ///取消行删除按钮
      ///list.actions.edit = undefined ///取消行修改按钮
      // list.models = {/// 列表数据模型，默认使用后台返回对应的模型
      //   id:{
      //     label:'编号'
      //   }
      // }
      list.actions.push = {///定义操作按钮，默认存在修改和删除
        name:'推送',///按钮名称
        action(event){///点击回调
          let item = event.detail///数据
          console.log(item)
          ///推送逻辑
        }
      }
    },
    modeleditquery(edit,event,query){///编辑页面 edit对象，event事件，query前一个页面传过来的参数
      console.log(edit)
      // edit.models = {///编辑数据模型，默认使用后台返回的对应模型
      //   title:{
      //     label:'标题',
      //     type:'input'
      //   }
      // }
      ///edit.readOnly = true ///设置页面只读
      ///edit.meth = 'PUT' ///请求方式
      ///edit.url = '/api/model/article' ///请求地址
    }
  }));
})(Y)
</script>
<style scoped>
  /* 页面样式 */
</style>
```

### formitems 
+ 表单,使用数据模型
```
<template>
<div class="loginBox">
  <formitems :models="models" ref="loginForm"></formitems>
  <button_ class="loginBtn" type="primary" size="default" :disabled="submiting" @click="submit">{{submiting ? '登录中...' : '登录'}}</button_>
</div>
</template>
<script type="text/javascript">
(function (G) {
  G.vue({
  "usingComponents": {
    "formitems":"/components/Form/Items/Items"
  },
  "navigationBarTitleText": "登录"
},{
    data:{
      models:{///数据模型
        userName:{
          type: 'input',
          label: '用户名',
          rule: { NotNull: true }
        },
        passWord:{
          label: '密码',
          type: 'input',
          attr: { type: 'password' },
          rule: { NotNull: true }
        }
      },
      submiting: false
    },
    methods:{
      submit(){
        var data = this.selectComponent('#loginForm').submit();
        if(!data) return false;
        data.passWord = G.MD5(data.passWord);
        data.platform = G.platform;
        this.setData({submiting:true});
        G.post('/login',data).then(res => {
          this.setData({ submiting: false });
        })
      }
    }
  });
})(Y)

</script>
<style scoped>

</style>
```

### maxinput
+ 单个输入项,集合了多种方式输入，适用于除onlyselect、editor、table类型外所有的数据模型
+ 引入路径:"mixinput":"/components/Input/Mixinput/Mixinput"
```
///已本数据模型为例
item: {
    id:'title',
    label: '标题',///字段名称
    rule: { NotNull: true,MaxLength:18 },///表单校验规则
    attr:{///输入项其他属性
      type:'text',
      placeholder:'请输入标题'///占位符
    },
    ///readOnly:true ///设置只读
    type: 'input'///字段输入类型，默认input
}
<mixinput :name="item.id" :type="item.type" :attr="item.attr" :read-only="item.readOnly" value="这是初始值" @change="change"></mixinput>
```

### onlyselect
+ 关联表选择，使用方式,引入路径:"mixinput":"/components/Input/OnlySelect/OnlySelect"
```
<onlyselect :skey="item.attr.skey" :sitem="item.attr.sitem" :name="item.id" :disabled="item.readOnly" :url="item.attr.url" :meth="item.attr.meth" :title="item.attr.title" :data="item.attr.data" :placeholder="item.attr.placeholder" :search-key="item.attr.searchKey" :search-regex="item.attr.searchRegex" :can-clear="item.attr.canClear" :vkey="item.attr.vkey" :value="1" @change="change"></onlyselect>
```

### webmappoint
+ 地图选点，使用方式,引入路径:"webmappoint":"/components/Input/Map/Point/Point"
+ [高德地图API](https://lbs.amap.com/demo/jsapi-v2/example/map-lifecycle/map-show)
```
<webmappoint ref="testmap" :index="index" :name="item.id" :disabled="item.readOnly" :attr="item.attr" value="[[longitude,latitude]...]" @change="change" @click="mapClick"></webmappoint>
//获取地图原始对象,获取后使用高德API操作地图
this.$refs.testmap.map
```

### webmappolygon
+ 地图选区，使用方式,引入路径:"webmappolygon":"/components/Input/Map/Polygon/Polygon"
+ [高德地图API](https://lbs.amap.com/demo/jsapi-v2/example/map-lifecycle/map-show)
```
<webmappolygon ref="testmap" :index="index" :name="item.id" :disabled="_readOnly||item.readOnly" :attr="item.attr" :value="[[[longitude,latitude]...]...]" @change="change"></webmappolygon>
//获取地图原始对象,获取后使用高德API操作地图
this.$refs.testmap.map
```

### modal
+ 自定义内容弹框,引入路径:"modal":"/components/Modal/Modal"
```
<modal :confirm-box-style="contentStyle" title="新增内容" :visible="show" @success="submit" @fail="closeEdit">
  这是一个自定义内容弹出框
</modal>
```

### drawer
+ 自定义内容周边弹出层,引入路径:"drawer":"/components/Drawer/Drawer"
```
<drawer :content-style="drawerStyle" :visible="show" @close="openSearch">
  这是一个带透明背景的周边弹出层
</drawer>
```

## API

### 网络请求
```
G.get('{JAVAURL}/api',{id:1}).then(res => {
  if(!res.errorMsg){
    ///获取数据成功
  }
})

G.post('{JAVAURL}/api',{name:'张三',age:24}).then(res => {
  if(!res.errorMsg){
    ///新增数据成功
  }
})

G.put('{JAVAURL}/api',{id:1,name:'张三',age:26}).then(res => {
  if(!res.errorMsg){
    ///修改数据成功
  }
})

G.delete(`{JAVAURL}/api/${id}`).then(res => {
  if(!res.errorMsg){
    ///删除数据成功
  }
})

```

### 页面跳转
```
///html中跳转
<div @click="$go" :data-url="'/pages/user/detail' + id">跳转详情</div>
///js中跳转
G.$go(`/pages/user/detail?id=${id}`)

///html中跳转
<div @click="$back">返回上一页</div>
///js中跳转
G.$back()

```

### 弹框
```
G.alert('我是确定弹框').then(()=>{
  ///弹出后逻辑
  G.confirm('我是提示弹框').then(()=>{
    ///弹出后逻辑
    console.log('用户选择了确定')
  }).catch(()=>{
    console.log('用户选择了取消')
  })
})

```

### 黑色限时提示框
```
G.toask('这是错误的')

```

## tool.js API

[https://gitee.com/yfly666/tools](https://gitee.com/yfly666/tools)
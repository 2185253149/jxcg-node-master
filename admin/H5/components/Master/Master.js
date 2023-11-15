(function (G) {
  var webMaster;
  window["components_Master_Master"]({
  "component": true,
  "usingComponents": {
    "drawer":"/components/Drawer/Drawer"
  }
},{
template:'#TEMPLATE_components_Master_Master',

    options: {
      multipleSlots: true
    },
    props: {
      title: {
        type: String,
        default: ''
      },
      showTop:{
        type:Boolean,
        default:true
      },
      webMaster:{
        type:Boolean,
        default:false
      },
      name:{
        type:String,
        default:''
      }
    },
    data:function(){
      return {
        tree:[],
        show: G.platform != 'Web' ? false : (G.Storage.get('menushow') == undefined ? true : G.Storage.get('menushow')),
        userShow:false,
        userInfo:{},
        platform: G.platform,
        drawerStyle:'',
        userDrawerStyle:'',
        groupId:'',
        checkedId:'',
        timer:0
      }
    },
    methods: {
      logout:function(){
        G.confirmx('确定退出登录?', function () {
          G.ajax('/logout', function (ret) {
            if (!ret.errorMsg) {
              G.Storage.remove('user');
              G.Storage.remove('userInfo');
              G.reEnter('/pages/login/login');
            }
          })
        })
      },
      changePassWord:function(){
        G.$go('/pages/user/passWord/passWord?userName=' + this.getData('userInfo').userName)
      },
      changeGroup:function(event){
        var groupId = event.currentTarget.dataset.id,activeGroupId = this.getData('groupId');
        if (activeGroupId != groupId){
          G.Storage.set('groupId', groupId);
          G.Storage.get('autoLogin')(function(){
            G.reEnter('/pages/index/index');
          })
        }
      },
      openMenus:function(event){
        var _this = this,tree = this.getData('tree'), show = this.getData('show');
        if (tree.length) {
          G.Storage.set('menushow', !show);
          G.setStore('masters',{ show: !show });
        }else{
          G.alertx('无可用菜单');
        }
      },
      openUser:function(){
        var userShow = this.getData('userShow');
        this.setData({ userShow: !userShow });
      },
      openMenu:function(event){
        var tree = this.getData('tree');
        var index = event.currentTarget.dataset.index.toString().split(','), data = tree[index[0]];
        for(var i = 1; i < index.length; i ++) data = data.children[index[i]];
        var checkedId;
        if(data.children.length){
          data.active = !data.active;
        }else{
          data.active = true;
          checkedId = data.id;
          G.$go(data.url,'redirectTo');
          if(G.platform != 'Web') this.setData({ show: false });
        }
        var changeData = {tree:tree};
        if(checkedId) {
          G.Storage.set('checkedId',checkedId);
          changeData.checkedId = checkedId;
        }
        G.setStore('masters',changeData);
      }
    },
    mounted:function(){
      if(G.platform == 'Web'){
        if(!webMaster){
          webMaster = true;
          G.body.appendChild(G.creatElement('div',{
            id:'webMaster',
            className:'Web',
            innerHTML:'<master :name="name" :title="title" :show-top="showTop" :web-master="webMaster"></master>'
          }))
          webMaster = new Vue({
            el:'#webMaster',
            data:{
              name:G.Storage.get('AppConfig').window.navigationBarTitleText || '',
              title:'',
              showTop:true,
              webMaster:true
            }
          })
        }
      }
      var data = this.getStore('masters',{
        groupId:1,
        userInfo:0,
        tree:'menuTree',
        checkedId:0,
        show:'menushow'
      });
      switch (G.platform){
        case 'Web':
          data.drawerStyle = 'left:0px;top:48px;right:auto;width:200px;background:rgb(56, 56, 56);'
          data.userDrawerStyle = 'left:auto;right:8px;top:56px;bottom:auto;min-width:120px;';
          break;
        case 'iOS':
        case 'Android':
          data.drawerStyle = G.computStyle('left:0px;top:96px;right:300px;bottom:0px;background:rgb(56, 56, 56);');
          data.userDrawerStyle = G.computStyle('left:300px;right:0px;top:96px;bottom:0px;');
          break;
        default:
          data.drawerStyle = 'left:0rpx;top:96rpx;right:300rpx;bottom:0rpx;background:rgb(56, 56, 56);'
          data.userDrawerStyle = 'left:300rpx;right:0rpx;top:96rpx;bottom:0rpx;';
          break;
      }
      data.show = G.platform != 'Web' ? false : true;
      this.setData(data);
    }
  })
})(Y)

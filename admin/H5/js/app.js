//require('./utils/index.js');
//require('./config.js');
(function(G) {
  G.App({
  "pages": [
    "pages/index/index",
    "pages/login/login",
    "pages/login/hw",
    "pages/err/err",
    "components/Master/Master",
    "components/Drawer/Drawer",
    "components/Input/Checkbox/Checkbox",
    "components/Input/Number/Number",
    "components/Input/Mixinput/Mixinput",
    "components/Input/OnlySelect/OnlySelect",
    "components/Input/AnySelect/AnySelect",
    "components/Input/Editor/Editor",
    "components/Input/Region/Region",
    "components/List/Status/Status",
    "components/List/Page/Page",
    "components/Form/Items/Items",
    "components/Modal/Modal",
    "pages/configuration/list/list",
    "pages/menu/list/list",
    "pages/model/list/list",
    "pages/model/edit/edit",
    "pages/user/list/list",
    "pages/user/group/group",
    "pages/group/list/list",
    "pages/group/menu/menu",
    "pages/unit/list/list",
    "pages/unit/user/user",
    "pages/user/passWord/passWord",
    "pages/alumni/list/list",
    "pages/alumni/member/list",
    "pages/map/map",
    "pages/map/mapss"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "教学成果奖录入",
    "navigationBarTextStyle": "black"
  },
  "sitemapLocation": "sitemap.json",
  "Web": {
    "defaultPage": "pages/menu/list/list"
  }
},{
    onError: function(error) {
      //G.reEnter('/pages/err/err?msg=系统错误,请退出微信重试!\r\n' + error);
    },
    onLogin: '/pages/login/login',
    autoLogin: function(success, fail) {
      try {
        var user = G.Storage.get('user', 1),
          groupId = G.Storage.get('groupId', 1);
        if (!user) {
          fail();
          return false;
        }
        user = JSON.parse(user);
        user.userId = user.userId || user.id;
        user.photo = typeof user.photo == 'string' && user.photo.charAt(0) === '/' ? G.Storage.get('APIURL') + user.photo : user.photo;
        G.Storage.set('userInfo', user);
        G.Storage.set('ajaxHeader', [{
            key: 'token',
            value:user.token
          },
        ], {
          type: 2
        })
        var tree = {
          '0': {
            children: [],
            active: false
          }
        }
        if (groupId){
          G.ajax('/api/model/group_menu', function (ret) {
            if (ret.errorMsg) {
              G.reEnter('/pages/err/err?msg=' + ret.errorMsg);
              return false;
            }
            var checkedId, location = G.location();
            console.log('ret:',ret);
            for (var i = 0; i < ret.length; i++) {
              ret[i].parentId = ret[i].parentId || '0';
              ret[i].children = [];
              if ((ret[i].url == location) || (!checkedId && ret[i].url)) {
                checkedId = ret[i].id;
                if (tree[ret[i].parentId]) tree[ret[i].parentId].active = true;
                if (tree[tree[ret[i].parentId].parentId]) tree[tree[ret[i].parentId].parentId].active = true;
              }
              ret[i].active = false;
              tree[ret[i].id] = ret[i];
              if (tree[ret[i].parentId]) tree[ret[i].parentId].children.push(ret[i]);
            }
            G.Storage.set('menuTree', tree['0'].children);
            G.setStore('masters', { show: G.platform == 'Web' ,checkedId: checkedId, tree: tree['0'].children, userInfo: user, groupId: groupId });
            success();
          }, {
              data: {
                groupId: groupId,
                unitId:'all',
                sql: 'app_group_menu'
              }
            })
        }else{
          G.Storage.set('menuTree', tree['0'].children);
          G.setStore('masters', { userInfo: user });
          success();
        }
      } catch (e) {
        fail(e);
      }
    },
    Interceptor: function(data, next) {
      var _this = this;
      switch (data.code) {
        case 400:
          G.Storage.remove('user', 1);
          G.Storage.get('autoLogin')(function() {
            _this.action();
          })
          break;
        default:
          if (data.errMsg) data.errorMsg = data.errMsg;
          next(data);
          break;
      }
    }
  })
})(Y)
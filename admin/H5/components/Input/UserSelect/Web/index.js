(function (G) {
    window["components_Input_UserSelect_Web_index"]({
        "component": true,
        "usingComponents": {}
    }, {
        template: '#TEMPLATE_components_Input_UserSelect_Web_index',

        props: {
            name: {
                type: String,
                default: G.guid()
            },
            index: {
                type: Number
            },
            disabled: {
                type: Boolean,
                default: true
            },
            value: {
                type: String,
                default: {},
                observer: function (newValue, oldValue) {
                    this.filter(newValue);
                }
            },
            item:{
                type: Object,
                default: {},
            },
            attr: {
                type: Object,
                default: {}
            }
        },
        data: function () {
            return {
                dialogVisible: false,
                activeName: 'unit',
                value1: {},
                tableData: [],
                users: [],
                userObj:{},
                groupValue: '',
                groups: [],
                unitValue: 'hw',
                units: [],
                nameValue: '',
                multipleSelection: [],
                showValue:'请选择',
                max:1
            }
        },
        mounted: function () {
            let attr = this.getData('attr')
            this.max = attr.max || 1
            this.filter(this.getData('value'))
        },
        methods: {
            filter(value){
                let attr = this.getData('attr')
                let max = attr.max || 1
                let item = this.getData('item')
                if(value == this.multipleSelection) return
                if(max == 1){
                    this.multipleSelection = value
                    this.showValue = item[attr.skey || 'userName'] || attr.placeholder || '请选择'
                }else{
                    let users = G.string(value).parse([])
                    this.multipleSelection = []
                    for(let i = 0; i < users.length; i ++){
                        this.multipleSelection.push(users[i].value)
                    }
                    this.showValue = '选中' + this.multipleSelection.length + '人'
                }
            },
            open(value) {
                if(value) {
                    this.filter(value)
                }else{
                    this.multipleSelection = []
                }
                this.dialogVisible = true
                if (!this.groups.length) {
                    G.get('/api/model/group').then(groups => {
                        this.groups = groups
                        this.groupValue = groups[0].id
                        G.get('/api/model/hw_res_enterprise').then(units => {
                            this.units = units
                            this.getList()
                        })
                    })
                } else {
                    this.getList()
                }
            },
            searchName() {
                let tableData = [], reg = new RegExp(this.nameValue)
                for (let i = 0; i < this.users.length; i++) {
                    if (reg.test(this.users[i].name)) tableData.push(this.users[i])
                }
                this.tableData = tableData
            },
            getList() {
                let query = {}
                let multipleSelection = []
                this.nameValue = ''
                for (let i = 0; i < this.multipleSelection.length; i++) {
                    multipleSelection.push(this.multipleSelection[i])
                }
                if (this.activeName == 'group') {
                    if (this.groupValue) query.groupId = this.groupValue
                    G.get('/api/model/group_user?sql=userselect_group_user', query).then(users => {
                        let _users = []
                        for(let i = 0; i < users.length; i ++){
                            let user = {value:users[i].userId,name:users[i].userName,unitId:users[i].userUnitId}
                            this.userObj[user.value] = user
                            _users.push(user)
                        }
                        this.tableData = _users
                        this.users = _users
                    })
                } else if (this.activeName == 'unit') {
                    if (this.unitValue) query.enterpriceId = this.unitValue
                    G.get('/api/model/user', query).then(users => {
                        let _users = []
                        for (let i = 0; i < users.length; i++) {
                            let user = {value:users[i].id,name:users[i].name,unitId:users[i].unitId}
                            this.userObj[user.value] = user
                            _users.push(user)
                        }
                        this.tableData = _users
                        this.users = _users
                    })
                }
            },
            sizeChange(pageSize) {
                this.params.pageSize = pageSize
                this.params.pageNum = 1
                this.getList()
            },
            currentChange(pageNum) {
                this.params.pageNum = pageNum;
                this.getList()
            },
            change(event) {
                if(this.max == 1){
                    this.showValue = this.userObj[this.multipleSelection].name
                    this.triggerEvent('change', { index: this.getData('index'), id: this.getData('name'), event, value: this.multipleSelection })
                    this.triggerEvent('input', { index: this.getData('index'), id: this.getData('name'), event, value: this.multipleSelection })
                }else{
                    let users = []
                    for(let i = 0; i < this.multipleSelection.length; i ++){
                        let user = this.userObj[this.multipleSelection[i]]
                        if(user) users.push(user)
                    }
                    this.showValue = '选中' + this.multipleSelection.length + '人'
                    users = JSON.stringify(users)
                    this.triggerEvent('change', { index: this.getData('index'), id: this.getData('name'), event, value: users })
                    this.triggerEvent('input', { index: this.getData('index'), id: this.getData('name'), event, value: users })
                }
                this.dialogVisible = false
            }
        }
    })
})(Y)
module.exports = {
    TABLE_NICK_NAME:'文章',
    TABLE_DESC:'包括了文章、新闻、通知、公告',
    img: {
        label: '头图',
        attr: {
            width: 801,
            height: 535
        },
        type: 'image'
    },
    title: {
        label: '标题',
        rule: { NotNull: true },
        allWidth: true,
        // unList: true,
        type: 'input'
    },
    type:{
        label:'类型',
        defaultValue:'article',
        unList:true,
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
    digest: {
        label: '摘要',
        unList: true,
        type: 'textarea'
    },
    time: {
        label: '时间',
        type: 'date'
    },
    userId: {
        label:'发布人',
        unList: true,
        attr:{
            type:'userselect',
        },
        type:'customer'
    },
    author: {
        label: '作者',
        type:'input'
    },
    content: {
        label: '内容',
        rule: { NotNull: true },
        unList: true,
        attr: {
            file: true
        },
        type: 'editor'
    },
    hot: {
        label: '热点',
        defaultValue:1,
        type: 'switch'
    },
    status: {
        label: '启用',
        defaultValue:1,
        type: 'switch'
    },
    views:{
        label:'浏览量',
        defaultValue:0,
        rule:{PositiveNum: true},
        unList:true
    }
}